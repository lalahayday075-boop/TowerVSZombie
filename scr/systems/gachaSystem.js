// src/systems/gachaSystem.js
import { GACHA_POOLS } from "../data/gachaPools.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { api } from "./api.js";
import { applyFullGameData, saveGame } from "./saveSystem.js";

// ใช้แค่โชว์ "ไฮไลต์" บนการ์ดกาชา (การสุ่มจริงเกิดที่ server เท่านั้น)
export function getBestTowerInPool(poolKey) {
  const pool = GACHA_POOLS[poolKey];
  if (!pool) return null;

  let best = null;
  let bestDPS = -Infinity;

  pool.towers.forEach(type => {
    const t = TOWER_TYPES[type];
    if (typeof t.healPercent === "number") return;
    const dps = (t.damage || 0) / (t.cooldown || 1);
    if (dps > bestDPS) { bestDPS = dps; best = type; }
  });

  return best;
}

export async function rollGacha(poolKey, amount = 1) {
  try {
    const result = await api.rollGacha(poolKey, amount);
    applyFullGameData(result.state);
    saveGame();
    return { ok: true, results: result.results.map(r => r.toUpperCase()) };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
