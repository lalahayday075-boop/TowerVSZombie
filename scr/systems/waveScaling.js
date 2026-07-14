// src/systems/waveScaling.js
import { ENEMY_BASE, REWARD_TABLE } from "../data/waveConfig.js";

export function calcSpeed(base, wave, scale, max) {
  return Math.min(base + wave * scale, max);
}

export function countByWave(wave, startWave, base, every, max) {
  if (wave < startWave) return 0;
  const count = base + Math.floor((wave - startWave) / every);
  return max != null ? Math.min(count, max) : count;
}

export function getEnemyStats(key, wave) {
  const base = ENEMY_BASE[key];
  const damage = base.dmg + wave * 0.5;
  const hp = damage * base.hpMul;
  return { damage, hp };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calcRewardByWave(wave, isBoss = false) {
  const tier = REWARD_TABLE.find(t => wave >= t.from && wave <= t.to);
  if (!tier) return 1;
  let reward = randInt(tier.min, tier.max);
  if (isBoss) reward *= 3;
  return reward;
}

export function calcExpFromReward(reward, isBoss) {
  let exp = reward * 0.3;
  if (isBoss) exp *= 2;
  return Math.floor(exp);
}
