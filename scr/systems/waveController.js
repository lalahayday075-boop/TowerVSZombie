// src/systems/waveController.js
import { state, WAVE_TIME_LIMIT } from "../core/state.js";
import { api } from "./api.js";
import { applyFullGameData, saveGame } from "./saveSystem.js";
import { shuffleArray } from "./waveGenerator.js";
import { calcRewardByWave } from "./waveScaling.js";
import { MoneyPopup, DiamondPopup, moneyPopups, diamondPopups } from "./dropSystem.js";
import { Zombie } from "../entities/Zombie.js";
import { updateZombieUI, updateUI } from "../ui/hud.js";
import { canvasRef } from "../core/canvasRef.js";

// ตัวเลขเงิน/เพชรที่โชว์ระหว่างเล่น "ไม่ใช่ของจริง" — เป็นแค่ preview ให้ผู้เล่นรู้สึกลื่นไหลระหว่างต่อสู้
// (คำนวณด้วยสูตรเดียวกับ server เพื่อให้ตัวเลขระหว่างเล่นใกล้เคียงของจริงที่สุด)
// พอจบเวฟจริง ค่าที่ server ส่งกลับมาจาก /wave/complete จะ "เขียนทับ" ให้ตรงเป๊ะเสมอ (reconcile)
// ป้องกันไม่ให้ใครแก้ค่าฝั่ง client แล้วได้เงินจริงเกินสิทธิ์

export async function failWave(onDone) {
  if (state.isGameOver) return;
  state.isGameOver = true;

  try {
    const result = await api.failWave();
    applyFullGameData(result.state);
    saveGame();
  } catch (err) {
    console.error("[wave] fail sync ล้มเหลว:", err.message);
  }

  setTimeout(() => {
    resetWave();
    if (onDone) onDone();
  }, 500);
}

export function resetWave() {
  state.bullets.length = 0;
  state.zombies.length = 0;
  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  updateZombieUI();

  for (const t of state.towers) {
    t.dead = false;
    t.destroying = false;
    t.destroyAnim = 0;
    t.shake = 0;
    t.respawnProgress = 1;
    t.spawnAnim = 1;
    t.hp = t.maxHp;
    t.cooldown = 0;
    t.angle = t.spawnAngle;
  }

  for (const slot of state.buildSlots) {
    if (slot.respawnTimer) {
      clearTimeout(slot.respawnTimer);
      slot.respawnTimer = null;
    }
    slot.respawning = false;
  }

  state.waveTimeLeft = WAVE_TIME_LIMIT;
  state.isGameOver = false;
  state.lastTime = performance.now();

  updateUI();
  spawnWave();
}

export async function spawnWave() {
  if (state.spawnTimer) {
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
  }

  state.waveSpawning = true;

  let data;
  try {
    data = await api.startWave(); // { wave, enemies } — server เป็นคนกำหนดจำนวน/HP/speed/damage ทั้งหมด
  } catch (err) {
    console.error("[wave] เริ่มเวฟไม่สำเร็จ:", err.message);
    state.waveSpawning = false;
    // ลองใหม่อีกครั้งใน 2 วิ กันเน็ตสะดุดแล้วเกมค้าง
    setTimeout(spawnWave, 2000);
    return;
  }

  const enemies = data.enemies;
  const baseDelay = Math.max(0.9, 1.6 - Math.sqrt(data.wave) * 0.08);

  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  for (const e of enemies) state.zombiesTotalThisWave += e.count;
  updateZombieUI();

  const queue = [];
  enemies.forEach(e => {
    for (let i = 0; i < e.count; i++) queue.push({ ...e });
  });
  shuffleArray(queue);

  let index = 0;
  function spawnNext() {
    if (state.isGameOver || index >= queue.length) {
      state.spawnTimer = null;
      state.waveSpawning = false;
      return;
    }
    const e = queue[index++];
    // reward เป็นแค่ preview ฝั่ง client (ดูหมายเหตุด้านบนของไฟล์)
    const reward = calcRewardByWave(e.rewardWave ?? data.wave, e.rewardIsBoss ?? false);

    state.zombies.push(new Zombie(e.type, e.hp, e.speed, e.damage, reward, e.isBoss || false, e.attackMode || "melee", e.armor || 0));

    const delay = baseDelay * (0.4 + Math.random() * 0.8) * 900;
    state.spawnTimer = setTimeout(spawnNext, delay);
  }

  spawnNext();
}

// จบเวฟจริง (ซอมบี้หมดสนาม) — เรียก server ให้คำนวณ+ยืนยันรางวัลจริง แล้วเขียนทับ state ฝั่ง client
export async function completeWaveOnServer() {
  try {
    const result = await api.completeWave();
    applyFullGameData(result.state);
    saveGame();
    updateUI();
  } catch (err) {
    console.error("[wave] ยืนยันจบเวฟไม่สำเร็จ:", err.message);
  }
}

// ปุ่ม dev "ชนะเวฟทันที": ให้ server ยืนยันจบเวฟเดียวกับที่กำลังเล่นอยู่ทันที (ไม่ผ่านการต่อสู้จริง)
// ยังคงต้องผ่าน server เหมือนเดิม ไม่ใช่การเสกเงินจากฝั่ง client
export async function clearWaveInstantFull() {
  if (state.isGameOver) return;

  if (state.spawnTimer) {
    clearTimeout(state.spawnTimer);
    state.spawnTimer = null;
  }
  state.waveSpawning = false;

  const beforeMoney = state.money;
  const beforeDiamonds = state.diamonds;

  const result = await api.completeWave();
  applyFullGameData(result.state);
  saveGame();

  const { canvas } = canvasRef;
  const gainedMoney = state.money - beforeMoney;
  const gainedDiamonds = state.diamonds - beforeDiamonds;
  if (gainedMoney > 0) moneyPopups.push(new MoneyPopup(canvas.width / 2, canvas.height / 2, gainedMoney));
  if (gainedDiamonds > 0) diamondPopups.push(new DiamondPopup(canvas.width / 2, canvas.height / 2 - 20, gainedDiamonds));

  state.zombies.length = 0;
  state.zombiesTotalThisWave = 0;
  state.zombiesKilledThisWave = 0;
  updateZombieUI();
  state.waveTimeLeft = WAVE_TIME_LIMIT;

  updateUI();
  spawnWave();
}
