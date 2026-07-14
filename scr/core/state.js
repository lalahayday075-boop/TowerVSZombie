// scr/core/state.js
// รวม state ทั้งหมดของเกมไว้ที่เดียว แทนตัวแปร global ที่กระจายอยู่ใน <script> ของ index.html เดิม
// เดิม: money, diamonds, wave, towers, zombies ฯลฯ ประกาศลอยๆ ทุกไฟล์แก้ตรงได้หมด
// ใหม่: import { state } from "./state.js" แล้วแก้ผ่าน object เดียว ลด bug จากชนกันของชื่อตัวแปร

export const WAVE_TIME_LIMIT = 60;

// หมายเหตุ: ของเดิม money/diamonds เริ่มต้นที่ 9999999999999999999 (เกิน Number.MAX_SAFE_INTEGER
// ของ JS ทำให้เลขคลาดเคลื่อนได้ทันที) ซึ่งดูเหมือนค่าทดสอบที่ลืมเอาออก — ดู AUDIT.md ข้อ 2
// ปรับกลับเป็นค่าเริ่มต้นปกติตามที่ UI เดิมตั้งใจไว้ (100 เงิน / 0 เพชร)
// ถ้าต้องการค่าเดิมไว้ทดสอบ เปลี่ยนสองบรรทัดนี้ได้เลย หรือใช้ dev tool "เพิ่มเงิน/เพชร" แทน
export const state = {
  isGameOver: false,
  lastTime: 0,
  focusedZombie: null,

  money: 100,
  diamonds: 0,

  towerInventory: {},
  totalPlayTime: 0,
  totalZombiesKilled: 0,

  wave: 1,
  waveSpawning: false,
  spawnTimer: null,
  zombiesTotalThisWave: 0,
  zombiesKilledThisWave: 0,
  waveTimeLeft: WAVE_TIME_LIMIT,

  selectingTower: false,
  selectedTowerType: "normal",
  selectedTower: null,
  pendingSlot: null,
  sellConfirmMode: false,

  towers: [],
  zombies: [],
  bullets: [],
  zombieProjectiles: [],

  buildSlots: [],
};

// ===== MAP / AREA CONFIG (ค่าคงที่ ขึ้นกับขนาด canvas) =====
export function makeMapConfig(canvas) {
  return {
    WANDER_MIN_X: 40,
    WANDER_MAX_X: canvas.width - 40,
    WANDER_MIN_Y: 320,
    WANDER_MAX_Y: canvas.height - 40,
  };
}

export function buildSlotLayout() {
  const slots = [];
  const startX = 60;
  const gapX = 70;
  const rowY = [640, 720];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      slots.push({ x: startX + c * gapX, y: rowY[r], occupied: false, towerRef: null });
    }
  }
  return slots;
}
