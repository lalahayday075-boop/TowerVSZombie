// scr/entities/ZombieProjectiles.js
import { state } from "../core/state.js";
import { devState } from "../systems/devState.js";
import { spawnDamage } from "../systems/damageSystem.js";

export class ZombieBullet {
  constructor(x, y, target, damage, angle) {
    this.x = x; this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = 220;
    // เดิมมีการคำนวณ targetVx/targetVy (ไล่เป้าหมายที่ขยับ) แต่ไม่เคยถูกใช้จริง — เอาโค้ดตายทิ้ง
    // (ดู AUDIT.md ข้อ 8) กระสุนยิงตรงไปตามมุมตอนยิงเหมือนของเดิมจริง ๆ
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.hit = false;
  }

  update(dt) {
    if (!this.target || this.target.dead) { this.hit = true; return; }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (dist < 10) {
      let finalDamage = this.damage;
      let isCrit = false;
      if (Math.random() < 0.05) { finalDamage *= 1.6; isCrit = true; }

      // บั๊กเดิม: โหมด "ป้อมอมตะ" ไม่เช็คตรงนี้ (AUDIT.md ข้อ 5) ทำให้ป้อมโดนกระสุนไกลตายได้
      if (!devState.DEV_TOWER_IMMORTAL) this.target.hp -= finalDamage;

      spawnDamage(this.target.x, this.target.y, Math.floor(finalDamage), isCrit ? "zombieCrit" : "tower");
      this.hit = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#ff6666";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class ZombieLightning {
  constructor(x, y, target, damage) {
    this.x = x; this.y = y;
    this.damage = damage;
    this.life = 0.12;
    this.hit = false;
    this.chainRange = 120;
    this.maxChains = 2;
    this.chainTargets = [];
    this.calculateChains(target);
  }

  calculateChains(startTarget) {
    let current = startTarget;
    let chainsLeft = this.maxChains;

    while (current && chainsLeft >= 0) {
      if (current.dead || current.hp <= 0) break;
      this.chainTargets.push(current);

      let finalDamage = this.damage * (chainsLeft === this.maxChains ? 1 : 0.5);
      let isCrit = false;
      if (Math.random() < 0.07) { finalDamage *= 1.7; isCrit = true; }

      // บั๊กเดิม: เหมือนกับ ZombieBullet ไม่เคยเช็คโหมดป้อมอมตะ (AUDIT.md ข้อ 5)
      if (!devState.DEV_TOWER_IMMORTAL) current.hp -= finalDamage;

      spawnDamage(current.x, current.y, Math.floor(finalDamage), isCrit ? "zombieCrit" : "tower");

      let next = null;
      let minDist = Infinity;
      for (const t of state.towers) {
        if (t.dead || t.hp <= 0) continue;
        if (this.chainTargets.includes(t)) continue;
        const dist = Math.hypot(t.x - current.x, t.y - current.y);
        if (dist < this.chainRange && dist < minDist) { minDist = dist; next = t; }
      }

      current = next;
      chainsLeft--;
    }
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.hit = true;
  }

  draw(ctx) {
    if (this.chainTargets.length === 0) return;
    ctx.strokeStyle = "#ff88ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ff88ff";
    ctx.shadowBlur = 12;
    let prev = { x: this.x, y: this.y };
    for (const t of this.chainTargets) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
      prev = t;
    }
    ctx.shadowBlur = 0;
  }
}
