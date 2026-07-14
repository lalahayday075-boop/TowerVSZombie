// src/main.js
import { state, buildSlotLayout } from "./core/state.js";
import { setCanvas, canvasRef } from "./core/canvasRef.js";
import { setZombieMapConfig } from "./entities/Zombie.js";
import { startGameLoop } from "./core/gameLoop.js";
import { initInputHandler } from "./ui/inputHandler.js";
import { initHud } from "./ui/hud.js";
import { initInventory } from "./systems/inventorySystem.js";
import { loadPlayerData, ensurePlayerDataShape } from "./systems/playerData.js";
import { loadGame, startAutosave } from "./systems/saveSystem.js";
import { syncSkinWithDatabase, checkSkinUnlocks } from "./systems/unlockSystem.js";
import { initGachaUI, openGachaPage } from "./ui/gachaUI.js";
import { createProfilePage, openProfilePage } from "./ui/profileUI.js";
import { createSettingsPage, openSettings } from "./ui/settingsUI.js";
import { createMapThemePage } from "./ui/mapThemeUI.js";
import { createEvolvePage, openEvolvePage } from "./ui/evolveUI.js";
import { initDevTools } from "./systems/devTools.js";
import { refreshTowerInspectAll, closeTowerInspect, closeTowerPopup } from "./ui/towerPopupUI.js";
import { spawnWave } from "./systems/waveController.js";
import { updateUI } from "./ui/hud.js";

function init() {
  const canvas = document.getElementById("game");
  setCanvas(canvas);
  setZombieMapConfig(canvas);

  state.buildSlots = buildSlotLayout();

  initHud();
  initInputHandler(canvas);

  loadPlayerData(); // ไม่มี applySettings callback ก็ไม่เป็นไร ตั้งค่าเริ่มจาก default
  ensurePlayerDataShape();
  syncSkinWithDatabase();
  checkSkinUnlocks();
  loadGame(); // จะ override money/diamonds/towers/playerData ถ้ามีเซฟเดิม

  initInventory();

  createProfilePage();
  createSettingsPage();
  createMapThemePage();
  createEvolvePage();
  initGachaUI();

  initDevTools({ refreshTowerInspectAll, closeTowerInspect });

  // ผูกปุ่มเมนูบนสุด (id ต้องตรงกับใน index.html)
  bindTopMenuButtons();

  updateUI();
  spawnWave();
  startAutosave();
  startGameLoop();
}

function bindTopMenuButtons() {
  const map = {
    gachaBtn: openGachaPage,
    profileBtn: openProfilePage,
    setBtn: openSettings,
    evolveBtn: openEvolvePage,
    towerPopupCloseBtn: closeTowerPopup,
  };
  for (const [id, handler] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", handler);
  }
}

document.addEventListener("DOMContentLoaded", init);
