// scr/ui/gachaUI.js
import { state } from "../core/state.js";
import { GACHA_POOLS } from "../data/gachaPools.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { getBestTowerInPool, rollGacha } from "../systems/gachaSystem.js";
import { animateTowerPreview } from "./towerPreview.js";
import { getRarityTier, starString, dropChance } from "./rarityUtils.js";
import { showToast } from "./toast.js";

const POOL_META = {
  money_basic: { title: "เงินพื้นฐาน", tier: "tier-basic", badge: "TIER I" },
  money_mid: { title: "เงินกลาง", tier: "tier-mid", badge: "TIER II" },
  money_high: { title: "เงินขั้นสูง", tier: "tier-high", badge: "TIER III" },
  diamond: { title: "ตู้เพชร", tier: "tier-diamond", badge: "PREMIUM" },
};

// สำคัญ: ห้ามใช้ state.money/state.diamonds ตรงๆ ตรงนี้ — ระหว่างเล่นเวฟอยู่ ตัวเลขสองตัวนั้นจะถูก
// บวกเพิ่มแบบ "พรีวิว" ทันทีที่ฆ่าซอมบี้ (เพื่อความลื่นไหลของ HUD เท่านั้น ยังไม่ใช่เงินจริงที่ server ยืนยัน)
// ถ้าเอามาเช็คว่าซื้อกาชาได้ไหม จะเจอเคส "จอบอกมีพอ" แต่กดสุ่มแล้ว server ตอบ "เงินไม่พอ" เพราะเงินก้อนนั้น
// ยังไม่ถูกยืนยันจริง ให้ใช้ state.confirmedMoney/confirmedDiamonds ซึ่งอัปเดตเฉพาะตอน server ยืนยันแล้วเท่านั้น
function canAfford(pool, amount) {
  const cost = pool.cost * amount;
  return pool.currency === "diamond" ? state.confirmedDiamonds >= cost : state.confirmedMoney >= cost;
}

function statLine(t) {
  const isHealer = typeof t.healPercent === "number";
  return isHealer
    ? `💚 ฮีล ${(t.healPercent * 100).toFixed(1)}% · 🎯 ${t.healCount} ป้อม · ⏱ ${t.cooldown}s`
    : `🔫 ${t.damage} · ⌛ ${t.cooldown}s · 📏 ${t.range} · 🎯 ${t.target}`;
}

function createGachaCard(poolKey) {
  const meta = POOL_META[poolKey];
  const pool = GACHA_POOLS[poolKey];
  const bestTower = getBestTowerInPool(poolKey);
  const bestTier = getRarityTier(TOWER_TYPES[bestTower]?.rarity);
  const bestChance = bestTower ? dropChance(bestTower, pool.towers, TOWER_TYPES).toFixed(2) : "0";
  const icon = pool.currency === "diamond" ? "💎" : "💰";

  const afford1 = canAfford(pool, 1);
  const afford10 = canAfford(pool, 10);

  return `
    <div class="gacha-card ${meta.tier}">
      <div class="gacha-card-banner">${meta.badge}</div>
      <button class="gacha-info-btn" data-info="${poolKey}" aria-label="รายละเอียด">i</button>
      <div class="gacha-showcase">
        <canvas class="gacha-main-preview" data-type="${bestTower}" width="100" height="100"></canvas>
        <div class="gacha-best-label" style="--best-color:${bestTier.color}">
          <div class="gacha-best-name">⭐ ${bestTower?.toUpperCase() || "-"}</div>
          <div class="gacha-best-chance">${starString(bestTier.stars)} · ${bestChance}%</div>
        </div>
      </div>
      <h3>${meta.title}</h3>
      <button class="gacha-btn ${meta.tier}-btn" data-pool="${poolKey}" data-amount="1" ${afford1 ? "" : "disabled"}>
        <span>สุ่ม 1 ครั้ง</span><span class="gacha-btn-cost">${icon} ${pool.cost}</span>
      </button>
      <button class="gacha-btn ${meta.tier}-btn" data-pool="${poolKey}" data-amount="10" ${afford10 ? "" : "disabled"}>
        <span>สุ่ม 10 ครั้ง</span><span class="gacha-btn-cost">${icon} ${pool.cost * 10}</span>
      </button>
    </div>
  `;
}

function renderGachaContent() {
  const container = document.getElementById("gachaContainer");
  container.innerHTML = `
    <div class="gacha-title">🎰 Gacha Center</div>
    <div class="gacha-currency">
      <div class="gacha-currency-pill gacha-currency-money"><span>💰</span><span id="gachaMoney">${state.confirmedMoney}</span></div>
      <div class="gacha-currency-pill gacha-currency-diamond"><span>💎</span><span id="gachaDiamond">${state.confirmedDiamonds}</span></div>
    </div>
    <div class="gacha-grid">
      ${Object.keys(POOL_META).map(createGachaCard).join("")}
    </div>
    <button class="gacha-btn gacha-close" id="closeGachaBtn">ปิด</button>
  `;

  container.querySelectorAll(".gacha-main-preview").forEach(canvas => {
    const type = canvas.dataset.type;
    if (type) animateTowerPreview(canvas, type);
  });

  document.getElementById("closeGachaBtn").addEventListener("click", closeGachaPage);
}

export function initGachaUI() {
  const container = document.getElementById("gachaContainer");
  renderGachaContent();

  // ใช้ event delegation ตัวเดียวติดกับ container ตลอด (เรียก initGachaUI แค่ครั้งเดียวตอนเริ่มเกม)
  // เพราะ renderGachaContent() จะถูกเรียกซ้ำหลายรอบ (ทุกครั้งที่เปิดหน้า/สุ่มเสร็จ) แต่ไม่ผูก listener ซ้ำ
  container.addEventListener("click", async e => {
    const rollBtn = e.target.closest("[data-pool]");
    if (rollBtn) {
      if (rollBtn.disabled) return;
      const poolKey = rollBtn.dataset.pool;
      const amount = Number(rollBtn.dataset.amount);

      container.querySelectorAll("[data-pool]").forEach(b => (b.disabled = true));
      const originalHtml = rollBtn.innerHTML;
      rollBtn.innerHTML = `<span class="gacha-rolling">🎲 กำลังสุ่ม...</span>`;

      const result = await rollGacha(poolKey, amount);

      if (!result.ok) {
        showToast(result.message, "#ff5d5d");
        rollBtn.innerHTML = originalHtml;
        renderGachaContent();
      } else {
        renderGachaContent();
        showGachaResultModal(result.results.map(r => r.toLowerCase()));
      }
      return;
    }

    const infoBtn = e.target.closest("[data-info]");
    if (infoBtn) {
      openGachaInfo(infoBtn.dataset.info);
    }
  });
}

function showGachaResultModal(results) {
  const counts = {};
  results.forEach(t => { counts[t] = (counts[t] || 0) + 1; });

  let bestTier = { stars: 0 };
  results.forEach(t => {
    const tier = getRarityTier(TOWER_TYPES[t]?.rarity);
    if (tier.stars > bestTier.stars) bestTier = tier;
  });

  const cardsHtml = Object.entries(counts).map(([type, count]) => {
    const t = TOWER_TYPES[type];
    if (!t) return "";
    const tier = getRarityTier(t.rarity);
    return `
      <div class="gacha-result-card tier-${tier.key}" style="--tier-color:${tier.color}; --tier-glow:${tier.glow}">
        ${count > 1 ? `<div class="gacha-result-count">×${count}</div>` : ""}
        <canvas class="gacha-result-preview" data-type="${type}" width="76" height="76"></canvas>
        <div class="gacha-result-name">${type.toUpperCase()}</div>
        <div class="gacha-result-stars" style="color:${tier.color}">${starString(tier.stars)}</div>
      </div>
    `;
  }).join("");

  const overlay = document.createElement("div");
  overlay.className = "gacha-result-popup";
  overlay.innerHTML = `
    <div class="gacha-result-box tier-${bestTier.key || "common"}">
      <div class="gacha-result-title">🎉 ผลการสุ่ม (${results.length})</div>
      <div class="gacha-result-grid">${cardsHtml}</div>
      <button class="gacha-close-btn" id="gachaResultCloseBtn">รับไอเทม</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelectorAll(".gacha-result-preview").forEach(c => animateTowerPreview(c, c.dataset.type));
  overlay.querySelector("#gachaResultCloseBtn").onclick = () => overlay.remove();
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
}

export function openGachaInfo(poolKey) {
  const pool = GACHA_POOLS[poolKey];
  if (!pool) return;

  const sorted = [...pool.towers].sort(
    (a, b) => (TOWER_TYPES[a].rarity || 1) - (TOWER_TYPES[b].rarity || 1)
  );

  const overlay = document.createElement("div");
  overlay.className = "gacha-info-popup";

  let html = `<div class="gacha-info-box"><h2>${POOL_META[poolKey].title} — ของในตู้</h2><div class="gacha-info-grid">`;
  sorted.forEach(type => {
    const t = TOWER_TYPES[type];
    const tier = getRarityTier(t.rarity);
    const chance = dropChance(type, pool.towers, TOWER_TYPES).toFixed(2);
    html += `
      <div class="gacha-info-card tier-${tier.key}" style="--tier-color:${tier.color}">
        <canvas class="gacha-preview" data-type="${type}" width="80" height="80"></canvas>
        <div class="gacha-info-left">
          <b>${type.toUpperCase()}</b>
          <div class="gacha-info-tier" style="color:${tier.color}">${starString(tier.stars)} ${tier.label}</div>
          <div class="gacha-info-chance">🎲 โอกาส ${chance}%</div>
          <div class="gacha-info-stats">${statLine(t)}<br>❤️ ${t.hp}</div>
        </div>
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
  renderGachaContent();
  document.getElementById("gachaPage").style.display = "flex";
}

export function closeGachaPage() {
  document.getElementById("gachaPage").style.display = "none";
}

// เรียกทุกเฟรมจาก gameLoop เพื่อ sync ตัวเลขเงิน/เพชรบนหน้ากาชาให้ทันสถานะล่าสุดเสมอ
// (เบากว่า renderGachaContent() เต็มรูปแบบ เพราะแค่แก้ textContent ไม่รื้อ DOM/ปุ่มทั้งหมด)
export function updateGachaMoney() {
  const moneyEl = document.getElementById("gachaMoney");
  const diamondEl = document.getElementById("gachaDiamond");
  if (moneyEl) moneyEl.textContent = state.confirmedMoney;
  if (diamondEl) diamondEl.textContent = state.confirmedDiamonds;
}
