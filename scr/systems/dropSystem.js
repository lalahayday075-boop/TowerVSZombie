// src/systems/dropSystem.js
// v2 หมายเหตุ: เดิมเฉลี่ยได้แค่ ~0.26 เพชร/ตัว (ปกติ) และ ~0.45 เพชร/ตัว (บอส) ไม่ขยับตามเวฟเลย
// ทำให้กว่าจะสุ่มพูลเพชร (40/ครั้ง) ได้ 1 ครั้งต้องรอถึงเวฟ ~30 และกว่าจะพอมี diamond_cannon/healer
// ใช้งานจริงก็ปาไปเวฟ 70+ ป้อมเพชรเลยรู้สึกเหมือนไม่มีอยู่จริงในเกมช่วงต้น-กลาง
// เพิ่มอัตราขึ้นราวๆ 2 เท่า (เฉลี่ย ~0.50/ตัวปกติ, ~0.84/ตัวบอส) ให้ป้อมเพชรระดับกลาง (diamond_cannon/healer)
// เริ่มพอเป็นตัวเลือกได้จริงตั้งแต่ช่วงกลางเกม โดยยังคงเป็นเงินสายช้ากว่าเงินทองชัดเจน (ไม่ได้ทำให้ pomegranate_storm
// ตัวหายากสุดง่ายขึ้นเยอะ เพราะคอขวดของตัวนั้นคือ rarity 3/73 ในพูล ไม่ใช่จำนวนเพชรที่มี)
export function rollDiamondDrop(isBoss) {
  const r = Math.random() * 100;
  if (!isBoss) {
    if (r < 70) return 0;
    if (r < 86) return 1;
    if (r < 95) return 2;
    if (r < 99.5) return 3;
    if (r < 99.99) return 5;
    return 10;
  } else {
    if (r < 55) return 0;
    if (r < 78) return 1;
    if (r < 90) return 2;
    if (r < 97) return 3;
    if (r < 99.9) return 5;
    return 10;
  }
}

export const diamondPopups = [];
export const moneyPopups = [];

class ResourcePopup {
  constructor(x, y, amount, vy, life, color, prefix) {
    this.x = x; this.y = y; this.amount = amount;
    this.vy = vy; this.life = life; this.maxLife = life;
    this.alpha = 1; this.color = color; this.prefix = prefix;
  }
  update(dt) {
    this.life -= dt;
    this.y += this.vy * dt;
    this.alpha = Math.max(this.life / this.maxLife, 0);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = this.color;
    ctx.fillText(`${this.prefix} +${this.amount}`, this.x, this.y);
    ctx.restore();
  }
}

export class DiamondPopup extends ResourcePopup {
  constructor(x, y, amount) { super(x, y, amount, -40, 0.8, "#00e5ff", "💎"); }
}
export class MoneyPopup extends ResourcePopup {
  constructor(x, y, amount) { super(x, y, amount, -35, 0.7, "#ffd54f", "💰"); }
}

export function updateDiamondPopups(dt, ctx) {
  for (let i = diamondPopups.length - 1; i >= 0; i--) {
    const d = diamondPopups[i];
    d.update(dt);
    d.draw(ctx);
    if (d.life <= 0) diamondPopups.splice(i, 1);
  }
}

export function updateMoneyPopups(dt, ctx) {
  for (let i = moneyPopups.length - 1; i >= 0; i--) {
    const m = moneyPopups[i];
    m.update(dt);
    m.draw(ctx);
    if (m.life <= 0) moneyPopups.splice(i, 1);
  }
}
