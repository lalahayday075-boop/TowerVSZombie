// scr/ui/gachaUI.js
import { state } from "../core/state.js";
import { GACHA_POOLS } from "../data/gachaPools.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { getBestTowerInPool, rollGacha } from "../systems/gachaSystem.js";
import { animateTowerPreview } from "./towerPreview.js";

function createGachaCard(title, poolKey, btnClass) {
  const pool = GACHA_POOLS[poolKey];
  const bestTower = getBestTowerInPool(poolKey);
  return `
    <div class="gacha-card">
      <div class="gacha-info-btn" data-info="${poolKey}">!</div>
      <div class="gacha-showcase">
        <canvas class="gacha-main-preview" data-type="${bestTower}" width="110" height="110"></canvas>
        <div class="gacha-best-label">⭐ ไฮไลต์: ${bestTower?.toUpperCase()}</div>
      </div>
      <h3>${title} (${pool.cost})</h3>
      <button class="gacha-btn ${btnClass}" data-pool="${poolKey}" data-amount="1">สุ่ม 1 ครั้ง</button>
      <button class="gacha-btn ${btnClass}" data-pool="${poolKey}" data-amount="10">สุ่ม 10 ครั้ง</button>
    </div>
  `;
}

export function initGachaUI() {
  const container = document.getElementById("gachaContainer");

  container.innerHTML = `
    <div class="gacha-title">🎰 Gacha Center</div>
    <div class="gacha-currency">
      <div>💰 <span id="gachaMoney"></span></div>
      <div>💎 <span id="gachaDiamond"></span></div>
    </div>
    <div class="gacha-grid">
      ${createGachaCard("เงินพื้นฐาน", "money_basic", "money-btn")}
      ${createGachaCard("เงินกลาง", "money_mid", "money-btn")}
      ${createGachaCard("เงินขั้นสูง", "money_high", "money-btn")}
      ${createGachaCard("ตู้เพชร", "diamond", "diamond-btn")}
    </div>
    <button class="gacha-btn gacha-close" id="closeGachaBtn">ปิด</button>
  `;

  container.addEventListener("click", async e => {
    if (e.target.dataset.pool) {
      const result = await rollGacha(e.target.dataset.pool, Number(e.target.dataset.amount));
      updateGachaMoney();
      if (!result.ok) alert(result.message);
      else alert(`ได้: ${result.results.join(", ")}`);
      return;
    }
    if (e.target.dataset.info) {
      openGachaInfo(e.target.dataset.info);
      return;
    }
  });

  container.querySelectorAll(".gacha-main-preview").forEach(canvas => {
    const type = canvas.dataset.type;
    if (type) animateTowerPreview(canvas, type);
  });

  document.getElementById("closeGachaBtn").addEventListener("click", closeGachaPage);
}

export function openGachaInfo(poolKey) {
  const pool = GACHA_POOLS[poolKey];
  if (!pool) return;

  const overlay = document.createElement("div");
  overlay.className = "gacha-info-popup";

  let html = `<div class="gacha-info-box"><h2>ของในตู้</h2><div class="gacha-info-grid">`;
  pool.towers.forEach(type => {
    const t = TOWER_TYPES[type];
    const isHealer = typeof t.healPercent === "number";
    html += `
      <div class="gacha-info-card">
        <div class="gacha-info-left">
          <b>${type.toUpperCase()}</b><br>
          ${isHealer ? `
            💚 ฮีล ${(t.healPercent * 100).toFixed(1)}%<br>
            🎯 ฮีล ${t.healCount} ป้อม<br>
            ⏱ ${t.cooldown}s<br>
          ` : `
            🔫 ${t.damage}<br>
            ⌛ ${t.cooldown}s<br>
            📏 ${t.range}<br>
            🎯 ${t.target}<br>
          `}
          ❤️ ${t.hp}
        </div>
        <canvas class="gacha-preview" data-type="${type}" width="90" height="90"></canvas>
      </div>
    `;
  });
  html += `</div><button class="gacha-close-btn">ปิด</button></div>`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.querySelector(".gacha-close-btn").onclick = () => overlay.remove();
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.querySelectorAll(".gacha-preview").forEach(canvas => animateTowerPreview(canvas, canvas.dataset.type));
}

export function openGachaPage() {
  document.getElementById("gachaPage").style.display = "flex";
  updateGachaMoney();
}

export function closeGachaPage() {
  document.getElementById("gachaPage").style.display = "none";
}

export function updateGachaMoney() {
  const moneyEl = document.getElementById("gachaMoney");
  const diamondEl = document.getElementById("gachaDiamond");
  if (moneyEl) moneyEl.textContent = state.money;
  if (diamondEl) diamondEl.textContent = state.diamonds;
}
