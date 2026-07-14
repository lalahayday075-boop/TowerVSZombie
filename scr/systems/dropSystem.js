// scr/systems/dropSystem.js
export function rollDiamondDrop(isBoss) {
  const r = Math.random() * 100;
  if (!isBoss) {
    if (r < 83) return 0;
    if (r < 93) return 1;
    if (r < 98) return 2;
    if (r < 99.99) return 3;
    return 5;
  } else {
    if (r < 70) return 0;
    if (r < 91) return 1;
    if (r < 96) return 2;
    if (r < 99) return 3;
    if (r < 99.999) return 5;
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
