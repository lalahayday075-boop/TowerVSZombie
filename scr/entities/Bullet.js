// scr/entities/Bullet.js
import { state } from "../core/state.js";
import { spawnDamage } from "../systems/damageSystem.js";
import { spawnBlood } from "../systems/bloodSystem.js";
import { applyElectricEffect } from "./Zombie.js";

export class Bullet {
  constructor(x, y, target, damage, color, radius = 2.5, critChance = 0, critDamage = 2) {
    this.x = x; this.y = y;
    this.target = target;
    this.baseDamage = damage;
    this.damage = damage;
    this.speed = 7;
    this.hit = false;
    this.color = color || "yellow";
    this.radius = radius;
    this.critChance = critChance;
    this.critDamage = critDamage;
  }

  update() {
    if (!state.zombies.includes(this.target)) { this.hit = true; return; }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) { this.hit = true; return; }

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;

    if (dist < 10) {
      let finalDamage = this.damage;
      let isCrit = false;
      if (Math.random() < this.critChance) { finalDamage *= this.critDamage; isCrit = true; }

      this.target.hp -= finalDamage;
      if (this.target.hp <= 0 && state.focusedZombie === this.target) state.focusedZombie = null;
      if (this.target.hp < 0) this.target.hp = 0;

      if (this.target.hp > 0) {
        spawnDamage(this.target.x, this.target.y, Math.floor(finalDamage), isCrit ? "crit" : "zombie");
      }

      spawnBlood(this.target.x, this.target.y);
      this.hit = true;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class LightningBullet {
  constructor(x, y, target, damage, cfg, color) {
    this.x = x; this.y = y;
    this.target = target;
    this.damage = damage;
    this.color = color || "#88f";
    this.life = 0.15;
    this.chainLeft = cfg.chainCount;
    this.chainRange = cfg.chainRange;
    this.chainDecay = cfg.chainDecay;
    this.chainType = target.type;
    this.hitTargets = [];
    this.hit = false;
    this.strikes = [];
    this.applyChain(target);
  }

  applyChain(target) {
    if (!target || this.chainLeft < 0) return;

    target.hp -= this.damage;
    if (target.hp <= 0 && state.focusedZombie === target) state.focusedZombie = null;
    if (target.hp < 0) target.hp = 0;

    if (target.hp > 0) {
      spawnDamage(target.x, target.y, this.damage, "zombie");
    }
    applyElectricEffect(target, this.color);
    if (target.hp < 0) target.hp = 0;

    this.hitTargets.push(target);
    this.strikes.push({ x1: this.x, y1: this.y, x2: target.x, y2: target.y });

    this.chainLeft--;
    this.damage *= this.chainDecay;

    let next = null;
    let minDist = Infinity;
    for (const z of state.zombies) {
      if (this.hitTargets.includes(z)) continue;
      if (z.hp <= 0) continue;
      if (z.type !== this.chainType) continue;
      const d = Math.hypot(z.x - target.x, z.y - target.y);
      if (d <= this.chainRange && d < minDist) { minDist = d; next = z; }
    }

    if (next) {
      this.x = target.x; this.y = target.y;
      this.applyChain(next);
    }
  }

  update(dt) {
    this.life -= dt;
    if (this.life <= 0) this.hit = true;
  }

  draw(ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    for (const s of this.strikes) {
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      const steps = 6;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const x = s.x1 + (s.x2 - s.x1) * t + (Math.random() - 0.5) * 10;
        const y = s.y1 + (s.y2 - s.y1) * t + (Math.random() - 0.5) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(s.x2, s.y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
}
