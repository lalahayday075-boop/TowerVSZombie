// src/systems/towerSystem.js
import { state } from "../core/state.js";
import { TOWER_TYPES, MAX_TOWER_LEVEL } from "../data/towerTypes.js";
import { Tower } from "../entities/Tower.js";
import { saveGame } from "./saveSystem.js";

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

export function upgradeTower(onUpdate) {
  const tower = state.selectedTower;
  if (!tower) return;

  const cfg = TOWER_TYPES[tower.type];
  const maxLevel = cfg.maxLevel || MAX_TOWER_LEVEL;
  if (tower.level >= maxLevel) return;

  const costData = getUpgradeCost(tower);
  if (costData.type === "money" && state.money < costData.cost) return;
  if (costData.type === "diamond" && state.diamonds < costData.cost) return;

  if (costData.type === "money") {
    state.money -= costData.cost;
  } else {
    state.diamonds -= costData.cost;
  }
  tower.totalInvest += costData.cost;

  applyTowerUpgrade(tower);
  if (onUpdate) onUpdate();
  saveGame();
}

export function sellTower(fromButton, onConfirmNeeded, onSold) {
  const tower = state.selectedTower;
  if (!tower) return;

  if (fromButton && !state.sellConfirmMode) {
    state.sellConfirmMode = true;
    if (onConfirmNeeded) onConfirmNeeded();
    return;
  }

  state.towerInventory[tower.type]++;

  const slot = tower.slot;
  if (slot) {
    slot.occupied = false;
    slot.towerRef = null;
    slot.respawning = false;
    if (slot.respawnTimer) {
      clearTimeout(slot.respawnTimer);
      slot.respawnTimer = null;
    }
  }

  state.towers.splice(state.towers.indexOf(tower), 1);
  state.sellConfirmMode = false;
  state.selectedTower = null;

  if (onSold) onSold();
  saveGame();
}

export function placeTower(type, slot) {
  if (state.towerInventory[type] <= 0) return null;
  state.towerInventory[type]--;

  const tower = new Tower(slot.x, slot.y, type);
  tower.slot = slot;

  state.towers.push(tower);
  slot.occupied = true;
  slot.towerRef = tower;
  slot.towerType = type;

  saveGame();
  return tower;
}
