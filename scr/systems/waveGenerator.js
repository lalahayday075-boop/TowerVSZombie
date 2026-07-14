// src/systems/waveGenerator.js
import { calcSpeed, countByWave, getEnemyStats } from "./waveScaling.js";

export function generateWave(wave) {
  const enemies = [];
  const baseDelay = Math.max(0.9, 1.6 - Math.sqrt(wave) * 0.08);

  {
    const s = getEnemyStats("ground_melee", wave);
    enemies.push({
      type: "ground", attackMode: "melee",
      count: countByWave(wave, 1, 3, 11, 12),
      hp: s.hp, speed: calcSpeed(80, wave, 0.45, 230), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave >= 21) {
    const s = getEnemyStats("air_melee", wave);
    enemies.push({
      type: "air", attackMode: "melee",
      count: countByWave(wave, 21, 1, 22, 7),
      hp: s.hp, speed: calcSpeed(90, wave, 0.45, 240), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave >= 60) {
    const s = getEnemyStats("air_ranged", wave);
    enemies.push({
      type: "air", attackMode: "ranged",
      count: countByWave(wave, 60, 1, 60, 5),
      hp: s.hp, speed: calcSpeed(95, wave, 0.45, 245), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave >= 40) {
    const s = getEnemyStats("ground_ranged", wave);
    enemies.push({
      type: "ground", attackMode: "ranged",
      count: countByWave(wave, 40, 2, 40, 8),
      hp: s.hp, speed: calcSpeed(70, wave, 0.45, 200), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave >= 120) {
    const s = getEnemyStats("ground_lightning", wave);
    enemies.push({
      type: "ground", attackMode: "lightning",
      count: countByWave(wave, 100, 1, 100, 3),
      hp: s.hp, speed: calcSpeed(70, wave, 0.45, 220), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave >= 140) {
    const s = getEnemyStats("air_lightning", wave);
    enemies.push({
      type: "air", attackMode: "lightning",
      count: countByWave(wave, 130, 1, 120, 3),
      hp: s.hp, speed: calcSpeed(82, wave, 0.45, 232), damage: s.damage,
      rewardWave: wave, rewardIsBoss: false,
    });
  }

  if (wave % 10 === 0) {
    let bossType = "ground";
    if (wave > 30) {
      const cycle = Math.floor((wave - 10) / 10);
      bossType = (cycle % 2 === 0) ? "ground" : "air";
    }
    const key = bossType === "ground" ? "boss_ground" : "boss_air";
    const s = getEnemyStats(key, wave);

    enemies.push({
      type: bossType, isBoss: true, bossPhase: 1, count: 1,
      hp: s.hp,
      speed: calcSpeed(bossType === "ground" ? 60 : 70, wave, 0.45, bossType === "ground" ? 220 : 230),
      damage: s.damage, rewardWave: wave, rewardIsBoss: true,
    });
  }

  return {
    enemies,
    getSpawnDelay() {
      return baseDelay * (0.4 + Math.random() * 0.8);
    },
  };
}

export function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
