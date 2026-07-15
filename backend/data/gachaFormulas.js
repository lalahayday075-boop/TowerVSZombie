// backend/data/gachaFormulas.js
import { GACHA_POOLS } from "../../src/data/gachaPools.js";
import { TOWER_TYPES } from "../../src/data/towerTypes.js";

export { GACHA_POOLS };

function getRandomFromPool(towerList) {
  const pool = [];
  towerList.forEach(type => {
    const rarity = TOWER_TYPES[type].rarity || 1;
    for (let i = 0; i < rarity; i++) pool.push(type);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

// สุ่มผล amount ครั้ง คืนค่า array ของ tower type ที่ได้ (server เป็นคนสุ่มเองทั้งหมด
// ไคลเอนต์ส่งมาได้แค่ poolKey + amount ห้ามส่งผลลัพธ์มาเอง)
export function rollGachaPool(poolKey, amount) {
  const pool = GACHA_POOLS[poolKey];
  if (!pool) return null;
  const results = [];
  for (let i = 0; i < amount; i++) results.push(getRandomFromPool(pool.towers));
  return results;
}
