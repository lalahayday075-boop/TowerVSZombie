// src/systems/towerSystem.js
import { state } from "../core/state.js";
import { TOWER_TYPES, MAX_TOWER_LEVEL } from "../data/towerTypes.js";
import { api } from "./api.js";
import { applyFullGameData, saveGame } from "./saveSystem.js";

// ฟังก์ชันนี้ยังใช้ฝั่ง client เพื่อคำนวณค่าป้อมหลังโหลด/sync จาก server (ต้องได้ค่าตรงกับ backend เป๊ะๆ
// เพราะ server เก็บแค่ level/totalInvest แล้วให้ client คำนวณสเตตัสที่แสดงผลเอง)
export function applyTowerUpgrade(tower) {
  const cfg = TOWER_TYPES[tower.type];
  const maxLevel = cfg.maxLevel || MAX_TOWER_LEVEL;
  if (tower.level >= maxLevel) return;

  if (tower.isHealer) {
    tower.level++;
    tower.healPercent += 0.0125;
    tower.cooldownMax = Math.max(1.5, tower.cooldownMax - 0.15);
    return;
  }

  tower.level++;
  const lvl = tower.level;
  const isDiamondTower = !!cfg.diamondCost;

  if (isDiamondTower) {
    tower.damage *= (lvl <= 5 ? 1.204 : 1.1075);
    tower.range += (lvl <= 5 ? 5.5 : 4.7);
    tower.aimRange = tower.range * 1.25;
    tower.maxHp *= (lvl <= 5 ? 1.158 : 1.1075);
    tower.hp = tower.maxHp;
    tower.cooldownMax *= (lvl <= 5 ? 0.968 : 0.975);
  } else {
    tower.damage *= (lvl <= 15 ? 1.0295 : 1.0471);
    tower.range += (lvl <= 15 ? 1.45 : 1.3);
    tower.aimRange = tower.range * 1.25;
    tower.maxHp *= (lvl <= 15 ? 1.029 : 1.035);
    tower.hp = tower.maxHp;
    tower.cooldownMax *= (lvl <= 15 ? 0.9925 : 0.9925);
  }
}

export function getUpgradeCost(tower) {
  const cfg = TOWER_TYPES[tower.type];
  const lvl = tower.level;
  if (cfg.diamondCost) {
    return { type: "diamond", cost: Math.ceil(cfg.diamondCost * Math.pow(lvl, 1 / 10)) };
  }
  return { type: "money", cost: Math.floor((cfg.cost / 2) * Math.pow(lvl, 1 / 10)) };
}

// สำคัญ: ทุกฟังก์ชันด้านล่างนี้ "รอ server อนุมัติก่อน" ถึงจะมีผลจริงกับ inventory/เงิน/เพชร
// (เดิมแก้ state ฝั่ง client ตรงๆ ทันที ซึ่งเป็นช่องโกงหลัก — ตอนนี้ client แค่ "ขอ" เท่านั้น)

export async function placeTower(type, slot, onError) {
  try {
    const result = await api.placeTower(type, slot.index);
    applyFullGameData(result.state);
    saveGame();
    return true;
  } catch (err) {
    if (onError) onError(err.message);
    else alert(err.message);
    return false;
  }
}

export async function upgradeTower(onUpdate, onError) {
  const tower = state.selectedTower;
  if (!tower || tower.slot == null) return;

  try {
    const result = await api.upgradeTower(tower.slot.index);
    applyFullGameData(result.state);
    saveGame();
    // เลือกป้อมตัวเดิมต่อ (applyFullGameData สร้าง instance ใหม่ทั้งหมด อ้างอิงจาก slotIndex เดิม)
    state.selectedTower = state.towers.find(t => t.slot?.index === tower.slot.index) || null;
    if (onUpdate) onUpdate();
  } catch (err) {
    if (onError) onError(err.message);
    else alert(err.message);
  }
}

export async function sellTower(fromButton, onConfirmNeeded, onSold, onError) {
  const tower = state.selectedTower;
  if (!tower || tower.slot == null) return;

  if (fromButton && !state.sellConfirmMode) {
    state.sellConfirmMode = true;
    if (onConfirmNeeded) onConfirmNeeded();
    return;
  }

  try {
    const result = await api.sellTower(tower.slot.index);
    applyFullGameData(result.state);
    saveGame();
    state.sellConfirmMode = false;
    state.selectedTower = null;
    if (onSold) onSold();
  } catch (err) {
    if (onError) onError(err.message);
    else alert(err.message);
  }
}
