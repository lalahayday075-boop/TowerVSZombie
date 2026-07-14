// src/systems/gachaSystem.js
import { state } from "../core/state.js";
import { GACHA_POOLS } from "../data/gachaPools.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { saveGame } from "./saveSystem.js";

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

function getRandomFromPool(towerList) {
  const pool = [];
  towerList.forEach(type => {
    const rarity = TOWER_TYPES[type].rarity || 1;
    for (let i = 0; i < rarity; i++) pool.push(type);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

// คืนค่า { ok, results, message } แทนการ alert() ตรงๆ เพื่อให้ UI layer เลือกวิธีแสดงผลเอง
export function rollGacha(poolKey, amount = 1) {
  const poolData = GACHA_POOLS[poolKey];
  if (!poolData) return { ok: false, message: "ไม่พบตู้กาชานี้" };

  const totalCost = poolData.cost * amount;

  if (poolData.currency === "money") {
    if (state.money < totalCost) return { ok: false, message: "เงินไม่พอ!" };
    state.money -= totalCost;
  } else {
    if (state.diamonds < totalCost) return { ok: false, message: "เพชรไม่พอ!" };
    state.diamonds -= totalCost;
  }

  const results = [];
  for (let i = 0; i < amount; i++) {
    const tower = getRandomFromPool(poolData.towers);
    state.towerInventory[tower]++;
    results.push(tower.toUpperCase());
  }

  saveGame();
  return { ok: true, results };
}
