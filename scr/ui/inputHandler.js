// src/ui/inputHandler.js
import { state } from "../core/state.js";
import { openTowerInspect } from "./towerPopupUI.js";
import { openTowerPopup } from "./towerPopupUI.js";

const CLICK_RADIUS = 28;

export function initInputHandler(canvas) {
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const candidates = state.zombies.filter(z => {
      if (z.hp <= 0 || z.dead) return false;
      return Math.hypot(mx - z.x, my - z.y) <= CLICK_RADIUS;
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.y - a.y);
      if (!state.focusedZombie || !candidates.includes(state.focusedZombie)) {
        state.focusedZombie = candidates[0];
      } else {
        const idx = candidates.indexOf(state.focusedZombie);
        state.focusedZombie = candidates[(idx + 1) % candidates.length];
      }
      return;
    }

    for (const t of state.towers) {
      if (!t.dead && Math.abs(mx - t.x) < 14 && Math.abs(my - t.y) < 14) {
        openTowerInspect(t);
        return;
      }
    }

    for (const slot of state.buildSlots) {
      if (!slot.occupied && Math.abs(mx - slot.x) < 20 && Math.abs(my - slot.y) < 20) {
        state.pendingSlot = slot;
        openTowerPopup();
        return;
      }
    }
  });
}
