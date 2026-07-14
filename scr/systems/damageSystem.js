// src/systems/damageSystem.js
import { state } from "../core/state.js";
import { playerData, savePlayerData } from "./playerData.js";

export const damagePopups = [];

export class DamagePopup {
  constructor(x, y, value, color = "#fff", type = "normal") {
    this.x = x + (Math.random() * 6 - 3);
    this.y = y;
    this.value = typeof value === "number" ? Math.round(value) : value;
    this.life = 0.6;
    this.vy = -28;
    this.color = color;
    this.alpha = 1;
    this.type = type;
    this.scale = type === "crit" ? 1.4 : 1;
  }

  update(dt) {
    this.life -= dt;
    this.y += this.vy * dt;
    this.alpha = Math.max(0, this.life / 0.6);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    const size = this.type === "crit" ? 18 : 14;
    ctx.font = `bold ${size}px sans-serif`;
    ctx.textAlign = "center";
    if (this.type === "crit") {
      ctx.shadowColor = "#ff9f00";
      ctx.shadowBlur = 12;
    }
    ctx.fillStyle = this.color;
    ctx.strokeStyle = "rgba(0,0,0,0.6)";
    ctx.lineWidth = 3;
    ctx.strokeText(this.value, this.x, this.y);
    ctx.fillText(this.value, this.x, this.y);
    ctx.restore();
  }
}

// บั๊กเดิม (AUDIT.md ข้อ 1): source === "exp" ตกไปอยู่ในกิ่ง ternary ที่ไม่ได้ push popup จริง
// ทำให้ตัวเลข EXP ไม่เคยโชว์ตอนฆ่าซอมบี้ — แก้ด้วย lookup table ธรรมดา ชัดเจน ไม่มีทางพลาดแบบนี้อีก
const DAMAGE_COLORS = {
  tower: "#ff5555",
  zombie: "#ffd700",
  zombieCrit: "#ff2222",
  crit: "#ff00ff",
  heal: "#00ff88",
  exp: "#00ccff",
};

export function spawnDamage(x, y, dmg, source) {
  const color = DAMAGE_COLORS[source] || "#fff";
  damagePopups.push(new DamagePopup(x, y - 6, dmg, color, source));
}

export function updateDamagePopups(dt) {
  for (let i = damagePopups.length - 1; i >= 0; i--) {
    const p = damagePopups[i];
    p.update(dt);
    if (p.life <= 0) damagePopups.splice(i, 1);
  }
}

export function drawDamagePopups(ctx) {
  for (const p of damagePopups) p.draw(ctx);
}

export function addExp(amount, onLevelUp) {
  playerData.exp += amount;
  while (true) {
    const need = playerData.level * 100;
    if (playerData.exp >= need) {
      playerData.exp -= need;
      playerData.level++;
    } else {
      break;
    }
  }
  savePlayerData();
  if (onLevelUp) onLevelUp();
}
