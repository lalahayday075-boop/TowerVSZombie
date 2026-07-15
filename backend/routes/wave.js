// backend/routes/wave.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { generateWave } from "../../src/systems/waveGenerator.js";
import { calcRewardByWave, calcExpFromReward } from "../../src/systems/waveScaling.js";
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
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const waveNumber = row.wave;
  const data = generateWave(waveNumber);
  const activeWave = {
    wave: waveNumber,
    enemies: data.enemies,
    issuedAt: Date.now(),
  };

  await pool.query("UPDATE players SET active_wave = $1, updated_at = now() WHERE id = $2", [
    JSON.stringify(activeWave),
    req.playerId,
  ]);

  res.json({ wave: waveNumber, enemies: data.enemies });
}));

// จบเวฟสำเร็จ: คำนวณรางวัลรวมจาก active_wave ที่ server ออกให้ไปก่อนหน้านี้เท่านั้น
// (สูตรเดียวกับ clearWaveInstantFull ฝั่ง client แต่รันที่ server เป็นตัวจริง)
waveRouter.post("/wave/complete", asyncHandler(async (req, res) => {
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });
  if (!row.active_wave) return res.status(400).json({ error: "ไม่มีเวฟที่กำลังเล่นอยู่ กรุณาเริ่มเวฟใหม่ (/wave/start)" });

  const activeWave = row.active_wave;

  // กันเรียก /wave/complete ทันทีโดยไม่เล่นจริง — ประเมินเวลาขั้นต่ำที่เป็นไปได้แบบหยาบๆ
  // จากจำนวนศัตรู (ไม่ใช่การตรวจจับสมบูรณ์แบบ แต่ปิดกรณีเรียกรัวๆ เอาเงินฟรีได้)
  const totalEnemyCount = activeWave.enemies.reduce((sum, e) => sum + e.count, 0);
  const minPlausibleMs = Math.max(2000, totalEnemyCount * 150);
  const elapsed = Date.now() - (activeWave.issuedAt || 0);
  if (elapsed < minPlausibleMs) {
    return res.status(400).json({ error: "เวฟนี้ยังเล่นไม่ถึงเวลาที่เป็นไปได้ ลองใหม่อีกครั้ง" });
  }

  let totalMoney = 0;
  let totalDiamonds = 0;
  let totalKilled = 0;

  for (const e of activeWave.enemies) {
    for (let i = 0; i < e.count; i++) {
      totalMoney += calcRewardByWave(e.rewardWave ?? activeWave.wave, e.rewardIsBoss ?? false);
      totalDiamonds += rollDiamondDrop(e.rewardIsBoss ?? false);
      totalKilled++;
    }
  }

  const totalExp = calcExpFromReward(totalMoney, false);
  const newWave = activeWave.wave + 1;

  let newExp = Number(row.exp) + totalExp;
  let newLevel = row.level;
  while (newExp >= newLevel * 100) {
    newExp -= newLevel * 100;
    newLevel++;
  }

  const updated = await pool.query(
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
    [totalMoney, totalDiamonds, totalKilled, newWave, newExp, newLevel, req.playerId]
  );

  const refreshed = await refreshAndPersistUnlocks(updated.rows[0]);

  res.json({
    rewardMoney: totalMoney,
    rewardDiamonds: totalDiamonds,
    rewardExp: totalExp,
    state: toClientState(refreshed),
  });
}));

// เวฟล้มเหลว (เวลาหมด/ป้อมตายหมด): ถอยกลับ 1 เวฟเหมือนของเดิม ไม่ได้รางวัล
waveRouter.post("/wave/fail", asyncHandler(async (req, res) => {
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const newWave = Math.max(1, row.wave - 1);
  const updated = await pool.query(
    "UPDATE players SET wave = $1, active_wave = NULL, updated_at = now() WHERE id = $2 RETURNING *",
    [newWave, req.playerId]
  );

  res.json({ state: toClientState(updated.rows[0]) });
}));
