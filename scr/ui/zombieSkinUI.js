// scr/ui/zombieSkinUI.js
import { playerData } from "../systems/playerData.js";
import { ZOMBIE_TYPES, ZOMBIE_SKIN_AVAILABILITY, equipZombieSkin } from "../systems/unlockSystem.js";
import { animateZombiePreview } from "./zombiePreview.js";
import { showToast } from "./toast.js";

// ป้ายชื่อ/ไอคอนภาษาไทยของแต่ละประเภทซอมบี้ ให้อ่านง่ายกว่าคีย์ดิบ
const TYPE_META = {
  ground_melee:      { label: "พื้นดิน · ประชิด",   icon: "🧟" },
  ground_ranged:     { label: "พื้นดิน · ระยะไกล",  icon: "🔫" },
  ground_lightning:  { label: "พื้นดิน · สายฟ้า",   icon: "⚡" },
  air_melee:         { label: "บิน · ประชิด",       icon: "🦇" },
  air_ranged:        { label: "บิน · ระยะไกล",      icon: "🏹" },
  air_lightning:     { label: "บิน · สายฟ้า",       icon: "🌩️" },
  boss_ground_melee: { label: "บอส · พื้นดิน",      icon: "👹" },
  boss_air_melee:    { label: "บอส · บิน",          icon: "💀" },
};

// ป้ายชื่อ/แท็กของแต่ละชุดสกิน
const SKIN_META = {
  default: { label: "ปกติ", tag: "พื้นฐาน", tagClass: "common" },
  Songkran: { label: "สงกรานต์", tag: "อีเวนต์", tagClass: "event" },
};

function skinMeta(name) {
  return SKIN_META[name] || { label: name, tag: "สกิน", tagClass: "common" };
}

function typeMeta(type) {
  return TYPE_META[type] || { label: type, icon: "🧟" };
}

let activeType = ZOMBIE_TYPES[0];

export function openZombieSkinPage() {
  if (document.getElementById("zombieSkinPage")) return;

  const overlay = document.createElement("div");
  overlay.className = "zombie-overlay";
  overlay.id = "zombieSkinPage";

  overlay.innerHTML = `
    <div class="zombie-panel">
      <div class="zombie-panel-header">
        <div>
          <h2>จัดการสกินซอมบี้</h2>
          <div class="zombie-subtitle">เลือกลายให้ซอมบี้แต่ละประเภทในสนามของคุณ</div>
        </div>
        <button class="zombie-close-x" id="closeZombieSkinBtn" aria-label="ปิด">✕</button>
      </div>

      <div class="zombie-tabs" id="zombieTabs"></div>

      <div class="zombie-scroll-area">
        <div class="zombie-grid" id="zombieGrid"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeZombieSkinPage();
  });
  document.getElementById("closeZombieSkinBtn").addEventListener("click", closeZombieSkinPage);

  renderTabs(overlay);
  renderGrid(overlay);
}

function closeZombieSkinPage() {
  document.getElementById("zombieSkinPage")?.remove();
}

function renderTabs(overlay) {
  const tabs = overlay.querySelector("#zombieTabs");
  tabs.innerHTML = ZOMBIE_TYPES.map((type) => {
    const meta = typeMeta(type);
    const isActive = type === activeType;
    return `
      <button class="zombie-tab${isActive ? " active" : ""}" data-type="${type}">
        <span class="zombie-tab-icon">${meta.icon}</span>
        <span class="zombie-tab-label">${meta.label}</span>
      </button>
    `;
  }).join("");

  tabs.querySelectorAll(".zombie-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (activeType === btn.dataset.type) return;
      activeType = btn.dataset.type;
      tabs.querySelectorAll(".zombie-tab").forEach((b) => b.classList.toggle("active", b === btn));
      renderGrid(overlay);
    });
  });
}

function renderGrid(overlay) {
  const grid = overlay.querySelector("#zombieGrid");
  const type = activeType;
  const owned = playerData.zombieSkin.owned[type] || [];
  const equipped = playerData.zombieSkin.equipped[type];

  const skinNames = Object.keys(ZOMBIE_SKIN_AVAILABILITY).filter((name) =>
    ZOMBIE_SKIN_AVAILABILITY[name].includes(type)
  );

  grid.innerHTML = skinNames.map((name) => {
    const isOwned = owned.includes(name);
    const isEquipped = equipped === name;
    const meta = skinMeta(name);

    return `
      <div class="zombie-card${isEquipped ? " equipped" : ""}${isOwned ? "" : " locked"}" data-name="${name}">
        <div class="zombie-card-tag zombie-tag-${meta.tagClass}">${meta.tag}</div>
        <div class="zombie-preview-wrap">
          <canvas class="zombie-preview" data-name="${name}" data-type="${type}" width="120" height="120"></canvas>
          ${!isOwned ? `<div class="zombie-lock-overlay">🔒</div>` : ""}
        </div>
        <div class="zombie-card-name">${meta.label}</div>
        ${
          isOwned
            ? `<button class="zombie-equip-btn${isEquipped ? " is-equipped" : ""}" data-type="${type}" data-name="${name}" ${isEquipped ? "disabled" : ""}>
                 ${isEquipped ? "✔ กำลังใช้" : "สวมใส่"}
               </button>`
            : `<button class="zombie-equip-btn is-locked" data-locked="1">ยังไม่ปลดล็อก</button>`
        }
      </div>
    `;
  }).join("");

  // เริ่มพรีวิวเคลื่อนไหวของทุกการ์ดในแท็บนี้
  grid.querySelectorAll(".zombie-preview").forEach((canvas) => {
    animateZombiePreview(canvas, canvas.dataset.name, canvas.dataset.type);
  });

  grid.querySelectorAll(".zombie-equip-btn:not(.is-locked)").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (btn.disabled) return;
      btn.disabled = true;
      await equipZombieSkin(btn.dataset.type, btn.dataset.name);
      showToast(`สวมสกิน "${skinMeta(btn.dataset.name).label}" แล้ว`, "#3cff9d");
      renderGrid(overlay);
    });
  });

  grid.querySelectorAll(".zombie-equip-btn.is-locked").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("ยังไม่ปลดล็อกสกินนี้", "#ff5d5d");
    });
  });
}
