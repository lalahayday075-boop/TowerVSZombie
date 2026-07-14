// src/data/evolveTree.js
import { TOWER_TYPES } from "./towerTypes.js";

// เดิมต้องพิมพ์ next/need ซ้ำมือทีละป้อม ตอนนี้สร้างอัตโนมัติจากป้อมที่มีคู่ "_evo1" อยู่แล้ว
// need = 3 คงเดิมทุกป้อม ยกเว้น diamond_cannon ที่ตั้งใจให้ต่ำกว่า (need = 2) ตามของเดิม
const NEED_OVERRIDE = {
  diamond_cannon: 2,
};

function buildEvolveTree() {
  const tree = {};
  for (const type of Object.keys(TOWER_TYPES)) {
    if (type.endsWith("_evo1")) continue;
    const nextType = `${type}_evo1`;
    if (!TOWER_TYPES[nextType]) continue;
    tree[type] = {
      next: nextType,
      need: NEED_OVERRIDE[type] ?? 3,
    };
  }
  return tree;
}

export const EVOLVE_TREE = buildEvolveTree();

export function isBaseType(type) {
  for (const key in EVOLVE_TREE) {
    if (EVOLVE_TREE[key].next === type) return false;
  }
  return true;
}
