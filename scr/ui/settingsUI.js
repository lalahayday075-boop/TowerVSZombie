// scr/ui/settingsUI.js
import { playerData, savePlayerData } from "../systems/playerData.js";

export function createSettingsPage() {
  if (document.getElementById("settingsPage")) return;

  const overlay = document.createElement("div");
  overlay.id = "settingsPage";
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="panel">
      <h2>ตั้งค่า</h2>
      <label><input type="checkbox" id="settingSound"> เปิดเสียง</label>
      <div class="button-group">
        <button class="btn-secondary" id="closeSettingsBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("closeSettingsBtn").onclick = closeSettings;
  document.getElementById("settingSound").onchange = e => {
    playerData.settings.sound = e.target.checked;
    savePlayerData();
  };
}

// เดิมมีฟังก์ชันชื่อนี้ถูกประกาศซ้ำ 2 รอบในไฟล์เดียวกัน (ตัวหลังทับตัวแรกเงียบๆ) — AUDIT.md
// เวอร์ชันนี้มีแค่ชุดเดียว ชัดเจน แก้ไขที่เดียวจบ
export function openSettings() {
  createSettingsPage();
  document.getElementById("settingSound").checked = playerData.settings.sound;
  document.getElementById("settingsPage").style.display = "block";
}

export function closeSettings() {
  const el = document.getElementById("settingsPage");
  if (el) el.style.display = "none";
}

export function applySettingsFromPlayerData() {
  const el = document.getElementById("settingSound");
  if (el) el.checked = playerData.settings.sound;
}
