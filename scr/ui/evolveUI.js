// scr/ui/evolveUI.js
import { state } from "../core/state.js";
import { EVOLVE_TREE, isBaseType } from "../data/evolveTree.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { evolveTower } from "../systems/evolveSystem.js";
import { animateTowerPreview } from "./towerPreview.js";
import { getRarityTier, starString } from "./rarityUtils.js";
import { showToast } from "./toast.js";

export function createEvolvePage() {
  if (document.getElementById("evolvePage")) return;

  const overlay = document.createElement("div");
  overlay.id = "evolvePage";
  overlay.className = "evolve-overlay";

  overlay.innerHTML = `
    <div class="evolve-box">
      <div class="evolve-title">🧬 EVOLVE TOWER</div>
      <div id="evolveList" class="evolve-list"></div>
      <div class="evolve-actions">
        <button class="evolve-btn evolve-btn-close" id="evolveCloseBtn">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("evolveCloseBtn").onclick = closeEvolvePage;
  overlay.addEventListener("click", e => { if (e.target === overlay) closeEvolvePage(); });
}

// เปรียบเทียบสเตตัสก่อน/หลังอีโว 1 บรรทัด พร้อมไฮไลต์ว่าดีขึ้น(เขียว)/แย่ลง(แดง)
function statRow(icon, label, before, after, opts = {}) {
  const { higherIsBetter = true, decimals = 1, suffix = "" } = opts;
  const b = Number(before).toFixed(decimals);
  const a = Number(after).toFixed(decimals);
  const changed = b !== a;
  const improved = higherIsBetter ? after > before : after < before;
  const afterClass = changed ? (improved ? "evo-stat-up" : "evo-stat-down") : "evo-stat-same";
  return `
    <div class="evo-stat-row">
      <div class="evo-stat-label">${icon} ${label}</div>
      <div class="evo-stat-values">
        <span class="evo-stat-before">${b}${suffix}</span>
        ${changed ? `<span class="evo-stat-arrow">→</span>` : ""}
        <span class="${afterClass}">${a}${suffix}</span>
      </div>
    </div>
  `;
}

function buildStatsHtml(before, after) {
  const isHealer = typeof before.healPercent === "number";
  if (isHealer) {
    return (
      statRow("💚", "ฮีล", before.healPercent * 100, after.healPercent * 100, { suffix: "%" }) +
      statRow("🎯", "จำนวนเป้าฮีล", before.healCount, after.healCount, { decimals: 0 }) +
      statRow("⏱", "คูลดาวน์", before.cooldown, after.cooldown, { higherIsBetter: false, suffix: "s" }) +
      statRow("❤️", "HP", before.hp, after.hp, { decimals: 0 })
    );
  }
  return (
    statRow("🔫", "ดาเมจ", before.damage, after.damage) +
    statRow("📏", "ระยะ", before.range, after.range, { decimals: 0 }) +
    statRow("⌛", "คูลดาวน์", before.cooldown, after.cooldown, { higherIsBetter: false, suffix: "s" }) +
    statRow("❤️", "HP", before.hp, after.hp, { decimals: 0 })
  );
}

export function openEvolvePage() {
  createEvolvePage();
  const page = document.getElementById("evolvePage");
  const container = document.getElementById("evolveList");
  container.innerHTML = "";

  let anyCard = false;

  for (const type in EVOLVE_TREE) {
    if (!isBaseType(type)) continue;
    const data = EVOLVE_TREE[type];
    const before = TOWER_TYPES[type];
    const after = TOWER_TYPES[data.next];
    if (!before || !after) continue;

    anyCard = true;
    const have = state.towerInventory[type] || 0;
    const canEvolve = have >= data.need;
    const progressPct = Math.min(100, (have / data.need) * 100);
    const beforeTier = getRarityTier(before.rarity);
    const afterTier = getRarityTier(after.rarity);

    const card = document.createElement("div");
    card.className = `evolve-card${canEvolve ? " ready" : ""}`;
    card.innerHTML = `
      <div class="evolve-card-top">
        <div class="evolve-preview-wrap">
          <canvas class="evolve-preview" data-type="${type}" width="62" height="62"></canvas>
          <div class="evolve-preview-stars" style="color:${beforeTier.color}">${starString(beforeTier.stars)}</div>
        </div>
        <div class="evolve-arrow${canEvolve ? " ready" : ""}">➜</div>
        <div class="evolve-preview-wrap${canEvolve ? "" : " locked"}">
          <canvas class="evolve-preview" data-type="${data.next}" width="62" height="62"></canvas>
          <div class="evolve-preview-stars" style="color:${afterTier.color}">${starString(afterTier.stars)}</div>
        </div>
      </div>
      <div class="evolve-card-title">${type.toUpperCase()} <span class="evolve-card-arrow-inline">→</span> ${data.next.toUpperCase()}</div>
      <div class="evolve-progress">
        <div class="evolve-progress-track">
          <div class="evolve-progress-fill${canEvolve ? " ready" : ""}" style="width:${progressPct}%"></div>
        </div>
        <div class="evolve-progress-text">${have} / ${data.need} ตัว</div>
      </div>
      <div class="evolve-stats">${buildStatsHtml(before, after)}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "evolve-btn evolve-btn-main";
    btn.textContent = canEvolve ? "✨ อีโวเลย" : `ต้องการอีก ${data.need - have} ตัว`;
    btn.disabled = !canEvolve;
    btn.onclick = async () => {
      btn.disabled = true;
      const originalText = btn.textContent;
      btn.textContent = "กำลังอีโว...";
      const result = await evolveTower(type);
      if (result.ok) {
        showToast(`✨ อีโวสำเร็จ → ${result.next.toUpperCase()}`, afterTier.color);
        openEvolvePage();
      } else {
        showToast(result.message, "#ff5d5d");
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };

    card.appendChild(btn);
    container.appendChild(card);

    card.querySelectorAll(".evolve-preview").forEach(canvas => {
      animateTowerPreview(canvas, canvas.dataset.type);
    });
  }

  if (!anyCard) {
    container.innerHTML = `<div class="evolve-empty">ยังไม่มีป้อมที่อีโวได้ตอนนี้</div>`;
  }

  page.style.display = "flex";
}

export function closeEvolvePage() {
  const el = document.getElementById("evolvePage");
  if (el) el.style.display = "none";
}
