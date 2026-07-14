// src/systems/zombieRuntime.js
import { state } from "../core/state.js";
import { canvasRef } from "../core/canvasRef.js";
import { playerData } from "./playerData.js";
import { updateZombieUI, updateUI } from "../ui/hud.js";
import { spawnDamage, addExp } from "./damageSystem.js";
import { calcExpFromReward } from "./waveScaling.js";
import { rollDiamondDrop, MoneyPopup, DiamondPopup, moneyPopups, diamondPopups } from "./dropSystem.js";
import { checkMapUnlock, checkZombieSkinUnlock, checkSkinUnlocks } from "./unlockSystem.js";

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
      updateZombieUI();

      state.money += z.reward;
      moneyPopups.push(new MoneyPopup(z.x, z.y, z.reward));
      playerData.totalMoneyEarned += z.reward;
      state.totalZombiesKilled++;

      checkMapUnlock();
      checkZombieSkinUnlock();
      checkSkinUnlocks();

      const expGain = calcExpFromReward(z.reward, z.isBoss);
      addExp(expGain);
      spawnDamage(z.x, z.y - 15, `+${expGain} EXP`, "exp");

      const drop = rollDiamondDrop(z.isBoss);
      if (drop > 0) {
        state.diamonds += drop;
        diamondPopups.push(new DiamondPopup(z.x, z.y - 10, drop));
      }

      updateUI();
    }
  }
}
