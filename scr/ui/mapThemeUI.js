// scr/ui/mapThemeUI.js
import { playerData } from "../systems/playerData.js";
import { MAP_THEMES } from "../render/mapThemes.js";
import { equipMapTheme } from "../systems/unlockSystem.js";

export function createMapThemePage() {
  const overlay = document.createElement("div");
  overlay.id = "mapThemePage";
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="panel">
      <h2>เลือกธีมแมพ</h2>
      <div id="mapThemeList"></div>
      <div class="button-group">
        <button class="btn-secondary" id="closeMapThemeBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("closeMapThemeBtn").onclick = closeMapThemePage;
}

export function openMapThemePage() {
  document.getElementById("mapThemePage").style.display = "block";
  renderMapThemeList();
}

export function closeMapThemePage() {
  document.getElementById("mapThemePage").style.display = "none";
}

export function renderMapThemeList() {
  const container = document.getElementById("mapThemeList");
  container.innerHTML = "";

  MAP_THEMES.forEach(theme => {
    const owned = playerData.mapTheme.owned.includes(theme);
    const equipped = playerData.mapTheme.equipped === theme;

    const btn = document.createElement("button");
    btn.textContent = theme.toUpperCase() + (equipped ? " ✅" : "") + (!owned ? " 🔒" : "");
    btn.disabled = !owned;
    btn.onclick = () => {
      equipMapTheme(theme);
      renderMapThemeList();
    };
    container.appendChild(btn);
  });
}
