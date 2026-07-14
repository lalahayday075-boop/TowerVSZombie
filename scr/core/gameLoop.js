// scr/core/gameLoop.js
import { state, WAVE_TIME_LIMIT } from "./state.js";
import { canvasRef } from "./canvasRef.js";
import { devState } from "../systems/devState.js";
import { destroyTower } from "../entities/Tower.js";
import { updateZombies, drawZombiesLayer } from "../systems/zombieRuntime.js";
import { updateBlood } from "../systems/bloodSystem.js";
import { updateDamagePopups, drawDamagePopups } from "../systems/damageSystem.js";
import { updateMoneyPopups, updateDiamondPopups } from "../systems/dropSystem.js";
import { drawMapTheme } from "../render/mapThemes.js";
import { spawnWave, failWave } from "../systems/waveController.js";
import { updateUI } from "../ui/hud.js";
import { refreshTowerInspectAll, refreshTowerInspectLive } from "../ui/towerPopupUI.js";
import { refreshProfileUI } from "../ui/profileUI.js";
import { updateGachaMoney } from "../ui/gachaUI.js";

export function startGameLoop() {
  state.lastTime = performance.now();
  requestAnimationFrame(update);
}

function update(time) {
  const { canvas, ctx } = canvasRef;

  if (devState.DEV_PAUSE) {
    state.lastTime = time;
    requestAnimationFrame(update);
    return;
  }

  if (state.isGameOver) {
    requestAnimationFrame(update);
    return;
  }

  let dt = (time - state.lastTime) / 1000;
  state.lastTime = time;
  dt *= devState.GAME_SPEED;

  state.totalPlayTime += dt;
  state.waveTimeLeft -= dt;

  updateUI();

  if (state.selectedTower) refreshTowerInspectAll();
  if (state.waveTimeLeft <= 0) failWave();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMapTheme();

  for (const s of state.buildSlots) {
    ctx.strokeStyle = s.occupied ? "#555" : "#aaa";
    ctx.strokeRect(s.x - 16, s.y - 16, 32, 32);
  }

  for (let i = state.towers.length - 1; i >= 0; i--) {
    const t = state.towers[i];
    t.update(dt);
    t.draw(ctx);
    if (t.hp <= 0 && !t.destroying && !t.dead) destroyTower(t);
  }

  updateBlood(dt, ctx);
  updateZombies(dt);
  drawZombiesLayer();
  updateMoneyPopups(dt, ctx);
  updateDiamondPopups(dt, ctx);
  updateGachaMoney();
  refreshTowerInspectLive();
  updateDamagePopups(dt);
  drawDamagePopups(ctx);
  refreshProfileUI();

  for (let i = state.zombieProjectiles.length - 1; i >= 0; i--) {
    const p = state.zombieProjectiles[i];
    p.update(dt);
    p.draw(ctx);
    if (p.hit) state.zombieProjectiles.splice(i, 1);
  }

  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    b.update();
    b.draw(ctx);
    if (b.hit) state.bullets.splice(i, 1);
  }

  if (state.zombies.length === 0 && !state.waveSpawning) {
    state.wave++;
    state.waveTimeLeft = WAVE_TIME_LIMIT;
    updateUI();
    spawnWave();
  }

  requestAnimationFrame(update);
}
