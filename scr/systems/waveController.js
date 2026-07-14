// src/systems/waveController.js
import { state, WAVE_TIME_LIMIT } from "../core/state.js";
import { playerData } from "./playerData.js";
import { generateWave, shuffleArray } from "./waveGenerator.js";
import { calcRewardByWave } from "./waveScaling.js";
import { rollDiamondDrop, MoneyPopup, DiamondPopup, moneyPopups, diamondPopups } from "./dropSystem.js";
import { Zombie } from "../entities/Zombie.js";
import { updateZombieUI, updateUI } from "../ui/hud.js";
import { canvasRef } from "../core/canvasRef.js";

export function failWave(onDone) {
  if (state.isGameOver) return;
  state.isGameOver = true;

  setTimeout(() => {
    state.wave = Math.max(1, state.wave - 1);
    resetWave();
    if (onDone) onDone();
  }, 500);
}

export function resetWave() {
  state.bullets.length = 0;
  state.zombies.length = 0;
  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  updateZombieUI();

  for (const t of state.towers) {
    t.dead = false;
    t.destroying = false;
    t.destroyAnim = 0;
    t.shake = 0;
    t.respawnProgress = 1;
    t.spawnAnim = 1;
    t.hp = t.maxHp;
    t.cooldown = 0;
    t.angle = t.spawnAngle;
  }

  for (const slot of state.buildSlots) {
    if (slot.respawnTimer) {
      clearTimeout(slot.respawnTimer);
      slot.respawnTimer = null;
    }
    slot.respawning = false;
  }

  state.waveTimeLeft = WAVE_TIME_LIMIT;
  state.isGameOver = false;
  state.lastTime = performance.now();

  updateUI();
  spawnWave();
}

export function spawnWave() {
  if (state.spawnTimer) {
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
  }

  state.waveSpawning = true;
  const data = generateWave(state.wave);

  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  for (const e of data.enemies) state.zombiesTotalThisWave += e.count;

  updateZombieUI();
  if (state.wave > playerData.bestWave) playerData.bestWave = state.wave;

  const queue = [];
  data.enemies.forEach(e => {
    for (let i = 0; i < e.count; i++) queue.push({ ...e });
  });
  shuffleArray(queue);

  let index = 0;
  function spawnNext() {
    if (state.isGameOver || index >= queue.length) {
      state.spawnTimer = null;
      state.waveSpawning = false;
      return;
    }
    const e = queue[index++];
    const reward = calcRewardByWave(e.rewardWave, e.rewardIsBoss);

    state.zombies.push(new Zombie(e.type, e.hp, e.speed, e.damage, reward, e.isBoss || false, e.attackMode || "melee"));

    const delay = data.getSpawnDelay() * 900;
    state.spawnTimer = setTimeout(spawnNext, delay);
  }

  spawnNext();
}

// ปุ่ม dev "ชนะเวฟทันที": เคลียร์เวฟปัจจุบันพร้อมแจกรางวัลรวม แล้วไปเวฟถัดไปทันที
export function clearWaveInstantFull() {
  if (state.isGameOver) return;

  if (state.spawnTimer) {
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
  }
  state.waveSpawning = false;

  const data = generateWave(state.wave);
  let totalMoney = 0;
  let totalDiamonds = 0;

  for (const e of data.enemies) {
    for (let i = 0; i < e.count; i++) {
      totalMoney += calcRewardByWave(e.rewardWave ?? state.wave, e.rewardIsBoss ?? false);
      totalDiamonds += rollDiamondDrop(e.rewardIsBoss ?? false);
    }
  }

  state.money += totalMoney;
  state.diamonds += totalDiamonds;

  const { canvas } = canvasRef;
  if (totalMoney > 0) {
    moneyPopups.push(new MoneyPopup(canvas.width / 2, canvas.height / 2, totalMoney));
  }
  if (totalDiamonds > 0) {
    diamondPopups.push(new DiamondPopup(canvas.width / 2, canvas.height / 2 - 20, totalDiamonds));
  }

  state.zombies.length = 0;
  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  updateZombieUI();

  state.wave++;
  state.waveTimeLeft = WAVE_TIME_LIMIT;

  updateUI();
  spawnWave();

  return { totalMoney, totalDiamonds };
}
