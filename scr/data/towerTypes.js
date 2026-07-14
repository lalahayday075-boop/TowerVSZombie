// src/data/towerTypes.js
// ค่าตัวเลขทั้งหมดคัดลอกมาจากเกมเดิม (TOWER_TYPES.js) เพื่อคงบาลานซ์เดิมทุกประการ
// ต่างจากเดิมตรงที่ "_evo1" ไม่ต้องพิมพ์ stat ซ้ำอีกรอบ — จะสืบทอดจาก base แล้วทับเฉพาะ
// ค่าที่ต่างจริง (maxLevel) เท่านั้น กันปัญหาแก้ค่าฝั่งเดียวแล้วอีกฝั่งไม่ตรง (บั๊กที่เจอในโค้ดเดิม)

export const MAX_TOWER_LEVEL = 15;

// ===== BASE DEFINITIONS =====
const BASE_TOWERS = {
  normal: {
    cost: 25, range: 150, cooldown: 1, damage: 9.5, hp: 180,
    color: "#DFF3FF", target: "ground", rarity: 60,
  },
  rapid: {
    cost: 840, range: 130, cooldown: 0.3, damage: 6, hp: 150,
    critChance: 0.10, critDamage: 1.8, color: "lime", target: "both", rarity: 0.01,
  },
  diamond_cannon: {
    cost: 0, diamondCost: 45, range: 160, cooldown: 2.3, damage: 460, hp: 1200,
    color: "#4D9BFF", target: "both", maxLevel: 5,
  },
  soldier: {
    cost: 28282, range: 100, cooldown: 2.4, damage: 100, hp: 500,
    color: "#A50303", target: "ground", rarity: 10,
  },
  sharpshooter1: {
    cost: 29292, range: 180, cooldown: 1.8, damage: 145, hp: 400,
    color: "orange", target: "air",
  },
  gunner: {
    cost: 950000, range: 110, cooldown: 3, damage: 480, hp: 1000,
    color: "#4fd1c5", target: "ground",
  },
  lightning: {
    cost: 350000000, range: 200, cooldown: 1.5, damage: 458, hp: 1550,
    color: "#88f", target: "both", chainCount: 3, chainRange: 150, chainDecay: 0.75,
  },
  healer: {
    cost: 0, diamondCost: 200, range: 220, cooldown: 2.0, damage: 0, hp: 1800,
    color: "#3cff9e", target: "tower", healPercent: 0.05, healCount: 2, maxLevel: 5,
  },
  sharpshooter2: {
    cost: 11000000, range: 220, cooldown: 1.6, damage: 960, hp: 1100,
    color: "orange", target: "air",
  },
  crusher: {
    cost: 11000000000, range: 90, cooldown: 0.4, damage: 456, hp: 2200,
    color: "#ff6b6b", target: "ground",
  },
  storm: {
    cost: 350000000000, range: 220, cooldown: 1.45, damage: 3241, hp: 3000,
    color: "#667cff", target: "both", chainCount: 4, chainRange: 200, chainDecay: 0.7,
  },
  executioner: {
    cost: 10, range: 300, cooldown: 2, damage: 8550, hp: 2500,
    color: "#ff9f43", target: "air",
  },
  vanguard: {
    cost: 10, range: 230, cooldown: 0.2, damage: 1660, hp: 2800,
    color: "#e84393", target: "both",
  },
  pomegranate_storm: {
    cost: 0, diamondCost: 1200, range: 230, cooldown: 2.1, damage: 457453, hp: 10000,
    color: "#FF0606", target: "both", maxLevel: 10,
    chainCount: 5, chainRange: 240, chainDecay: 0.65,
  },
};

// ===== EVOLVE OVERRIDES =====
// key = base type, value = { rarity, ...override } สำหรับตัว _evo1
// ค่าที่ไม่ระบุ = สืบทอดจาก base ทั้งหมด (เดิมโค้ดต้องพิมพ์ซ้ำ ตอนนี้ไม่ต้องแล้ว)
const EVOLVE_OVERRIDES = {
  normal: { rarity: 0.1, maxLevel: 30 },
  rapid: { rarity: 0.01, maxLevel: 30 },
  diamond_cannon: { maxLevel: 10 },
  soldier: { rarity: 0.001, maxLevel: 30 },
  sharpshooter1: { maxLevel: 30 },
  gunner: { maxLevel: 30 },
  lightning: { maxLevel: 30 },
  sharpshooter2: { maxLevel: 30 },
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
