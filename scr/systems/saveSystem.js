// src/systems/saveSystem.js
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
      slotIndex: t.slot?.index, type: t.type, level: t.level, totalInvest: t.totalInvest,
    })),
  };
}

export function applyFullGameData(data, onApplied) {
  if (!data) return;

  if (data.playerData) setPlayerData(data.playerData);
  if (typeof data.money === "number") { state.money = data.money; state.confirmedMoney = data.money; }
  if (typeof data.diamonds === "number") { state.diamonds = data.diamonds; state.confirmedDiamonds = data.diamonds; }
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
      const slot = state.buildSlots[saved.slotIndex];
      if (!slot) return;

      const t = new Tower(slot.x, slot.y, saved.type);
      t.totalInvest = saved.totalInvest;

      // บั๊กเดิม: เขียน t.level = saved.level ตรงๆ ก่อน แล้วให้ for-loop เช็คขอบเขตด้วย "t.level" เอง
      // แต่ applyTowerUpgrade() ข้างในก็ทำ tower.level++ ด้วย ทำให้ขอบเขตของ loop ขยับขึ้นทุกรอบที่ loop วิ่ง
      // (เปรียบเหมือนวิ่งไล่จับหางตัวเอง) ผลคือ loop ไม่มีวันจบตามจำนวนที่ตั้งใจ วิ่งยาวไปจนกว่า
      // applyTowerUpgrade จะเจอ maxLevel แล้ว return เฉยๆ — ป้อมเลยเลเวลพุ่งไปสุด (maxLevel) ทันที
      // ทุกครั้งที่ applyFullGameData ทำงาน (คืออัปเกรด/วางป้อม/ขายป้อมทุกครั้ง เพราะ sync ป้อมทั้งหมดใหม่)
      // แก้โดยตรึงเป้าหมายเป็นค่าคงที่ (targetLevel) แยกจาก t.level ที่กำลังถูกไล่บวกทีละ 1 จริงๆ
      const targetLevel = saved.level;
      for (let i = 1; i < targetLevel; i++) applyTowerUpgrade(t);

      t.slot = slot;
      slot.occupied = true;
      slot.towerRef = t;
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
