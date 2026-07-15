// scr/ui/towerPopupUI.js
import { state } from "../core/state.js";
import { TOWER_TYPES, MAX_TOWER_LEVEL } from "../data/towerTypes.js";
import { playerData, savePlayerData } from "../systems/playerData.js";
import { SKIN_DATABASE } from "../render/towerSkins/index.js";
import { getUpgradeCost, upgradeTower as doUpgradeTower, sellTower as doSellTower, placeTower } from "../systems/towerSystem.js";
import { animateTowerPreview } from "./towerPreview.js";
import { updateUI } from "./hud.js";
import { api } from "../systems/api.js";
import { applyFullGameData, saveGame } from "../systems/saveSystem.js";

export function renderTowerPopup() {
  const list = document.getElementById("towerList");
  list.innerHTML = "";

  for (const type in state.towerInventory) {
    if (state.towerInventory[type] <= 0) continue;
    const t = TOWER_TYPES[type];
    const isHealer = typeof t.healPercent === "number";

    const card = document.createElement("div");
    card.className = "tower-card";

    card.innerHTML = `
      <div class="tower-card-inner">
        <div class="tower-info">
          <div class="tower-title">
            ${type.toUpperCase()}
            <span style="font-size:12px">${isHealer ? "💚 SUPPORT" : "⚔️ ATTACK"}</span>
          </div>
          <div class="tower-stats">
            🎒 จำนวนที่มี: ${state.towerInventory[type]}<br>
            ${isHealer ? `
              💚 ฮีล: ${(t.healPercent * 100).toFixed(1)}%<br>
              🎯 ฮีล: ${t.healCount} ป้อม<br>
              ⏱ ทุก ${t.cooldown}s<br>
            ` : `
              🔫 ดาเมจ: ${t.damage}<br>
              ⌛ คูลดาวน์: ${t.cooldown}s<br>
              📏 ระยะ: ${t.range}<br>
              🎯 เป้าหมาย: ${t.target}<br>
            `}
            ❤️ HP: ${t.hp}<br>
          </div>
        </div>
        <canvas class="tower-preview" width="90" height="90"></canvas>
      </div>
    `;

    card.onclick = () => {
      if (!state.pendingSlot) return;
      if (state.towerInventory[type] <= 0) return;
      placeTower(type, state.pendingSlot);
      state.pendingSlot = null;
      closeTowerPopup();
      updateUI();
    };

    list.appendChild(card);
    animateTowerPreview(card.querySelector(".tower-preview"), type);
  }
}

export function openTowerPopup() {
  renderTowerPopup();
  document.getElementById("towerPopup").style.display = "block";
}

export function closeTowerPopup() {
  document.getElementById("towerPopup").style.display = "none";
}

export function setTowerPriority(type) {
  if (!state.selectedTower) return;
  state.selectedTower.targetPriority = type;
  openTowerInspect(state.selectedTower);
}

export function setTargetMode(mode) {
  if (!state.selectedTower) return;
  state.selectedTower.targetMode = mode;
  openTowerInspect(state.selectedTower);
}

export function refreshTowerInspectLive() {
  const tower = state.selectedTower;
  if (!tower) return;

  const fill = document.getElementById("popupHpFill");
  const text = document.getElementById("popupHpText");
  if (!fill || !text) return;

  const ratio = tower.hp / tower.maxHp;
  fill.style.width = `${ratio * 100}%`;
  text.textContent = `${Math.ceil(tower.hp)} / ${Math.ceil(tower.maxHp)}`;

  const lvFill = document.getElementById("popupLvFill");
  const lvText = document.getElementById("popupLvText");
  if (lvFill && lvText) {
    const maxLevel = TOWER_TYPES[tower.type].maxLevel || MAX_TOWER_LEVEL;
    const lvRatio = tower.level / maxLevel;
    lvFill.style.width = `${lvRatio * 100}%`;
    lvText.textContent = `${tower.level} / ${maxLevel}`;
    lvFill.style.boxShadow = lvRatio >= 1 ? "0 0 8px gold" : "none";
  }
}

export function refreshTowerInspectAll() {
  const tower = state.selectedTower;
  if (!tower) return;

  const cfg = TOWER_TYPES[tower.type];
  const maxLevel = cfg.maxLevel || MAX_TOWER_LEVEL;
  const isMax = tower.level >= maxLevel;

  refreshTowerInspectLive();

  const dmg = document.getElementById("popupDamage");
  if (dmg) dmg.textContent = tower.damage.toFixed(1);
  const cd = document.getElementById("popupCooldown");
  if (cd) cd.textContent = `${tower.cooldownMax.toFixed(2)}s`;
  const range = document.getElementById("popupRange");
  if (range) range.textContent = Math.round(tower.range);

  const upgradeCost = document.getElementById("popupUpgradeCost");
  const resourceBox = document.getElementById("popupPlayerResource");
  const costData = isMax ? null : getUpgradeCost(tower);

  if (upgradeCost) {
    upgradeCost.innerHTML = isMax
      ? "⭐ เลเวลสูงสุดแล้ว"
      : `⬆ ค่าอัปเกรด: ${costData.type === "money" ? `💰 ${costData.cost}` : `💎 ${costData.cost}`}`;
  }

  if (!isMax && costData) {
    const canAfford = costData.type === "money" ? state.confirmedMoney >= costData.cost : state.confirmedDiamonds >= costData.cost;
    upgradeCost.style.color = canAfford ? "white" : "red";
    if (resourceBox) resourceBox.style.color = canAfford ? "white" : "red";
    const upBtn = document.getElementById("popupUpgradeBtn");
    if (upBtn) upBtn.disabled = !canAfford;
  }

  if (!isMax && costData && resourceBox) {
    resourceBox.innerHTML = costData.type === "money"
      ? `💰 เงินที่มี: ${state.confirmedMoney}`
      : `💎 เพชรที่มี: ${state.confirmedDiamonds}`;
  }
}

export function openTowerInspect(tower) {
  state.sellConfirmMode = false;
  state.selectedTower = tower;

  const cfg = TOWER_TYPES[tower.type];
  const maxLevel = cfg.maxLevel || MAX_TOWER_LEVEL;
  const isMax = tower.level >= maxLevel;
  const costData = isMax ? null : getUpgradeCost(tower);

  let priorityUI = "";
  if (tower.targetType === "both") {
    priorityUI = `
    <div class="inspect-section">
      <div class="section-title">🎯 ลำดับเป้าหมาย</div>
      <div class="btn-row">
        <button class="mode-btn ${tower.targetPriority === "ground" ? "active" : ""}" data-priority="ground">👣 ภาคพื้น</button>
        <button class="mode-btn ${tower.targetPriority === "air" ? "active" : ""}" data-priority="air">🪽 บิน</button>
      </div>
    </div>`;
  }

  let targetModeUI = "";
  if (!tower.isHealer) {
    targetModeUI = `
    <div class="inspect-section">
      <div class="section-title">🧠 วิธีเลือกเป้า</div>
      <div class="btn-grid">
        <button class="mode-btn ${tower.targetMode === "nearest" ? "active" : ""}" data-mode="nearest">📏 ใกล้สุด</button>
        <button class="mode-btn ${tower.targetMode === "hpPercentLow" ? "active" : ""}" data-mode="hpPercentLow">🩸 %HP ต่ำ</button>
        <button class="mode-btn ${tower.targetMode === "maxHpHigh" ? "active" : ""}" data-mode="maxHpHigh">💪 MaxHP สูง</button>
        <button class="mode-btn ${tower.targetMode === "maxHpLow" ? "active" : ""}" data-mode="maxHpLow">❤️ MaxHP ต่ำ</button>
      </div>
    </div>`;
  }

  const attackUI = !tower.isHealer ? `
    <div>🔫 ดาเมจ</div><div id="popupDamage">${tower.damage.toFixed(1)}</div>
    <div>⌛ คูลดาวน์</div><div id="popupCooldown">${tower.cooldownMax.toFixed(2)}s</div>
    <div>📏 ระยะ</div><div id="popupRange">${Math.round(tower.range)}</div>
    <div>🎯 เป้าหมาย</div><div id="popupTarget">${tower.targetType}</div>
  ` : "";

  const healUI = tower.isHealer ? `
    <div>💚 ฮีล</div><div>${(tower.healPercent * 100).toFixed(1)}%</div>
    <div>⏱ ทุก</div><div>${tower.cooldownMax.toFixed(2)} วิ</div>
    <div>🎯 เป้าหมาย</div><div>${tower.healCount} ป้อม</div>
  ` : "";

  document.getElementById("inspectTitle").textContent = `${tower.type.toUpperCase()} TOWER`;

  document.getElementById("inspectStats").innerHTML = `
    <div class="stat-grid">
      <div>⚜️ เลเวล</div>
      <div>
        <div class="popup-lv-bar">
          <div class="popup-lv-fill" id="popupLvFill"></div>
          <div class="popup-lv-text" id="popupLvText">${tower.level} / ${maxLevel}</div>
        </div>
      </div>
      <div>❤️ HP</div>
      <div>
        <div class="popup-hp-bar">
          <div class="popup-hp-fill" id="popupHpFill"></div>
          <div class="popup-hp-text" id="popupHpText">${Math.ceil(tower.hp)} / ${Math.ceil(tower.maxHp)}</div>
        </div>
      </div>
      ${attackUI}
      ${healUI}
    </div>
    ${!tower.isHealer ? priorityUI : ""}
    ${!tower.isHealer ? targetModeUI : ""}
    <div class="inspect-section">
      ${isMax
        ? `<div class="section-title">⭐ เลเวลสูงสุดแล้ว</div>`
        : `<div class="section-title" id="popupUpgradeCost">⬆ ค่าอัปเกรด: ${costData.type === "money" ? `💰 ${costData.cost}` : `💎 ${costData.cost}`}</div>`
      }
      ${!isMax ? `<div style="margin-top:6px;" id="popupPlayerResource">${costData.type === "money" ? `💰 เงินที่มี: ${state.confirmedMoney}` : `💎 เพชรที่มี: ${state.confirmedDiamonds}`}</div>` : ""}
      <button class="action-btn upgrade-btn" id="popupUpgradeBtn" ${isMax ? "disabled" : ""}>⬆ อัปเกรด</button>
      <button class="action-btn sell-btn" id="popupSellBtn">🎒 คืนเข้ากระเป๋า</button>
      <button class="action-btn skin-btn" id="popupSkinBtn">🎨 เปลี่ยนสกินป้อมนี้</button>
      <button class="action-btn close-btn" id="popupCloseBtn">ปิด</button>
    </div>
  `;

  document.getElementById("towerInspectPopup").style.display = "block";

  document.querySelectorAll("[data-priority]").forEach(b => b.onclick = () => setTowerPriority(b.dataset.priority));
  document.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => setTargetMode(b.dataset.mode));
  document.getElementById("popupUpgradeBtn").onclick = () => doUpgradeTower(refreshTowerInspectAll);
  document.getElementById("popupSellBtn").onclick = () => openSellConfirm(tower);
  document.getElementById("popupSkinBtn").onclick = openTowerSkinSelector;
  document.getElementById("popupCloseBtn").onclick = closeTowerInspect;
}

export function openSellConfirm(tower) {
  closeSellConfirm();

  const overlay = document.createElement("div");
  overlay.id = "sellConfirmPopup";
  overlay.className = "confirm-overlay";
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-icon">🎒</div>
      <div class="confirm-title">คืนป้อมเข้ากระเป๋า?</div>
      <div class="confirm-text">${tower.type.toUpperCase()} เลเวล ${tower.level} จะถูกถอดออกจากสนามและกลับเข้ากระเป๋า</div>
      <div class="confirm-actions">
        <button class="confirm-btn confirm-btn-cancel" id="sellConfirmCancel">ยกเลิก</button>
        <button class="confirm-btn confirm-btn-danger" id="sellConfirmOk">ยืนยันคืนป้อม</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById("sellConfirmCancel").onclick = closeSellConfirm;
  document.getElementById("sellConfirmOk").onclick = () => {
    closeSellConfirm();
    doSellTower(false, null, closeTowerInspect);
  };
  overlay.onclick = e => { if (e.target === overlay) closeSellConfirm(); };
}

export function closeSellConfirm() {
  document.getElementById("sellConfirmPopup")?.remove();
}

export function closeTowerInspect() {
  state.selectedTower = null;
  document.getElementById("towerInspectPopup").style.display = "none";
  closeSellConfirm();
}

export function openTowerSkinSelector() {
  if (!state.selectedTower) return;
  const towerType = state.selectedTower.type;

  const overlay = document.createElement("div");
  overlay.className = "tower-skin-overlay";
  overlay.id = "towerSkinSelector";

  const skinList = SKIN_DATABASE[towerType] || [];
  const unlocked = playerData.skins.unlocked?.[towerType] || [];
  const equipped = playerData.skins.equipped?.[towerType] || "default";

  let html = `<div class="tower-skin-panel"><h2 class="tower-skin-title">🎨 สกิน ${towerType.toUpperCase()}</h2><div class="tower-skin-list">`;
  skinList.forEach(skin => {
    const isUnlocked = unlocked.includes(skin.id);
    const isEquipped = equipped === skin.id;
    html += `
      <div class="tower-skin-row">
        <span class="tower-skin-name">${skin.name}</span>
        <button class="tower-skin-btn" data-skin="${skin.id}" ${!isUnlocked ? "disabled" : ""}>
          ${!isUnlocked ? "🔒 ล็อค" : isEquipped ? "✔ ใช้อยู่" : "ใช้"}
        </button>
      </div>`;
  });
  html += `</div><div class="tower-skin-footer"><button class="tower-skin-close">ปิด</button></div></div>`;

  overlay.innerHTML = html;
  document.body.appendChild(overlay);

  overlay.querySelectorAll("[data-skin]").forEach(btn => {
    btn.onclick = () => equipTowerSkin(towerType, btn.dataset.skin);
  });
  overlay.querySelector(".tower-skin-close").onclick = closeTowerSkinSelector;
}

export function closeTowerSkinSelector() {
  document.getElementById("towerSkinSelector")?.remove();
}

export async function equipTowerSkin(type, name) {
  if (!playerData.skins.unlocked[type]?.includes(name)) return;

  const prevEquipped = playerData.skins.equipped[type];
  playerData.skins.equipped[type] = name; // optimistic update ให้ UI ตอบสนองไว
  savePlayerData();
  if (state.selectedTower) openTowerInspect(state.selectedTower);
  closeTowerSkinSelector();

  try {
    // เดิมโค้ดนี้เซฟแค่ลง localStorage ฝั่งเครื่อง ไม่เคยยิงไปเก็บที่ server เลย
    // ทำให้ /api/state ตอน login ใหม่ทับค่ากลับเป็นสกินเดิม (บั๊กสกินรีเซ็ตทุกครั้งที่เข้าเกมใหม่)
    const res = await api.equipTowerSkin(type, name);
    applyFullGameData(res.state);
    saveGame();
  } catch (err) {
    playerData.skins.equipped[type] = prevEquipped; // ยิงไม่สำเร็จ ย้อนกลับค่าเดิม
    savePlayerData();
    if (state.selectedTower) openTowerInspect(state.selectedTower);
    console.error("[equipTowerSkin] บันทึกสกินป้อมไม่สำเร็จ:", err);
  }
}
