// src/systems/waveGenerator.js
import { ENEMY_BASE } from "../data/waveConfig.js";
import { countByWave, getEnemyStats } from "./waveScaling.js";

const ATTACK_MODE_BY_KEY = {
  ground_melee: "melee", swarm_fast: "melee", air_melee: "melee", armored_ground: "melee",
  ground_ranged: "ranged", air_ranged: "ranged",
  ground_lightning: "lightning", air_lightning: "lightning",
};

function moveTypeOf(key) {
  return key.startsWith("air") || key === "boss_air" ? "air" : "ground";
}

export function generateWave(wave) {
  const enemies = [];
  const baseDelay = Math.max(0.75, 1.5 - Math.sqrt(wave) * 0.07);

  for (const key in ENEMY_BASE) {
    if (key === "boss_ground" || key === "boss_air") continue; // บอสจัดการแยกด้านล่าง (มาทุก 10 เวฟเท่านั้น)

    const cfg = ENEMY_BASE[key];
    const count = countByWave(wave, cfg);
    if (count <= 0) continue;

    const stats = getEnemyStats(key, wave);
    enemies.push({
      type: moveTypeOf(key),
      attackMode: ATTACK_MODE_BY_KEY[key],
      count,
      hp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      armor: stats.armor,
      rewardWave: wave,
      rewardIsBoss: false,
    });
  }

  if (wave % 10 === 0) {
    let bossKey = "boss_ground";
    if (wave >= ENEMY_BASE.boss_air.unlockWave) {
      const cycle = Math.floor((wave - ENEMY_BASE.boss_air.unlockWave) / 10);
      bossKey = cycle % 2 === 0 ? "boss_air" : "boss_ground";
    }
    const stats = getEnemyStats(bossKey, wave);
    enemies.push({
      type: moveTypeOf(bossKey),
      attackMode: "melee",
      isBoss: true,
      count: 1,
      hp: stats.hp,
      speed: stats.speed,
      damage: stats.damage,
      armor: stats.armor,
      rewardWave: wave,
      rewardIsBoss: true,
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
