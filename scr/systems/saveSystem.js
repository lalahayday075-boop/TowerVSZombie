// scr/systems/saveSystem.js
import { state } from "../core/state.js";
import { playerData, setPlayerData, ensurePlayerDataShape } from "./playerData.js";
import { Tower } from "../entities/Tower.js";
import { applyTowerUpgrade } from "./towerSystem.js";

export function getFullGameData() {
  return {
    playerData,
    money: state.money,
    diamonds: state.diamonds,
    wave: state.wave,
    towerInventory: state.towerInventory,
    totalPlayTime: state.totalPlayTime,
    totalZombiesKilled: state.totalZombiesKilled,
    placedTowers: state.towers.map(t => ({
      x: t.x, y: t.y, type: t.type, level: t.level, totalInvest: t.totalInvest,
    })),
  };
}

export function applyFullGameData(data, onApplied) {
  if (!data) return;

  if (data.playerData) setPlayerData(data.playerData);
  if (typeof data.money === "number") state.money = data.money;
  if (typeof data.diamonds === "number") state.diamonds = data.diamonds;
  if (typeof data.wave === "number") state.wave = data.wave;
  state.totalPlayTime = data.totalPlayTime || 0;
  state.totalZombiesKilled = data.totalZombiesKilled || 0;

  if (data.towerInventory) {
    for (const key in state.towerInventory) delete state.towerInventory[key];
    for (const key in data.towerInventory) state.towerInventory[key] = data.towerInventory[key];
  }

  ensurePlayerDataShape();

  state.towers.length = 0;
  state.buildSlots.forEach(s => { s.occupied = false; s.towerRef = null; });

  if (data.placedTowers) {
    data.placedTowers.forEach(saved => {
      const t = new Tower(saved.x, saved.y, saved.type);
      t.level = saved.level;
      t.totalInvest = saved.totalInvest;

      for (let i = 1; i < t.level; i++) applyTowerUpgrade(t);

      const slot = state.buildSlots.find(s => s.x === saved.x && s.y === saved.y);
      if (slot) {
        t.slot = slot;
        slot.occupied = true;
        slot.towerRef = t;
      }
      state.towers.push(t);
    });
  }

  if (onApplied) onApplied();
}

export function saveGame() {
  localStorage.setItem("tvz_fullsave", JSON.stringify(getFullGameData()));
}

export function loadGame(onApplied) {
  const raw = localStorage.getItem("tvz_fullsave");
  if (!raw) return;
  applyFullGameData(JSON.parse(raw), onApplied);
}

let autosaveTimer = null;
export function startAutosave() {
  if (autosaveTimer) return;
  autosaveTimer = setInterval(saveGame, 5000);
  window.addEventListener("beforeunload", saveGame);
}
