// scr/ui/hud.js
import { state } from "../core/state.js";

let els = null;

export function initHud() {
  els = {
    money: document.getElementById("money"),
    wave: document.getElementById("wave"),
    time: document.getElementById("time"),
    diamond: document.getElementById("diamond"),
    zombieLeft: document.getElementById("zombieLeft"),
  };
}

export function updateZombieUI() {
  if (!els) return;
  const left = state.zombiesTotalThisWave - state.zombiesKilledThisWave;
  els.zombieLeft.textContent = `${left} / ${state.zombiesTotalThisWave}`;
}

export function updateUI(renderTowerPopupIfOpen) {
  if (!els) return;
  els.money.textContent = state.money;
  els.wave.textContent = state.wave;
  els.time.textContent = Math.ceil(state.waveTimeLeft);
  els.diamond.textContent = state.diamonds;

  const popup = document.getElementById("towerPopup");
  if (popup && popup.style.display === "block" && renderTowerPopupIfOpen) {
    renderTowerPopupIfOpen();
  }
}
