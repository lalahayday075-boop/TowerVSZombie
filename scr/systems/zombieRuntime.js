// src/systems/zombieRuntime.js
import { state } from "../core/state.js";
import { canvasRef } from "../core/canvasRef.js";
import { playerData, savePlayerData } from "./playerData.js";
import { updateZombieUI, updateUI } from "../ui/hud.js";
import { spawnDamage, addExp } from "./damageSystem.js";
import { calcExpFromReward } from "./waveScaling.js";
import { rollDiamondDrop, MoneyPopup, DiamondPopup, moneyPopups, diamondPopups } from "./dropSystem.js";
import { api } from "./api.js";

// ซอมบี้ที่มาจากเวฟจริงมี groupIndex ผูกกับ active_wave ฝั่ง server — ยิง /wave/kill ไปขอเครดิต
// เงิน/เพชร/exp จริงทันที (server เป็นคนสุ่ม/คำนวณให้ ไม่ใช่ client เดาเอง) แล้วค่อยโชว์ popup
// ตามตัวเลขจริงที่ server ยืนยันกลับมา ไม่ใช่ preview ที่อาจไม่ตรงกับที่ได้จริงอีกต่อไป
async function creditRealKill(z) {
  let result;
  try {
    result = await api.killZombie(z.groupIndex);
  } catch (err) {
    console.error("[kill] ขอเครดิตเงินไม่สำเร็จ:", err.message);
    // ไม่ต้องกังวลว่าเงินจะหาย — /wave/complete จะเก็บตกให้ตอนจบเวฟ (ดูหมายเหตุใน backend/routes/wave.js)
    return;
  }

  state.money = result.state.money;
  state.confirmedMoney = result.state.money;
  state.diamonds = result.state.diamonds;
  state.confirmedDiamonds = result.state.diamonds;
  playerData.level = result.state.playerData.level;
  playerData.exp = result.state.playerData.exp;
  playerData.totalMoneyEarned = result.state.playerData.totalMoneyEarned;
  savePlayerData();

  moneyPopups.push(new MoneyPopup(z.x, z.y, result.rewardMoney));
  if (result.rewardDiamonds > 0) diamondPopups.push(new DiamondPopup(z.x, z.y - 10, result.rewardDiamonds));
  spawnDamage(z.x, z.y - 15, `+${result.rewardExp} EXP`, "exp");

  updateUI();
}

// ซอมบี้ที่มาจาก dev tool (ไม่มี groupIndex เพราะไม่ได้ผูกกับ active_wave จริงบน server)
// ให้คงพฤติกรรมเดิมไว้ (คำนวณ/โชว์เฉพาะฝั่ง client) เพราะเป็นแค่เครื่องมือทดสอบ ไม่ใช่เศรษฐกิจจริง
function creditDevOnlyKill(z) {
  state.money += z.reward;
  state.confirmedMoney = state.money;
  moneyPopups.push(new MoneyPopup(z.x, z.y, z.reward));
  playerData.totalMoneyEarned += z.reward;

  const expGain = calcExpFromReward(z.reward, z.isBoss);
  addExp(expGain);
  spawnDamage(z.x, z.y - 15, `+${expGain} EXP`, "exp");

  const drop = rollDiamondDrop(z.isBoss);
  if (drop > 0) {
    state.diamonds += drop;
    state.confirmedDiamonds = state.diamonds;
    diamondPopups.push(new DiamondPopup(z.x, z.y - 10, drop));
  }
}

export function drawZombiesLayer() {
  const { ctx } = canvasRef;
  const sorted = [...state.zombies].sort((a, b) => {
    if (a.moveType !== b.moveType) return a.moveType === "ground" ? -1 : 1;
    return a.y - b.y;
  });
  for (const z of sorted) {
    if (z.dead || z.hp <= 0) continue;
    z.draw(ctx);
  }
}

export function updateZombies(dt) {
  for (let i = state.zombies.length - 1; i >= 0; i--) {
    const z = state.zombies[i];

    if (z.isBoss && !z.dead) {
      if (z.bossPhase === 1 && z.hp <= z.maxHp * 0.5) {
        z.bossPhase = 2;
        z.speedMult = 1.25;
        z.updateSpeed();
      } else if (z.bossPhase === 2 && z.hp <= z.maxHp * 0.2) {
        z.bossPhase = 3;
        z.speedMult = 1.5;
        z.updateSpeed();
        z.attackDamage *= 1.3;
      }
    }

    if (z.dead) {
      state.zombies.splice(i, 1);
      continue;
    }

    z.update(dt);

    if (z.hp <= 0 && !z.dead) {
      z.dead = true;
      state.zombiesKilledThisWave++;
      state.totalZombiesKilled++;
      updateZombieUI();

      // หมายเหตุ: การปลดล็อกสกิน/ธีมแมพ/สกินซอมบี้ตอนนี้ server เป็นคนคำนวณให้อัตโนมัติ
      // ทุกครั้งที่ /wave/complete หรือ /state ถูกเรียก (ดู backend/unlocks.js) ไม่ต้องเช็คฝั่ง client อีก

      if (Number.isInteger(z.groupIndex)) {
        creditRealKill(z);
      } else {
        creditDevOnlyKill(z);
      }

      updateUI();
    }
  }
}
