// src/data/towerTypes.js
// รื้อค่าป้อมใหม่ทั้งหมดสำหรับบาลานซ์แบบ hardcore (ดู GAME_DESIGN.md)
//
// เดิม: ราคาป้อมกระโดดจาก 25 ไปถึง 350,000,000,000 (เกิน Number.MAX_SAFE_INTEGER ของ JS ด้วยซ้ำ)
// ไม่ match กับตารางรางวัลที่ให้หลักสิบ-หลักพันต่อเวฟเลย ทำให้ป้อมท้ายๆ แทบเป็นไปไม่ได้จะซื้อจริง
// ใหม่: สเกล 20-9,500 เงิน / 25-450 เพชร ตามทันเงินที่หาได้จริงต่อเวฟ (ดู waveConfig.REWARD_CONFIG)
// และให้แต่ละป้อมมี "งาน" ของตัวเองชัดเจน ไม่มีตัวเทพตัวเดียวที่คุ้มกว่าทุกตัวในทุกสถานการณ์:
//   normal/soldier    generalist ราคาถูก ใช้ตั้งฐานช่วงแรก
//   rapid/vanguard    ยิงไวมาก ดาเมจ/นัดต่ำ — งานคือฆ่า swarm_fast ที่วิ่งเร็ว เลือดบาง
//   soldier/crusher   ดาเมจ/นัดสูง — งานคือเจาะเกราะ armored_ground (ดูกลไก armor ใน Bullet.js)
//   sharpshooter1/2   ยิงอากาศเท่านั้น ดาเมจสูง ระยะไกล
//   lightning/storm   สายฟ้าลูกโซ่ — กวาดหลายตัวพร้อมกัน แต่เจาะเกราะได้แค่ครึ่งเดียว
//   executioner       โบนัสดาเมจ 2 เท่าใส่ศัตรู HP เหลือ ≤20% — เก่งปิดจ๊อบบอส
//   healer            ซัพพอร์ตล้วน ไม่มีดาเมจ
//   diamond_cannon/pomegranate_storm  เพชรล้วน ของแรงปลายเกม

export const MAX_TOWER_LEVEL = 15;

// ===== BASE DEFINITIONS =====
const BASE_TOWERS = {
  normal: {
    cost: 20, range: 140, cooldown: 0.9, damage: 7, hp: 90,
    color: "#DFF3FF", target: "ground", rarity: 100,
  },
  rapid: {
    cost: 55, range: 115, cooldown: 0.22, damage: 3.5, hp: 70,
    critChance: 0.12, critDamage: 1.8, color: "lime", target: "both", rarity: 40,
  },
  diamond_cannon: {
    cost: 0, diamondCost: 35, range: 160, cooldown: 2.0, damage: 190, hp: 700,
    color: "#4D9BFF", target: "both", maxLevel: 5, rarity: 30,
  },
  soldier: {
    cost: 90, range: 105, cooldown: 1.7, damage: 20, hp: 220,
    color: "#A50303", target: "ground", rarity: 25,
  },
  sharpshooter1: {
    cost: 220, range: 230, cooldown: 1.5, damage: 34, hp: 110,
    color: "orange", target: "air", rarity: 30,
  },
  gunner: {
    cost: 380, range: 135, cooldown: 0.6, damage: 24, hp: 260,
    color: "#4fd1c5", target: "ground", rarity: 25,
  },
  lightning: {
    cost: 650, range: 160, cooldown: 1.1, damage: 16, hp: 300,
    color: "#88f", target: "both", chainCount: 3, chainRange: 150, chainDecay: 0.75, rarity: 15,
  },
  healer: {
    cost: 0, diamondCost: 25, range: 220, cooldown: 2.2, damage: 0, hp: 500,
    color: "#3cff9e", target: "tower", healPercent: 0.045, healCount: 2, maxLevel: 5, rarity: 40,
  },
  sharpshooter2: {
    cost: 1400, range: 250, cooldown: 1.35, damage: 68, hp: 300,
    color: "orange", target: "air", rarity: 10,
  },
  crusher: {
    cost: 2200, range: 95, cooldown: 1.9, damage: 130, hp: 500,
    color: "#ff6b6b", target: "ground", rarity: 12,
  },
  storm: {
    cost: 5200, range: 210, cooldown: 1.05, damage: 55, hp: 900,
    color: "#667cff", target: "both", chainCount: 4, chainRange: 200, chainDecay: 0.7, rarity: 6,
  },
  executioner: {
    cost: 7800, range: 270, cooldown: 1.5, damage: 85, hp: 700,
    color: "#ff9f43", target: "air", executeBonus: 1.0, rarity: 5,
  },
  vanguard: {
    cost: 9500, range: 165, cooldown: 0.14, damage: 22, hp: 1000,
    color: "#e84393", target: "both", rarity: 4,
  },
  pomegranate_storm: {
    cost: 0, diamondCost: 450, range: 230, cooldown: 2.0, damage: 2600, hp: 4000,
    color: "#FF0606", target: "both", maxLevel: 10,
    chainCount: 5, chainRange: 240, chainDecay: 0.65, rarity: 3,
  },
};

// ===== EVOLVE OVERRIDES =====
// key = base type, value = { rarity, ...override } สำหรับตัว _evo1
// ค่าที่ไม่ระบุ = สืบทอดจาก base ทั้งหมด (evolve ไม่ต้องพิมพ์ stat ซ้ำ)
const EVOLVE_OVERRIDES = {
  normal: { rarity: 25, maxLevel: 30 },
  rapid: { rarity: 20, maxLevel: 30 },
  diamond_cannon: { maxLevel: 10 },
  soldier: { rarity: 15, maxLevel: 30 },
  sharpshooter1: { rarity: 20, maxLevel: 30 },
  gunner: { rarity: 18, maxLevel: 30 },
  lightning: { rarity: 10, maxLevel: 30 },
  sharpshooter2: { rarity: 8, maxLevel: 30 },
};

function buildTowerTypes() {
  const result = {};
  for (const [key, cfg] of Object.entries(BASE_TOWERS)) {
    result[key] = { ...cfg };
    const evo = EVOLVE_OVERRIDES[key];
    if (evo) {
      result[`${key}_evo1`] = { ...cfg, ...evo };
    }
  }
  return result;
}

export const TOWER_TYPES = buildTowerTypes();

export const TOWER_MUZZLE = {
  normal: () => ({ x: 14, y: 0, r: 2.2 }),
  rapid: () => ({ x: 30, y: 0, r: 2.0 }),
  gunner: () => ({ x: 22, y: 0, r: 2.8 }),
  sharpshooter: () => ({ x: 26, y: 0, r: 1.6 }),
  crusher: () => ({ x: 20, y: 0, r: 2.0 }),
  diamond_cannon: () => ({ x: 22, y: 0, r: 3.2 }),
  soldier: () => ({ x: 0, y: 0, r: 2.5 }),
  lightning: () => ({ x: 0, y: 0, r: 3.0 }),
  storm: () => ({ x: 0, y: 0, r: 3.2 }),
  executioner: () => ({ x: 0, y: 0, r: 2.4 }),
  vanguard: () => ({ x: 0, y: 0, r: 1.8 }),
  pomegranate_storm: () => ({ x: 0, y: 0, r: 3.6 }),
};
