// backend/data/towerFormulas.js
// หมายเหตุ: ใช้ TOWER_TYPES ตัวเดียวกับฝั่ง client (import ตรงจาก src/data) เพื่อไม่ให้ตัวเลขเพี้ยนกัน
// ส่วนสูตรค่าอัพเกรดคัดลอกมาจาก src/systems/towerSystem.js (getUpgradeCost) แค่ปรับให้เป็น pure function
import { TOWER_TYPES, MAX_TOWER_LEVEL } from "../../src/data/towerTypes.js";

export { TOWER_TYPES, MAX_TOWER_LEVEL };

export function getMaxLevel(type) {
  const cfg = TOWER_TYPES[type];
  if (!cfg) return null;
  return cfg.maxLevel || MAX_TOWER_LEVEL;
}

export function getUpgradeCost(type, level) {
  const cfg = TOWER_TYPES[type];
  if (!cfg) return null;
  if (cfg.diamondCost) {
    return { currency: "diamond", cost: Math.ceil(cfg.diamondCost * Math.pow(level, 1 / 10)) };
  }
  return { currency: "money", cost: Math.floor((cfg.cost / 2) * Math.pow(level, 1 / 10)) };
}
