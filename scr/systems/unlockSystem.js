// src/systems/unlockSystem.js
import { state } from "../core/state.js";
import { playerData, savePlayerData } from "./playerData.js";
import { SKIN_DATABASE } from "../render/towerSkins/index.js";
import { MAP_THEMES } from "../render/mapThemes.js";
import { saveGame, applyFullGameData } from "./saveSystem.js";
import { api } from "./api.js";

export function unlockSkin(type, skin) {
  if (!playerData.skins.unlocked[type]) playerData.skins.unlocked[type] = ["default"];
  if (!playerData.skins.unlocked[type].includes(skin)) {
    playerData.skins.unlocked[type].push(skin);
    savePlayerData();
  }
}

export function checkSkinUnlocks() {
  for (const type in SKIN_DATABASE) {
    SKIN_DATABASE[type].forEach(skin => {
      if (!skin.unlock) return;
      let unlocked = false;
      if (skin.unlock.bestWave && playerData.bestWave >= skin.unlock.bestWave) unlocked = true;
      if (skin.unlock.totalZombiesKilled && state.totalZombiesKilled >= skin.unlock.totalZombiesKilled) unlocked = true;
      if (skin.unlock.level && playerData.level >= skin.unlock.level) unlocked = true;
      if (unlocked) unlockSkin(type, skin.id);
    });
  }
}

export function ensureDefaultSkins() {
  for (const type in SKIN_DATABASE) {
    if (!playerData.skins.unlocked[type]) playerData.skins.unlocked[type] = [];
    SKIN_DATABASE[type].forEach(skin => {
      if (!skin.unlock && !playerData.skins.unlocked[type].includes(skin.id)) {
        playerData.skins.unlocked[type].push(skin.id);
      }
    });
  }
  savePlayerData();
}

export function syncSkinWithDatabase() {
  if (!playerData.skins) playerData.skins = { unlocked: {}, equipped: {} };
  for (const type in SKIN_DATABASE) {
    if (!playerData.skins.unlocked[type]) playerData.skins.unlocked[type] = [];
    if (!playerData.skins.equipped[type]) playerData.skins.equipped[type] = "default";
    SKIN_DATABASE[type].forEach(skin => {
      if (!skin.unlock && !playerData.skins.unlocked[type].includes(skin.id)) {
        playerData.skins.unlocked[type].push(skin.id);
      }
    });
  }
  savePlayerData();
}

export function unlockMapTheme(themeName) {
  if (!playerData.mapTheme.owned.includes(themeName)) {
    playerData.mapTheme.owned.push(themeName);
    saveGame();
    return true;
  }
  return false;
}

export function checkMapUnlock() {
  if (state.totalZombiesKilled >= 1) unlockMapTheme("Songkran");
  if (state.totalZombiesKilled >= 1500) unlockMapTheme("lava");
}

// สำคัญ: เกมนี้เป็น server-authoritative แล้ว ทุกครั้งที่เปิดเกมใหม่ค่า playerData
// ทั้งก้อนจะถูกเขียนทับด้วยข้อมูลจาก /api/state เสมอ (ดู main.js -> applyFullGameData(serverState))
// ถ้าอัปเดตแค่ playerData ในเครื่อง (savePlayerData/saveGame ที่เซฟลง localStorage อย่างเดียว)
// โดยไม่ยิง API ไปเก็บที่ฝั่ง server ด้วย พอโหลดหน้าใหม่ค่าที่เพิ่งเลือกจะหายและถูกรีเซ็ตกลับเป็น
// default ทุกครั้ง (นี่คือสาเหตุของบั๊ก "เลือกสกินแล้วออกเข้าใหม่มันรีเซ็ต")
// จึงต้องยิง api.equipMapTheme() ไปบันทึกที่ฝั่ง server ทุกครั้งที่ผู้เล่นเปลี่ยนธีมแมพ
export async function equipMapTheme(themeName) {
  if (!playerData.mapTheme.owned.includes(themeName)) return;

  const prevEquipped = playerData.mapTheme.equipped;
  playerData.mapTheme.equipped = themeName; // อัปเดตทันทีให้ UI ตอบสนองไว (optimistic)
  savePlayerData();

  try {
    const res = await api.equipMapTheme(themeName);
    applyFullGameData(res.state); // sync ให้ตรงกับของจริงบน server เสมอ
    saveGame();
  } catch (err) {
    playerData.mapTheme.equipped = prevEquipped; // ยิงไม่สำเร็จ ย้อนกลับค่าเดิม
    savePlayerData();
    console.error("[equipMapTheme] บันทึกธีมแมพไม่สำเร็จ:", err);
  }
}

// ประเภทซอมบี้ที่มีอยู่จริง (ตรงกับ zombieSkins/index.js)
export const ZOMBIE_TYPES = [
  "ground_melee", "ground_ranged", "ground_lightning",
  "air_melee", "air_ranged", "air_lightning",
  "boss_ground_melee", "boss_air_melee",
];

// ลายจริงที่มีให้แต่ละสกิน (ต้องตรงกับ SKIN_RENDERERS ใน render/zombieSkins/index.js เป๊ะๆ)
export const ZOMBIE_SKIN_AVAILABILITY = {
  default: ZOMBIE_TYPES,
  Songkran: ["ground_melee", "ground_ranged", "air_melee"],
  // หมายเหตุ: เดิมมีเงื่อนไขปลดล็อกสกิน "toxic" ที่ 300 kill แต่ไม่มีลายจริงรองรับเลย (AUDIT.md ข้อ 10)
  // ตัดออกเพื่อไม่ให้ผู้เล่นปลดล็อกของที่ใช้ไม่ได้
};

export function unlockZombieSkin(name) {
  ZOMBIE_TYPES.forEach(type => {
    if (!playerData.zombieSkin.owned[type].includes(name)) {
      playerData.zombieSkin.owned[type].push(name);
    }
  });
  saveGame();
}

export function checkZombieSkinUnlock() {
  if (state.totalZombiesKilled >= 1) unlockZombieSkin("Songkran");
}

export async function equipZombieSkin(type, name) {
  if (!playerData.zombieSkin.owned[type]?.includes(name)) return;

  const prevEquipped = playerData.zombieSkin.equipped[type];
  playerData.zombieSkin.equipped[type] = name; // optimistic update
  saveGame();

  try {
    const res = await api.equipZombieSkin(type, name);
    applyFullGameData(res.state); // sync ให้ตรงกับของจริงบน server เสมอ
    saveGame();
  } catch (err) {
    playerData.zombieSkin.equipped[type] = prevEquipped;
    saveGame();
    console.error("[equipZombieSkin] บันทึกสกินซอมบี้ไม่สำเร็จ:", err);
  }
}
