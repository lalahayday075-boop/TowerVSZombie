// src/data/waveConfig.js
export const ENEMY_BASE = {
  ground_melee: { dmg: 9, hpMul: 16 },
  air_melee: { dmg: 15, hpMul: 8 },
  air_ranged: { dmg: 20, hpMul: 3.5 },
  ground_ranged: { dmg: 10, hpMul: 8.5 },
  ground_lightning: { dmg: 15, hpMul: 3.3 },
  air_lightning: { dmg: 18, hpMul: 2.5 },
  boss_ground: { dmg: 51, hpMul: 58.8 },
  boss_air: { dmg: 66, hpMul: 43.8 },
};

// หมายเหตุ: ช่วง 21-40 ของเดิมคือ 110-160 (พุ่งผิดปกติแล้วร่วงกลับที่ 41-60) — ดู AUDIT.md ข้อ 6
// ปรับให้ไล่ระดับต่อเนื่องแทน ค่าอื่นคงเดิมทั้งหมด
export const REWARD_TABLE = [
  { from: 1, to: 5, min: 15, max: 20 },
  { from: 6, to: 10, min: 17, max: 23 },
  { from: 11, to: 20, min: 20, max: 25 },
  { from: 21, to: 40, min: 22, max: 28 },
  { from: 41, to: 60, min: 16, max: 30 },
  { from: 61, to: 90, min: 30, max: 60 },
  { from: 91, to: 120, min: 60, max: 120 },
  { from: 121, to: 150, min: 120, max: 240 },
  { from: 151, to: 180, min: 240, max: 500 },
  { from: 181, to: 220, min: 500, max: 900 },
  { from: 221, to: 9999, min: 900, max: 1600 },
];
