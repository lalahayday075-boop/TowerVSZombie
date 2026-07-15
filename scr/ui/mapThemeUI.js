// scr/ui/mapThemeUI.js
import { playerData } from "../systems/playerData.js";
import { MAP_THEMES } from "../render/mapThemes.js";
import { equipMapTheme } from "../systems/unlockSystem.js";

// พรีวิวสีของแต่ละธีม ให้ตรงกับที่วาดจริงใน render/mapThemes.js มากที่สุด
// (การ์ดจะได้ไม่ใช่แค่ตัวหนังสือเปล่าๆ เห็นโทนสีจริงก่อนเลือก)
const THEME_META = {
  default: { label: "ค่าเริ่มต้น", swatch: "linear-gradient(160deg,#3a3a3a,#242424)" },
  Songkran: { label: "สงกรานต์", swatch: "linear-gradient(160deg,#f2efe6,#bfe3ff 55%,#ff8fb3)" },
  lava: { label: "ลาวา", swatch: "linear-gradient(160deg,#8b1a1a,#3b0f0f)" },
  forest: { label: "ป่าเขียว", swatch: "linear-gradient(160deg,#355e3b,#1e3d1e)" },
};

export function createMapThemePage() {
  const overlay = document.createElement("div");
  overlay.id = "mapThemePage";
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="panel">
      <h2>🗺️ เลือกธีมแมพ</h2>
      <div id="mapThemeList"></div>
      <div class="button-group">
        <button class="btn-secondary" id="closeMapThemeBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("closeMapThemeBtn").onclick = closeMapThemePage;
  overlay.addEventListener("click", e => { if (e.target === overlay) closeMapThemePage(); });
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
  container.className = "map-theme-grid";

  MAP_THEMES.forEach(theme => {
    const owned = playerData.mapTheme.owned.includes(theme);
    const equipped = playerData.mapTheme.equipped === theme;
    const meta = THEME_META[theme] || { label: theme.toUpperCase(), swatch: "#333" };

    const btn = document.createElement("button");
    btn.className = "map-theme-btn" + (equipped ? " equipped" : "") + (!owned ? " locked" : "");
    btn.innerHTML = `
      <span class="map-theme-swatch" style="background:${meta.swatch}"></span>
      <span class="map-theme-info">
        <span class="map-theme-name">${meta.label}</span>
        <span class="map-theme-state">${equipped ? "ใช้อยู่" : !owned ? "ยังไม่ปลดล็อก" : "แตะเพื่อใช้"}</span>
      </span>
    `;
    btn.disabled = !owned;
    btn.onclick = () => {
      equipMapTheme(theme);
      renderMapThemeList();
    };
    container.appendChild(btn);
  });
}
