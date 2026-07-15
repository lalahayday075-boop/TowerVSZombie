// src/systems/waveScaling.js
import { ENEMY_BASE, REWARD_CONFIG } from "../data/waveConfig.js";

// ไต่ความเร็วแบบเข้าใกล้เพดานเรื่อยๆ (asymptotic) แทนเส้นตรงที่พุ่งไม่หยุด — เกมยังเล่นได้จริงเวฟท้ายๆ
export function calcSpeed(base, max, wave, sharpness = 0.02) {
  return max - (max - base) * Math.exp(-sharpness * wave);
}

export function countByWave(wave, cfg) {
  if (wave < cfg.unlockWave) return 0;
  const steps = Math.floor((wave - cfg.unlockWave) / cfg.countEvery);
  return Math.min(cfg.countBase + steps, cfg.countMax);
}

export function getEnemyStats(key, wave) {
  const cfg = ENEMY_BASE[key];
  const hp = cfg.baseHp * Math.pow(cfg.hpGrowth, wave);
  const damage = cfg.baseDmg * Math.pow(cfg.dmgGrowth, wave);
  const speed = calcSpeed(cfg.baseSpeed, cfg.speedMax, wave);
  const armor = cfg.armorBase + Math.floor(wave / 10) * cfg.armorPer10;
  return { hp, damage, speed, armor };
}

function randRange(value, variance) {
  const factor = 1 + (Math.random() * 2 - 1) * variance;
  return Math.max(1, Math.round(value * factor));
}

export function calcRewardByWave(wave, isBoss = false) {
  const { baseReward, rewardMax, sharpness } = REWARD_CONFIG;
  const base = rewardMax - (rewardMax - baseReward) * Math.exp(-sharpness * wave);
  let reward = randRange(base, REWARD_CONFIG.rewardVariance);
  if (isBoss) reward *= REWARD_CONFIG.bossMultiplier;
  return reward;
}

export function calcExpFromReward(reward, isBoss) {
  let exp = reward * REWARD_CONFIG.expRatio;
  if (isBoss) exp *= 1.5;
  return Math.max(1, Math.floor(exp));
}
