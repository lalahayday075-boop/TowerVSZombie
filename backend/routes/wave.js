// backend/routes/wave.js
import { Router } from "express";
import { toClientState, withPlayerLock } from "../playerState.js";
import { generateWave } from "../../scr/systems/waveGenerator.js";
import { calcRewardByWave, calcExpFromReward } from "../../scr/systems/waveScaling.js";
import { refreshAndPersistUnlocks } from "../unlocks.js";
import { asyncHandler } from "../asyncHandler.js";

export const waveRouter = Router();

// เดิม (client-only) ใช้สุ่มดรอปเพชรต่อตัวตอนฆ่า — ที่นี่ทำสูตรเดียวกันแบบ pure function
// (คัดลอกมาจาก src/systems/dropSystem.js เพราะไฟล์นั้นมี DOM-related popup class ปนอยู่ ไม่สะดวก import ตรงๆ)
function rollDiamondDrop(isBoss) {
  const r = Math.random() * 100;
  if (!isBoss) {
    if (r < 83) return 0;
    if (r < 93) return 1;
    if (r < 98) return 2;
    if (r < 99.99) return 3;
    return 5;
  } else {
    if (r < 70) return 0;
    if (r < 91) return 1;
    if (r < 96) return 2;
    if (r < 99) return 3;
    if (r < 99.999) return 5;
    return 10;
  }
}

// เริ่มเวฟ: server สร้างองค์ประกอบศัตรู (จำนวน/HP/speed/damage) ตามเวฟปัจจุบันของผู้เล่น
// แล้วเก็บไว้เป็น "active_wave" ผูกกับผู้เล่นคนนี้ — ตอนจบเวฟจะคำนวณรางวัลจากชุดนี้เท่านั้น
// ไคลเอนต์เปลี่ยนตัวเลข HP/จำนวนเองไม่ได้เพราะรางวัลไม่ได้อิงจากสิ่งที่ไคลเอนต์ส่งมา
waveRouter.post("/wave/start", asyncHandler(async (req, res) => {
  const result = await withPlayerLock(req.playerId, async (client, row) => {
    if (!row) return { status: 404, body: { error: "ไม่พบผู้เล่น" } };

    const waveNumber = row.wave;
    const data = generateWave(waveNumber);
    const activeWave = {
      wave: waveNumber,
      enemies: data.enemies,
      issuedAt: Date.now(),
    };

    await client.query("UPDATE players SET active_wave = $1, updated_at = now() WHERE id = $2", [
      JSON.stringify(activeWave),
      req.playerId,
    ]);

    return { status: 200, body: { wave: waveNumber, enemies: data.enemies } };
  });

  res.status(result.status).json(result.body);
}));

// ฆ่าซอมบี้ 1 ตัวจริง (ระหว่างเล่น): จ่ายเงิน/เพชร/exp ทันทีที่ตายจริง ไม่ต้องรอจบเวฟ
// groupIndex คือ index ของกลุ่มศัตรูใน active_wave.enemies ที่ server ออกให้ตอน /wave/start
// server เป็นคนสุ่ม/คำนวณรางวัลเอง (ไคลเอนต์ส่งมาแค่ "ตัวไหนตาย" ไม่ส่งจำนวนเงินมาเอง)
// นับจำนวนที่จ่ายไปแล้วต่อกลุ่ม (killed) กันไม่ให้กลุ่มเดียวถูกเคลมเกินจำนวนจริงของมัน (count)
// และกันเรียกรัวเกินจริง (เร็วกว่าที่เป็นไปได้) ด้วย pacing check แบบหยาบๆ เทียบกับเวลาที่เริ่มเวฟ
waveRouter.post("/wave/kill", asyncHandler(async (req, res) => {
  const { groupIndex } = req.body;

  const result = await withPlayerLock(req.playerId, async (client, row) => {
    if (!row) return { status: 404, body: { error: "ไม่พบผู้เล่น" } };
    if (!row.active_wave) {
      return { status: 400, body: { error: "ไม่มีเวฟที่กำลังเล่นอยู่ กรุณาเริ่มเวฟใหม่ (/wave/start)" } };
    }

    const activeWave = row.active_wave;
    const group = Number.isInteger(groupIndex) ? activeWave.enemies[groupIndex] : null;
    if (!group) return { status: 400, body: { error: "groupIndex ไม่ถูกต้อง" } };

    const killedSoFar = activeWave.enemies.reduce((sum, e) => sum + (e.killed || 0), 0);
    if ((group.killed || 0) >= group.count) {
      return { status: 400, body: { error: "ซอมบี้กลุ่มนี้ถูกฆ่าครบจำนวนไปแล้ว" } };
    }

    // pacing เฉลี่ยอย่างน้อย ~100ms/ตัว นับจากตอนเริ่มเวฟ กันเรียก endpoint นี้รัวๆ เอาเงินฟรีเกินจริง
    const elapsed = Date.now() - (activeWave.issuedAt || 0);
    if (elapsed < killedSoFar * 100) {
      return { status: 429, body: { error: "เร็วเกินไป ลองใหม่อีกครั้ง" } };
    }

    const rewardMoney = calcRewardByWave(group.rewardWave ?? activeWave.wave, group.rewardIsBoss ?? false);
    const rewardDiamonds = rollDiamondDrop(group.rewardIsBoss ?? false);
    const rewardExp = calcExpFromReward(rewardMoney, group.rewardIsBoss ?? false);

    group.killed = (group.killed || 0) + 1;

    let newExp = Number(row.exp) + rewardExp;
    let newLevel = row.level;
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
    }

    const updated = await client.query(
      `UPDATE players SET
         money = money + $1,
         diamonds = diamonds + $2,
         total_money_earned = total_money_earned + $1,
         total_zombies_killed = total_zombies_killed + 1,
         exp = $3,
         level = $4,
         active_wave = $5,
         updated_at = now()
       WHERE id = $6
       RETURNING *`,
      [rewardMoney, rewardDiamonds, newExp, newLevel, JSON.stringify(activeWave), req.playerId]
    );

    return {
      status: 200,
      body: {
        rewardMoney,
        rewardDiamonds,
        rewardExp,
        state: toClientState(updated.rows[0]),
      },
    };
  });

  res.status(result.status).json(result.body);
}));

// จบเวฟสำเร็จ: เงิน/เพชร/exp ของซอมบี้แต่ละตัวจ่ายไปแล้วทีละตัวผ่าน /wave/kill ตอนตายจริง
// ตรงนี้แค่ "เก็บตก" ให้กลุ่มที่ยังจ่ายไม่ครบ (เช่นปุ่ม dev "ชนะเวฟทันที" ที่ข้ามการต่อสู้จริง
// หรือกรณี /wave/kill บางตัวเรียกไม่สำเร็จเพราะเน็ตสะดุด) แล้วค่อยเลื่อนเวฟถัดไป
waveRouter.post("/wave/complete", asyncHandler(async (req, res) => {
  const result = await withPlayerLock(req.playerId, async (client, row) => {
    if (!row) return { status: 404, body: { error: "ไม่พบผู้เล่น" } };
    if (!row.active_wave) {
      return { status: 400, body: { error: "ไม่มีเวฟที่กำลังเล่นอยู่ กรุณาเริ่มเวฟใหม่ (/wave/start)" } };
    }

    const activeWave = row.active_wave;

    // กันเรียก /wave/complete ทันทีโดยไม่เล่นจริง — ประเมินเวลาขั้นต่ำที่เป็นไปได้แบบหยาบๆ
    // จากจำนวนศัตรู (ไม่ใช่การตรวจจับสมบูรณ์แบบ แต่ปิดกรณีเรียกรัวๆ เอาเงินฟรีได้)
    const totalEnemyCount = activeWave.enemies.reduce((sum, e) => sum + e.count, 0);
    const minPlausibleMs = Math.max(2000, totalEnemyCount * 150);
    const elapsed = Date.now() - (activeWave.issuedAt || 0);
    if (elapsed < minPlausibleMs) {
      return { status: 400, body: { error: "เวฟนี้ยังเล่นไม่ถึงเวลาที่เป็นไปได้ ลองใหม่อีกครั้ง" } };
    }

    let leftoverMoney = 0;
    let leftoverDiamonds = 0;
    let leftoverKilled = 0;
    let leftoverExp = 0;

    for (const e of activeWave.enemies) {
      const remaining = e.count - (e.killed || 0);
      for (let i = 0; i < remaining; i++) {
        const m = calcRewardByWave(e.rewardWave ?? activeWave.wave, e.rewardIsBoss ?? false);
        leftoverMoney += m;
        leftoverDiamonds += rollDiamondDrop(e.rewardIsBoss ?? false);
        leftoverExp += calcExpFromReward(m, e.rewardIsBoss ?? false);
        leftoverKilled++;
      }
      e.killed = e.count;
    }

    const newWave = activeWave.wave + 1;

    let newExp = Number(row.exp) + leftoverExp;
    let newLevel = row.level;
    while (newExp >= newLevel * 100) {
      newExp -= newLevel * 100;
      newLevel++;
    }

    const updated = await client.query(
      `UPDATE players SET
         money = money + $1,
         diamonds = diamonds + $2,
         total_money_earned = total_money_earned + $1,
         total_zombies_killed = total_zombies_killed + $3,
         wave = $4,
         best_wave = GREATEST(best_wave, $4),
         exp = $5,
         level = $6,
         active_wave = NULL,
         updated_at = now()
       WHERE id = $7
       RETURNING *`,
      [leftoverMoney, leftoverDiamonds, leftoverKilled, newWave, newExp, newLevel, req.playerId]
    );

    return {
      status: 200,
      body: { rewardMoney: leftoverMoney, rewardDiamonds: leftoverDiamonds, rewardExp: leftoverExp },
      row: updated.rows[0],
    };
  });

  if (result.status !== 200) return res.status(result.status).json(result.body);

  const refreshed = await refreshAndPersistUnlocks(result.row);
  res.json({ ...result.body, state: toClientState(refreshed) });
}));

// เวฟล้มเหลว (เวลาหมด/ป้อมตายหมด): ถอยกลับ 1 เวฟเหมือนของเดิม เงินที่ฆ่าได้ระหว่างเวฟนี้
// (จ่ายไปแล้วทีละตัวผ่าน /wave/kill ตอนตายจริง) ยังเป็นของผู้เล่นอยู่ ไม่ถูกริบคืน — แค่ไม่ได้รางวัลก้อนโบนัสจบเวฟ
waveRouter.post("/wave/fail", asyncHandler(async (req, res) => {
  const result = await withPlayerLock(req.playerId, async (client, row) => {
    if (!row) return { status: 404, body: { error: "ไม่พบผู้เล่น" } };

    const newWave = Math.max(1, row.wave - 1);
    const updated = await client.query(
      "UPDATE players SET wave = $1, active_wave = NULL, updated_at = now() WHERE id = $2 RETURNING *",
      [newWave, req.playerId]
    );

    return { status: 200, body: { state: toClientState(updated.rows[0]) } };
  });

  res.status(result.status).json(result.body);
}));
