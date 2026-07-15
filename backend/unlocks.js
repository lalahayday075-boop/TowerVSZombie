// backend/unlocks.js
import { pool } from "./db/pool.js";
import { SKIN_DATABASE } from "../src/render/towerSkins/index.js";
import { MAP_THEMES } from "../src/render/mapThemes.js";
import { ZOMBIE_SKIN_AVAILABILITY, ZOMBIE_TYPES } from "../src/systems/unlockSystem.js";

export function computeUnlockedTowerSkins(row) {
  const unlocked = row.skins?.unlocked || {};
  for (const type in SKIN_DATABASE) {
    if (!unlocked[type]) unlocked[type] = ["default"];
    SKIN_DATABASE[type].forEach(skin => {
      if (unlocked[type].includes(skin.id)) return;
      if (!skin.unlock) { unlocked[type].push(skin.id); return; }
      let ok = false;
      if (skin.unlock.bestWave && row.best_wave >= skin.unlock.bestWave) ok = true;
      if (skin.unlock.totalZombiesKilled && Number(row.total_zombies_killed) >= skin.unlock.totalZombiesKilled) ok = true;
      if (skin.unlock.level && row.level >= skin.unlock.level) ok = true;
      if (ok) unlocked[type].push(skin.id);
    });
  }
  return unlocked;
}

export function computeUnlockedMapThemes(row) {
  const owned = new Set(row.map_theme?.owned || ["default"]);
  const killed = Number(row.total_zombies_killed);
  if (killed >= 1) owned.add("Songkran");
  if (killed >= 1500) owned.add("lava");
  return [...owned].filter(t => MAP_THEMES.includes(t));
}

export function computeUnlockedZombieSkins(row) {
  const owned = row.zombie_skin?.owned || {};
  ZOMBIE_TYPES.forEach(type => {
    if (!owned[type]) owned[type] = ["default"];
  });
  if (Number(row.total_zombies_killed) >= 1) {
    ZOMBIE_TYPES.forEach(type => {
      if (ZOMBIE_SKIN_AVAILABILITY.Songkran.includes(type) && !owned[type].includes("Songkran")) {
        owned[type].push("Songkran");
      }
    });
  }
  return owned;
}

// เรียกทุกครั้งที่ตัวเลขที่มีผลต่อการปลดล็อก (bestWave/kill/level) เปลี่ยน แล้วบันทึกกลับ DB
// เพื่อให้ /api/state คืนรายการที่ปลดล็อกแล้วล่าสุดเสมอ (ไม่ต้องรอ client มา equip ก่อนถึงจะรู้)
export async function refreshAndPersistUnlocks(row) {
  const skinsUnlocked = computeUnlockedTowerSkins(row);
  const mapOwned = computeUnlockedMapThemes(row);
  const zombieOwned = computeUnlockedZombieSkins(row);

  const skins = { ...(row.skins || {}), unlocked: skinsUnlocked };
  const mapTheme = { ...(row.map_theme || { equipped: "default" }), owned: mapOwned };
  const zombieSkin = { ...(row.zombie_skin || { equipped: {} }), owned: zombieOwned };

  const updated = await pool.query(
    "UPDATE players SET skins = $1, map_theme = $2, zombie_skin = $3, updated_at = now() WHERE id = $4 RETURNING *",
    [JSON.stringify(skins), JSON.stringify(mapTheme), JSON.stringify(zombieSkin), row.id]
  );
  return updated.rows[0];
}
