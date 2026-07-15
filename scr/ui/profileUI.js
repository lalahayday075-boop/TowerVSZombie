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
    <div class="panel profile-panel">
      <h2>โปรไฟล์ผู้เล่น</h2>

      <div class="profile-header">
        <div class="profile-avatar">👤</div>
        <div class="profile-name-row">
          <span class="profile-name-text" id="profileNameDisplay">Player</span>
          <button class="icon-edit-btn" id="editNameBtn" title="แก้ไขชื่อ" aria-label="แก้ไขชื่อ">✏️</button>
        </div>
      </div>

      <div class="profile-stats-grid">
        <div class="stat-card">
          <div class="stat-card-icon">⭐</div>
          <div class="stat-card-label">เลเวล</div>
          <div class="stat-card-value" id="profileLevel">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">✨</div>
          <div class="stat-card-label">EXP</div>
          <div class="stat-card-value" id="profileExp">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">⏱️</div>
          <div class="stat-card-label">เวลาเล่นรวม</div>
          <div class="stat-card-value stat-card-value--small" id="profilePlayTime">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">🧟</div>
          <div class="stat-card-label">ซอมบี้ที่ฆ่า</div>
          <div class="stat-card-value" id="profileKill">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">💰</div>
          <div class="stat-card-label">เงินทั้งหมดที่เคยได้</div>
          <div class="stat-card-value" id="profileTotalMoney">-</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">🏆</div>
          <div class="stat-card-label">ด่านสูงสุด</div>
          <div class="stat-card-value" id="profileBestWave">-</div>
        </div>
      </div>

      <button class="btn-primary" id="openMapThemeBtn">🗺️ ธีมแมพ</button>
      <button class="btn-primary" id="openZombieSkinBtn">🧟 สกินซอมบี้</button>
      <div class="button-group">
        <button class="btn-secondary" id="closeProfileBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const editOverlay = document.createElement("div");
  editOverlay.id = "editNamePage";
  editOverlay.className = "overlay";
  editOverlay.innerHTML = `
    <div class="panel edit-name-panel">
      <h2>แก้ไขชื่อ</h2>
      <input type="text" id="playerNameInput" maxlength="16" placeholder="ใส่ชื่อของคุณ">
      <div class="button-group">
        <button class="btn-primary" id="saveProfileBtn">บันทึก</button>
        <button class="btn-secondary" id="cancelEditNameBtn">ยกเลิก</button>
      </div>
    </div>
  `;
  document.body.appendChild(editOverlay);

  document.getElementById("editNameBtn").addEventListener("click", openEditNamePopup);
  document.getElementById("saveProfileBtn").addEventListener("click", saveProfileName);
  document.getElementById("cancelEditNameBtn").addEventListener("click", closeEditNamePopup);
  document.getElementById("closeProfileBtn").addEventListener("click", closeProfilePage);
  document.getElementById("openMapThemeBtn").addEventListener("click", openMapThemePage);
  document.getElementById("openZombieSkinBtn").addEventListener("click", openZombieSkinPage);
}

export function openProfilePage() {
  createProfilePage();
  document.getElementById("profilePage").style.display = "block";
  refreshProfileUI();
}

export function closeProfilePage() {
  const el = document.getElementById("profilePage");
  if (el) el.style.display = "none";
}

export function openEditNamePopup() {
  document.getElementById("playerNameInput").value = playerData.name;
  document.getElementById("editNamePage").style.display = "block";
  document.getElementById("playerNameInput").focus();
}

export function closeEditNamePopup() {
  const el = document.getElementById("editNamePage");
  if (el) el.style.display = "none";
}

export function refreshProfileUI() {
  const page = document.getElementById("profilePage");
  if (!page || page.style.display !== "block") return;

  document.getElementById("profileNameDisplay").textContent = playerData.name;
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
    refreshProfileUI();
  }
  closeEditNamePopup();
}
