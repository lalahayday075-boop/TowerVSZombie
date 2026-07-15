// src/main.js
import { state, buildSlotLayout } from "./core/state.js";
import { setCanvas } from "./core/canvasRef.js";
import { setZombieMapConfig } from "./entities/Zombie.js";
import { startGameLoop } from "./core/gameLoop.js";
import { initInputHandler } from "./ui/inputHandler.js";
import { initHud } from "./ui/hud.js";
import { ensurePlayerDataShape } from "./systems/playerData.js";
import { applyFullGameData, saveGame } from "./systems/saveSystem.js";
import { api } from "./systems/api.js";
import { showLoginScreen, tryAutoLogin } from "./ui/loginUI.js";
import { initGachaUI, openGachaPage } from "./ui/gachaUI.js";
import { createProfilePage, openProfilePage } from "./ui/profileUI.js";
import { createSettingsPage, openSettings } from "./ui/settingsUI.js";
import { createMapThemePage } from "./ui/mapThemeUI.js";
import { createEvolvePage, openEvolvePage } from "./ui/evolveUI.js";
import { initDevTools } from "./systems/devTools.js";
import { refreshTowerInspectAll, closeTowerInspect, closeTowerPopup } from "./ui/towerPopupUI.js";
import { spawnWave } from "./systems/waveController.js";
import { updateUI } from "./ui/hud.js";

async function init() {
  const canvas = document.getElementById("game");
  setCanvas(canvas);
  setZombieMapConfig(canvas);

  state.buildSlots = buildSlotLayout();

  initHud();
  initInputHandler(canvas);

  // เกมนี้เป็น server-authoritative แล้ว: ต้องล็อกอินก่อนถึงจะรู้ว่าเงิน/เพชร/ป้อมจริงมีอะไรบ้าง
  // (ต่างจากเดิมที่อ่านจาก localStorage ได้ตรงๆ)
  let serverState = await tryAutoLogin();
  if (!serverState) {
    serverState = await showLoginScreen();
  }

  applyFullGameData(serverState);
  ensurePlayerDataShape();
  saveGame(); // เก็บ cache ไว้เผื่อโหลดหน้าใหม่ระหว่างรอเน็ต (ของจริงยังอิง server เสมอ)

  createProfilePage();
  createSettingsPage();
  createMapThemePage();
  createEvolvePage();
  initGachaUI();

  initDevTools({ refreshTowerInspectAll, closeTowerInspect });

  bindTopMenuButtons();
  startHeartbeat();

  updateUI();
  spawnWave();
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

// ส่งเวลาเล่นสะสมให้ server ทุก 10 วิ (server เป็นคนบวกเวลาเอง ไม่เชื่อค่าที่ client ส่งไปสะสมเอง)
function startHeartbeat() {
  setInterval(() => {
    api.heartbeat(10).catch(() => {}); // เน็ตหลุดชั่วคราวไม่ต้องแจ้งเตือน รอบหน้าค่อยลองใหม่
  }, 10000);
  window.addEventListener("beforeunload", () => {
    navigator.sendBeacon?.("/api/state/heartbeat", JSON.stringify({ deltaSeconds: 10 }));
  });
}

document.addEventListener("DOMContentLoaded", init);
