// src/ui/evolveUI.js
import { state } from "../core/state.js";
import { EVOLVE_TREE, isBaseType } from "../data/evolveTree.js";
import { evolveTower } from "../systems/evolveSystem.js";

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
}

export function openEvolvePage() {
  createEvolvePage();
  const page = document.getElementById("evolvePage");
  const container = document.getElementById("evolveList");
  container.innerHTML = "";

  for (const type in EVOLVE_TREE) {
    if (!isBaseType(type)) continue;
    const data = EVOLVE_TREE[type];
    const have = state.towerInventory[type] || 0;
    const canEvolve = have >= data.need;

    const card = document.createElement("div");
    card.className = "evolve-card";
    card.innerHTML = `
      <div class="evolve-card-title">${type.toUpperCase()}</div>
      <div class="evolve-card-info">ต้องใช้ ${data.need} | มี ${have}</div>
    `;

    const btn = document.createElement("button");
    btn.className = "evolve-btn evolve-btn-main";
    btn.textContent = canEvolve ? "EVOLVE" : "ไม่พอ";
    btn.disabled = !canEvolve;
    btn.onclick = () => {
      const result = evolveTower(type);
      if (result.ok) {
        showEvolveToast(`อีโวสำเร็จ → ${result.next.toUpperCase()}`);
        openEvolvePage();
      }
    };

    card.appendChild(btn);
    container.appendChild(card);
  }

  page.style.display = "flex";
}

export function closeEvolvePage() {
  const el = document.getElementById("evolvePage");
  if (el) el.style.display = "none";
}

// เดิมใช้ alert() บล็อกเกม (หยุดทั้งหน้าจอจนกว่าจะกด OK) — เปลี่ยนเป็น toast เบาๆ แทน
function showEvolveToast(text) {
  const toast = document.createElement("div");
  toast.textContent = text;
  Object.assign(toast.style, {
    position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
    background: "#222", color: "#fff", padding: "10px 18px", borderRadius: "8px",
    border: "1px solid #ffd700", zIndex: "10000", fontWeight: "bold",
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}
