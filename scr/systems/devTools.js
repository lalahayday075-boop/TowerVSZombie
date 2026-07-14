// scr/systems/devTools.js
import { state } from "../core/state.js";
import { devState } from "./devState.js";
import { TOWER_TYPES } from "../data/towerTypes.js";
import { ENEMY_BASE } from "../data/waveConfig.js";
import { Tower } from "../entities/Tower.js";
import { Zombie } from "../entities/Zombie.js";
import { applyTowerUpgrade } from "./towerSystem.js";
import { getEnemyStats, calcSpeed, calcRewardByWave } from "./waveScaling.js";
import { updateZombieUI, updateUI } from "../ui/hud.js";
import { clearWaveInstantFull, spawnWave } from "./waveController.js";

let DEV_CREATED = false;
let devOpen = false;
let refreshTowerInspectAll = () => {};
let closeTowerInspect = () => {};

export function initDevTools(hooks = {}) {
  refreshTowerInspectAll = hooks.refreshTowerInspectAll || refreshTowerInspectAll;
  closeTowerInspect = hooks.closeTowerInspect || closeTowerInspect;

  if (!devState.DEV_MODE) return;
  document.addEventListener("DOMContentLoaded", createDevUI);
  if (document.readyState !== "loading") createDevUI();
}

function createDevUI() {
  if (DEV_CREATED || !devState.DEV_MODE) return;
  DEV_CREATED = true;

  const wrapper = document.createElement("div");
  wrapper.id = "dev-wrapper";
  Object.assign(wrapper.style, {
    position: "fixed", top: "60px", right: "10px", zIndex: "9999",
    background: "#111", padding: "8px", border: "1px solid #555",
    fontSize: "12px", color: "#fff", width: "60vw", maxWidth: "380px",
    maxHeight: "75vh", overflowY: "auto", boxShadow: "0 0 12px #000",
  });

  wrapper.innerHTML = `
    <button id="dev-toggle">🛠 DEV</button>
    <div id="dev-ui" style="max-height:0;overflow:hidden;margin-top:6px;background:#181818;border:1px solid #444;transition:max-height 0.35s cubic-bezier(.4,0,.2,1);">
      <div id="dev-scroll" style="max-height:40vh;overflow-y:auto;padding:6px;">
        <select id="dev-speed-select">
          <option value="0.5">0.5x</option>
          <option value="1" selected>1x</option>
          <option value="2">2x</option>
          <option value="3">3x</option>
          <option value="5">5x</option>
        </select>
        <button id="dev-clear">⚡ ชนะเวฟทันที</button>
        <button id="dev-pause">⏸ หยุดเกม</button>
        <button id="dev-immortal">🛡 ป้อมอมตะ</button>
        <input id="dev-wave-input" type="number" min="1" placeholder="เวฟ" style="width:60px">
        <button id="dev-jump-wave">⏭ ไปเวฟ</button>
        <hr>
        <input id="dev-amount-input" type="number" placeholder="จำนวน" style="width:80px">
        <button id="dev-add-money">➕ เงิน</button>
        <button id="dev-add-diamond">💎 เพชร</button>
        <hr>
        <select id="devTowerType"></select>
        <select id="devTowerLevel" style="width:60px">
          <option value="1">Lv 1</option><option value="5">Lv 5</option>
          <option value="7">Lv 7</option><option value="15">Lv 15</option>
          <option value="30" selected>Lv 30</option>
        </select>
        <button id="dev-summon-tower">🧙‍♂️ เสกป้อม</button>
        <button id="dev-clear-tower">🗑 ลบป้อมทั้งหมด</button>
        <hr>
        <select id="devZombieType"><option value="ground">ground</option><option value="air">air</option></select>
        <select id="devZombieMode"><option value="melee">melee</option><option value="ranged">ranged</option><option value="lightning">lightning</option></select>
        <label><input type="checkbox" id="devZombieBoss"> BOSS</label>
        <input id="devZombieCount" type="number" value="1" min="1" style="width:50px">
        <br>
        HP <input id="devZombieHP" type="number" placeholder="auto" style="width:60px">
        SPD <input id="devZombieSpeed" type="number" placeholder="auto" style="width:60px">
        DMG <input id="devZombieDmg" type="number" placeholder="auto" style="width:60px">
        <button id="dev-summon-zombie">☠️ เสกซอมบี้</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);

  document.getElementById("dev-toggle").onclick = toggleDevUI;
  document.getElementById("dev-clear").onclick = clearWaveInstantFull;
  document.getElementById("dev-pause").onclick = toggleDevPause;
  document.getElementById("dev-immortal").onclick = toggleDevImmortal;
  document.getElementById("dev-speed-select").onchange = setGameSpeed;
  document.getElementById("dev-add-money").onclick = () => devAddResource("money");
  document.getElementById("dev-add-diamond").onclick = () => devAddResource("diamond");
  document.getElementById("dev-summon-tower").onclick = devSummonTower;
  document.getElementById("dev-clear-tower").onclick = devClearAllTowers;
  document.getElementById("dev-jump-wave").onclick = devJumpWave;
  document.getElementById("dev-summon-zombie").onclick = devSummonZombie;

  initDevTowerList();
}

function toggleDevUI() {
  if (!devState.DEV_MODE) return;
  if (!DEV_CREATED) createDevUI();
  devOpen = !devOpen;
  updateDevUI();
}

function updateDevUI() {
  if (!devState.DEV_MODE) return;
  const devUI = document.getElementById("dev-ui");
  if (!devUI) return;
  devUI.style.maxHeight = devOpen ? "65vh" : "0px";
}

function initDevTowerList() {
  const sel = document.getElementById("devTowerType");
  sel.innerHTML = "";
  for (const type in TOWER_TYPES) {
    const opt = document.createElement("option");
    opt.value = type; opt.textContent = type;
    sel.appendChild(opt);
  }
}

function devSummonTower() {
  if (!devState.DEV_MODE) return;
  const type = document.getElementById("devTowerType").value;
  const level = Math.max(1, parseInt(document.getElementById("devTowerLevel").value || 1));

  const slot = state.buildSlots.find(s => !s.occupied);
  if (!slot) return;

  const tower = new Tower(slot.x, slot.y, type);
  tower.slot = slot;
  for (let i = 1; i < level; i++) applyTowerUpgrade(tower);

  state.towers.push(tower);
  slot.occupied = true;
  slot.towerRef = tower;
  slot.towerType = type;

  refreshTowerInspectAll();
  updateUI();
}

function devSummonZombie() {
  if (!devState.DEV_MODE) return;
  const type = document.getElementById("devZombieType").value;
  const mode = document.getElementById("devZombieMode").value;
  const isBoss = document.getElementById("devZombieBoss").checked;
  const count = Math.max(1, parseInt(document.getElementById("devZombieCount").value || 1));

  const inputHP = parseFloat(document.getElementById("devZombieHP").value);
  const inputSpeed = parseFloat(document.getElementById("devZombieSpeed").value);
  const inputDmg = parseFloat(document.getElementById("devZombieDmg").value);

  let key = `${type}_${mode}`;
  if (isBoss) {
    if (key === "ground_melee") key = "boss_ground";
    if (key === "air_melee") key = "boss_air";
  }
  const baseStats = ENEMY_BASE[key] ? getEnemyStats(key, state.wave) : null;

  for (let i = 0; i < count; i++) {
    const hp = inputHP > 0 ? inputHP : baseStats ? baseStats.hp : 100;
    const damage = inputDmg > 0 ? inputDmg : baseStats ? baseStats.damage : 10;
    const speed = inputSpeed > 0 ? inputSpeed : calcSpeed(type === "air" ? 90 : 80, state.wave, 0.45, type === "air" ? 300 : 290);
    const reward = calcRewardByWave(state.wave, isBoss);

    state.zombies.push(new Zombie(type, hp, speed, damage, reward, isBoss, mode));
    state.zombiesTotalThisWave++;
  }

  updateZombieUI();
}

function toggleDevPause() {
  if (!devState.DEV_MODE) return;
  devState.DEV_PAUSE = !devState.DEV_PAUSE;
}

function toggleDevImmortal() {
  if (!devState.DEV_MODE) return;
  devState.DEV_TOWER_IMMORTAL = !devState.DEV_TOWER_IMMORTAL;
  if (devState.DEV_TOWER_IMMORTAL) {
    for (const t of state.towers) { t.hp = t.maxHp; t.dead = false; t.destroying = false; }
  }
}

function devJumpWave() {
  if (!devState.DEV_MODE) return;
  const targetWave = parseInt(document.getElementById("dev-wave-input").value);
  if (!targetWave || targetWave < 1) return;

  if (state.spawnTimer) { clearTimeout(state.spawnTimer); state.spawnTimer = null; }

  state.zombies.length = 0;
  state.bullets.length = 0;
  state.zombieProjectiles.length = 0;
  state.waveSpawning = false;
  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;

  state.wave = targetWave;
  state.waveTimeLeft = 60;

  updateZombieUI();
  updateUI();

  spawnWave();
}

function devClearAllTowers() {
  if (!devState.DEV_MODE) return;
  for (let i = state.towers.length - 1; i >= 0; i--) {
    const tower = state.towers[i];
    for (const z of state.zombies) {
      if (z.targetTower === tower) z.targetTower = null;
    }
    const slot = tower.slot;
    if (slot) {
      slot.occupied = false;
      slot.towerRef = null;
      slot.respawning = false;
      if (slot.respawnTimer) { clearTimeout(slot.respawnTimer); slot.respawnTimer = null; }
    }
    state.towers.splice(i, 1);
  }
  state.selectedTower = null;
  closeTowerInspect();
  updateUI();
}

function devAddResource(type) {
  if (!devState.DEV_MODE) return;
  const amount = parseInt(document.getElementById("dev-amount-input").value);
  if (!amount) return;
  if (type === "money") state.money += amount;
  else if (type === "diamond") state.diamonds += amount;
  updateUI();
}

function setGameSpeed() {
  if (!devState.DEV_MODE) return;
  const val = parseFloat(document.getElementById("dev-speed-select").value);
  devState.GAME_SPEED = val || 1;
}
