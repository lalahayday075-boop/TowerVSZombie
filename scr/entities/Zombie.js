// src/entities/Zombie.js
import { state, makeMapConfig } from "../core/state.js";
import { devState } from "../systems/devState.js";
import { spawnDamage } from "../systems/damageSystem.js";
import { renderZombie } from "../render/zombieSkins/index.js";
import { destroyTower } from "./Tower.js";
import { ZombieBullet, ZombieLightning } from "./ZombieProjectiles.js";

let mapConfig = null;
export function setZombieMapConfig(canvas) {
  mapConfig = makeMapConfig(canvas);
}

export class Zombie {
  constructor(type, hp, speed, damage, reward, isBoss = false, attackMode = "melee", armor = 0) {
    this.type = type;
    this.moveType = type;
    this.isBoss = isBoss;
    this.dead = false;
    this.armor = armor; // ลดดาเมจที่ได้รับจากป้อมแบบ flat ต่อนัด (ดู Bullet.js) — กลไกใหม่สำหรับ hardcore

    this.x = 180 + (Math.random() * 100 - 50);
    this.y = -20;
    this.vx = 0;
    this.vy = 0;

    this.baseSpeed = speed; // ห้ามเปลี่ยนตรงนี้
    this.speedMult = 1;
    this.speed = speed;

    this.retargetDelay = 0;
    this.recoverSpeed = false;

    this.hp = hp;
    this.maxHp = hp;
    this.attackDamage = damage;
    this.reward = reward;
    this.bossPhase = 1;

    this.attackMode = attackMode;
    this.attackRange = attackMode === "melee" ? 40 : attackMode === "ranged" ? 160 : 280;
    this.stopRange = this.attackRange;
    this.attackCooldown = attackMode === "lightning" ? 2.1 : attackMode === "ranged" ? 1.5 : 0.5;
    this.attackTimer = 0;

    this.critChance = isBoss ? 0.10 : 0.05;
    this.critDamage = 1.8;

    this.targetTower = null;

    this.inWanderZone = false;
    this.wanderAngle = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;

    this.electricTime = 0;
    this.electricColor = "#88f";

    this.animTime = Math.random() * Math.PI * 2;
    this.aimAngle = 0;
  }

  findTarget() {
    const towers = state.towers;
    if (towers.length === 0) return null;
    let closest = null;
    let minDist = Infinity;
    for (const t of towers) {
      if (t.dead || t.hp <= 0) continue;
      const dist = Math.hypot(t.x - this.x, t.y - this.y);
      if (dist < minDist) { minDist = dist; closest = t; }
    }
    return closest;
  }

  updateSpeed() {
    const oldSpeed = Math.max(0.0001, this.speed);
    this.speed = this.baseSpeed * this.speedMult;
    const scale = this.speed / oldSpeed;
    this.vx *= scale;
    this.vy *= scale;
  }

  update(dt) {
    if (this.electricTime > 0) this.electricTime -= dt;

    const moveSpeed = Math.hypot(this.vx, this.vy);
    const speedRatio = moveSpeed / this.baseSpeed;
    this.animTime += moveSpeed > 5 ? dt * 8 * speedRatio : dt * 2.5;

    if (this.retargetDelay > 0) {
      this.retargetDelay -= dt;
      this.vx *= 0.85; this.vy *= 0.85;
      this.x += this.vx * dt; this.y += this.vy * dt;
      return;
    }

    if (this.recoverSpeed) {
      this.speedMult += dt * 1.2;
      if (this.speedMult >= 1) { this.speedMult = 1; this.recoverSpeed = false; }
      this.updateSpeed();
    }

    if (!this.targetTower || this.targetTower.dead || this.targetTower.hp <= 0) {
      this.targetTower = this.findTarget();
      if (this.targetTower) {
        this.inWanderZone = false;
        this.vx = 0; this.vy = 0;
      }
    }

    if (!this.targetTower) {
      const { WANDER_MIN_X, WANDER_MAX_X, WANDER_MIN_Y, WANDER_MAX_Y } = mapConfig;

      if (!this.inWanderZone) {
        const targetY = (WANDER_MIN_Y + WANDER_MAX_Y) / 2;
        this.vx = 0; this.vy = 0;
        if (this.y < targetY) {
          this.y += this.baseSpeed * 0.4 * dt;
          return;
        }
        this.inWanderZone = true;
        this.wanderTimer = 0;
        this.recoverSpeed = true;
      }

      this.wanderTimer -= dt;
      if (this.wanderTimer <= 0) {
        this.wanderTimer = 1.5 + Math.random() * 1.5;
        this.wanderAngle = Math.random() * Math.PI * 2;
      }

      const idleSpeed = this.baseSpeed * 0.25;
      this.vx = 0; this.vy = 0;
      this.x += Math.cos(this.wanderAngle) * idleSpeed * dt;
      this.y += Math.sin(this.wanderAngle) * idleSpeed * dt;

      if (this.x < WANDER_MIN_X || this.x > WANDER_MAX_X) this.wanderAngle = Math.PI - this.wanderAngle;
      if (this.y < WANDER_MIN_Y || this.y > WANDER_MAX_Y) this.wanderAngle = -this.wanderAngle;
      return;
    }

    const dx = this.targetTower.x - this.x;
    const dy = this.targetTower.y - this.y;
    const dist = Math.hypot(dx, dy);
    this.aimAngle = Math.atan2(dy, dx);
    this.attackTimer -= dt;

    const approachBuffer = 6;
    if (dist > this.stopRange + approachBuffer) {
      const targetVx = (dx / dist) * this.speed;
      const targetVy = (dy / dist) * this.speed;
      this.vx += (targetVx - this.vx) * 0.15;
      this.vy += (targetVy - this.vy) * 0.15;
      const v = Math.hypot(this.vx, this.vy);
      if (v > this.speed) {
        const k = this.speed / v;
        this.vx *= k; this.vy *= k;
      }
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      return;
    }

    this.vx *= 0.8; this.vy *= 0.8;
    this.x += this.vx * dt; this.y += this.vy * dt;

    if (this.attackTimer > 0) return;

    switch (this.attackMode) {
      case "melee": {
        let finalDamage = this.attackDamage;
        let isCrit = false;
        if (Math.random() < this.critChance) { finalDamage *= this.critDamage; isCrit = true; }
        if (!devState.DEV_TOWER_IMMORTAL) this.targetTower.hp -= finalDamage;
        spawnDamage(this.targetTower.x, this.targetTower.y, Math.floor(finalDamage), isCrit ? "zombieCrit" : "tower");
        break;
      }
      case "ranged": {
        const half = this.isBoss ? 22 : 13;
        const gunBaseY = -half * 0.05;
        const muzzleLength = 34;
        const sway = Math.sin(this.animTime * 1.2) * 0.08;
        const shootAngle = this.aimAngle;
        const muzzleX = this.x + Math.cos(shootAngle) * muzzleLength - Math.sin(sway) * gunBaseY;
        const muzzleY = this.y + Math.sin(shootAngle) * muzzleLength + Math.cos(sway) * gunBaseY;
        state.zombieProjectiles.push(new ZombieBullet(muzzleX, muzzleY, this.targetTower, this.attackDamage, shootAngle));
        break;
      }
      case "lightning": {
        state.zombieProjectiles.push(new ZombieLightning(this.x, this.y, this.targetTower, this.attackDamage));
        break;
      }
    }

    this.attackTimer = this.attackCooldown;

    if (!devState.DEV_TOWER_IMMORTAL && this.targetTower.hp <= 0) {
      destroyTower(this.targetTower);
      this.targetTower = null;
      this.retargetDelay = 0.25;
    }
  }

  draw(ctx) {
    if (this.hp <= 0) return;
    renderZombie(ctx, this);

    if (this.electricTime > 0) {
      ctx.save();
      ctx.strokeStyle = this.electricColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.electricColor;
      ctx.shadowBlur = 12;
      const radius = (this.isBoss ? 22 : 14) + Math.sin(Date.now() * 0.03) * 3;
      ctx.beginPath();
      const points = 10;
      for (let i = 0; i <= points; i++) {
        const a = (i / points) * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * 6;
        const x = this.x + Math.cos(a) * r;
        const y = this.y + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (state.focusedZombie === this && this.hp > 0) {
      const size = this.isBoss ? 26 : 18;
      const yOffset = this.isBoss ? 50 : 34;
      ctx.save();
      const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.15;
      ctx.translate(this.x, this.y - yOffset);
      ctx.scale(pulse, pulse);
      ctx.strokeStyle = "#ff4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-size * 0.4, 0); ctx.lineTo(size * 0.4, 0);
      ctx.moveTo(0, -size * 0.4); ctx.lineTo(0, size * 0.4);
      ctx.stroke();
      ctx.restore();
    }
  }
}

export function applyElectricEffect(zombie, color) {
  zombie.electricTime = 0.25;
  zombie.electricColor = color || "#88f";
}
