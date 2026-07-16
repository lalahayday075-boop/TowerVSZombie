// src/data/waveConfig.js
// รื้อใหม่ทั้งหมดสำหรับบาลานซ์แบบ hardcore (ดู GAME_DESIGN.md สำหรับเหตุผลเบื้องหลังตัวเลข)
//
// เดิม: ตาราง REWARD_TABLE คงที่ + สูตร dmg/hp เชิงเส้นง่ายๆ ทำให้ทุกอย่างดูแบนราบ ไม่มีจังหวะกดดัน
// ใหม่: ทุกอย่างเป็นสูตรทวีคูณ (compound growth) ปรับจูนทีหลังง่ายแค่ขยับตัวเลขเดียว ไม่ต้องแก้ตาราง
//
// ฟิลด์ต่อประเภทศัตรู:
//   baseHp/hpGrowth      HP(wave) = baseHp * hpGrowth^wave
//   baseDmg/dmgGrowth    DMG(wave) = baseDmg * dmgGrowth^wave
//   baseSpeed/speedMax   ความเร็วไต่ขึ้นทีละน้อยจนถึงเพดาน (ดู waveScaling.calcSpeed)
//   armorBase/armorPer10 เกราะเริ่มต้น + เพิ่มทุก 10 เวฟ (ดูกลไก armor ใน Bullet.js)
//   unlockWave           เวฟที่เริ่มเจอศัตรูประเภทนี้
//   countBase/countEvery/countMax  จำนวนตัวต่อเวฟ ไต่ขึ้นทีละตัวทุกกี่เวฟ จนถึงเพดาน
export const ENEMY_BASE = {
  ground_melee: {
    unlockWave: 1, baseHp: 40, hpGrowth: 1.028, baseDmg: 6, dmgGrowth: 1.014,
    baseSpeed: 70, speedMax: 220, armorBase: 0, armorPer10: 0,
    countBase: 3, countEvery: 10, countMax: 14,
  },
  swarm_fast: {
    unlockWave: 10, baseHp: 16, hpGrowth: 1.022, baseDmg: 4, dmgGrowth: 1.010,
    baseSpeed: 145, speedMax: 340, armorBase: 0, armorPer10: 0,
    countBase: 4, countEvery: 8, countMax: 16,
  },
  air_melee: {
    unlockWave: 12, baseHp: 55, hpGrowth: 1.030, baseDmg: 9, dmgGrowth: 1.014,
    baseSpeed: 85, speedMax: 235, armorBase: 0, armorPer10: 0,
    countBase: 1, countEvery: 15, countMax: 8,
  },
  armored_ground: {
    unlockWave: 18, baseHp: 220, hpGrowth: 1.026, baseDmg: 14, dmgGrowth: 1.012,
    baseSpeed: 45, speedMax: 140, armorBase: 8, armorPer10: 1,
    countBase: 1, countEvery: 12, countMax: 5,
  },
  ground_ranged: {
    unlockWave: 30, baseHp: 70, hpGrowth: 1.032, baseDmg: 7, dmgGrowth: 1.015,
    baseSpeed: 60, speedMax: 190, armorBase: 1, armorPer10: 1,
    countBase: 2, countEvery: 20, countMax: 8,
  },
  air_ranged: {
    unlockWave: 45, baseHp: 60, hpGrowth: 1.032, baseDmg: 10, dmgGrowth: 1.015,
    baseSpeed: 90, speedMax: 235, armorBase: 1, armorPer10: 1,
    countBase: 1, countEvery: 25, countMax: 6,
  },
  ground_lightning: {
    unlockWave: 70, baseHp: 90, hpGrowth: 1.035, baseDmg: 12, dmgGrowth: 1.017,
    baseSpeed: 65, speedMax: 210, armorBase: 2, armorPer10: 1,
    countBase: 1, countEvery: 30, countMax: 4,
  },
  air_lightning: {
    unlockWave: 90, baseHp: 85, hpGrowth: 1.035, baseDmg: 14, dmgGrowth: 1.017,
    baseSpeed: 88, speedMax: 225, armorBase: 2, armorPer10: 1,
    countBase: 1, countEvery: 30, countMax: 4,
  },
  // v2 หมายเหตุ: hpGrowth/dmgGrowth ของบอสเดิม (1.042/1.020) สูงกว่าศัตรูปกติทุกตัวเยอะเกินไป
  // (ศัตรูปกติสูงสุดอยู่แค่ 1.035/1.017) พอ compound ยาวๆ เป็นร้อยเวฟ บอสเลยแซงหน้าศัตรูปกติแบบไม่หยุด:
  // สัดส่วน HP ของบอสเทียบกับ HP รวมทั้งเวฟ ไต่จาก ~60% ช่วงกลางเกมไปเป็น ~90%+ ตอนเวฟ 280-300
  // และ "อัตราส่วนความยากเวฟบอส เทียบกับเวฟปกติก่อนหน้า" ก็ไต่ไม่หยุดตาม (2.9 เท่าที่เวฟ 60 -> 9.7 เท่าที่เวฟ 300)
  // กลายเป็นว่าเวฟบอสยิ่งเล่นยิ่งเป็นกำแพงที่ทำนายไม่ได้ ไม่ใช่ความยากที่ไต่ขึ้นสม่ำเสมอแบบตั้งใจ
  // แก้โดยลดอัตราทบต้นของบอสให้ใกล้เคียงศัตรูปกติที่โหดสุดแทน (แต่ยังสูงกว่านิดหน่อยเพื่อให้ยังรู้สึกว่าบอสพิเศษ)
  // ผลคือสัดส่วน HP บอส/เวฟรวม จะนิ่งอยู่ ~35-45% และอัตราส่วนความยาก นิ่งอยู่ ~1.6-2 เท่าตลอดเกม แทนที่จะพุ่งไม่หยุด
  boss_ground: {
    unlockWave: 10, baseHp: 1500, hpGrowth: 1.034, baseDmg: 32, dmgGrowth: 1.018,
    baseSpeed: 55, speedMax: 200, armorBase: 6, armorPer10: 1,
    countBase: 1, countEvery: 999, countMax: 1,
  },
  boss_air: {
    unlockWave: 30, baseHp: 1100, hpGrowth: 1.034, baseDmg: 40, dmgGrowth: 1.018,
    baseSpeed: 65, speedMax: 210, armorBase: 3, armorPer10: 1,
    countBase: 1, countEvery: 999, countMax: 1,
  },
};

// เงินรางวัลต่อการฆ่า 1 ตัว ไต่ขึ้นแบบเข้าใกล้เพดาน (asymptotic) ไม่ใช่ exponential ไม่มีเพดาน
// เพราะจำนวนเงินที่ต้องมีสูงสุดคือค่าป้อมแพงสุด (~9,500) ถ้ารางวัลโตไม่หยุดตัวเลขจะพังความหมายเร็วมาก
// reward(wave) = rewardMax - (rewardMax - baseReward) * e^(-sharpness * wave)
export const REWARD_CONFIG = {
  baseReward: 6,
  rewardMax: 50,
  sharpness: 0.012,
  rewardVariance: 0.25, // ±25% ต่อตัว กันรู้สึกจำเจ
  bossMultiplier: 3,
  expRatio: 0.35,
};
