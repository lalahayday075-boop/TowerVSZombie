// scr/ui/profileUI.js
import { state } from "../core/state.js";
import { playerData, savePlayerData } from "../systems/playerData.js";
import { openMapThemePage } from "./mapThemeUI.js";
import { openZombieSkinPage } from "./zombieSkinUI.js";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}ชม ${m}นาที ${s}วิ`;
}

export function createProfilePage() {
  if (document.getElementById("profilePage")) return;

  const overlay = document.createElement("div");
  overlay.id = "profilePage";
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="panel">
      <h2>โปรไฟล์ผู้เล่น</h2>
      <div class="row">ชื่อ: <input type="text" id="playerNameInput"></div>
      <div class="row">เลเวล: <span id="profileLevel"></span></div>
      <div class="row">EXP: <span id="profileExp"></span></div>
      <div class="row">เวลาเล่นรวม: <span id="profilePlayTime"></span></div>
      <div class="row">ซอมบี้ที่ฆ่าทั้งหมด: <span id="profileKill"></span></div>
      <div class="row">เงินทั้งหมดที่เคยได้: <span id="profileTotalMoney"></span></div>
      <div class="row">ด่านสูงสุด: <span id="profileBestWave"></span></div>
      <button class="btn-primary" id="openMapThemeBtn">🗺️ ธีมแมพ</button>
      <button class="btn-primary" id="openZombieSkinBtn">🧟 สกินซอมบี้</button>
      <div class="button-group">
        <button class="btn-primary" id="saveProfileBtn">บันทึกชื่อ</button>
        <button class="btn-secondary" id="closeProfileBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("saveProfileBtn").addEventListener("click", saveProfileName);
  document.getElementById("closeProfileBtn").addEventListener("click", closeProfilePage);
  document.getElementById("openMapThemeBtn").addEventListener("click", openMapThemePage);
  document.getElementById("openZombieSkinBtn").addEventListener("click", openZombieSkinPage);
}

export function openProfilePage() {
  createProfilePage();
  document.getElementById("profilePage").style.display = "block";
  document.getElementById("playerNameInput").value = playerData.name;
  refreshProfileUI();
}

export function closeProfilePage() {
  const el = document.getElementById("profilePage");
  if (el) el.style.display = "none";
}

export function refreshProfileUI() {
  const page = document.getElementById("profilePage");
  if (!page || page.style.display !== "block") return;

  document.getElementById("profileLevel").textContent = playerData.level;
  document.getElementById("profileExp").textContent = playerData.exp;
  document.getElementById("profileTotalMoney").textContent = playerData.totalMoneyEarned;
  document.getElementById("profileBestWave").textContent = playerData.bestWave;
  document.getElementById("profilePlayTime").textContent = formatTime(state.totalPlayTime);
  document.getElementById("profileKill").textContent = state.totalZombiesKilled;
}

function saveProfileName() {
  const name = document.getElementById("playerNameInput").value.trim();
  if (name.length > 0) {
    playerData.name = name;
    savePlayerData();
  }
}
