// scr/ui/zombieSkinUI.js
import { playerData } from "../systems/playerData.js";
import { ZOMBIE_TYPES, ZOMBIE_SKIN_AVAILABILITY, equipZombieSkin } from "../systems/unlockSystem.js";

export function openZombieSkinPage() {
  const overlay = document.createElement("div");
  overlay.className = "zombie-overlay";
  overlay.id = "zombieSkinPage";

  let html = `<div class="zombie-panel"><h2>จัดการสกินซอมบี้</h2><div class="zombie-scroll-area">`;

  ZOMBIE_TYPES.forEach(type => {
    const owned = playerData.zombieSkin.owned[type] || [];
    const equipped = playerData.zombieSkin.equipped[type];

    html += `
      <div class="zombie-type-block">
        <div class="zombie-type-header"><div class="type-icon">🧟</div><div class="type-info"><div class="type-name"> data-type="${type}"><span class="arrow"></span>${type}</div><div class="type-count">${owned.length} Owned</div></div>
        <div class="zombie-type-content" id="content-${type}">
    `;

    Object.keys(ZOMBIE_SKIN_AVAILABILITY).forEach(name => {
      if (!ZOMBIE_SKIN_AVAILABILITY[name].includes(type)) return;
      const isOwned = owned.includes(name);
      const isEquipped = equipped === name;
      html += `
        <div class="zombie-row">
          ${name}
          ${isOwned
            ? `<button class="btn-primary equipZombieSkinBtn" data-type="${type}" data-name="${name}" ${isEquipped ? "disabled" : ""}>${isEquipped ? "✔ กำลังใช้" : "ใช้"}</button>`
            : `<span style="color:#ff4d4d">🔒</span>`}
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `</div><div class="zombie-button-group"><button class="btn-secondary" id="closeZombieSkinBtn">ปิด</button></div></div>`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.querySelectorAll(".zombie-type-header").forEach(header => {
    header.addEventListener("click", () => {
      const type = header.dataset.type;
      const content = document.getElementById(`content-${type}`);
      const isOpen = content.classList.toggle("open");
      header.classList.toggle("open", isOpen);
    });
  });

  overlay.querySelectorAll(".equipZombieSkinBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      equipZombieSkin(btn.dataset.type, btn.dataset.name);
      overlay.remove();
      openZombieSkinPage();
    });
  });

  document.getElementById("closeZombieSkinBtn").addEventListener("click", () => overlay.remove());
}
