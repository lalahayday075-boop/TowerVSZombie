// src/entities/Tower.js
import { state } from "../core/state.js";
import { TOWER_TYPES, TOWER_MUZZLE, MAX_TOWER_LEVEL } from "../data/towerTypes.js";
import { TOWER_DRAW_REGISTRY } from "../render/towerSkins/index.js";
import { Bullet, LightningBullet } from "./Bullet.js";
import { spawnDamage } from "../systems/damageSystem.js";

export function getTowerTarget(tower) {
  let candidates = state.zombies.filter(z => {
    if (z.hp <= 0) return false;
    const dist = Math.hypot(z.x - tower.x, z.y - tower.y);
    if (dist > tower.aimRange) return false;
    if (tower.targetType === "ground") return z.moveType === "ground";
    if (tower.targetType === "air") return z.moveType === "air";
    return true;
  });

  if (candidates.length === 0) return null;

  if (state.focusedZombie && state.focusedZombie.hp > 0 && candidates.includes(state.focusedZombie)) {
    return state.focusedZombie;
  }

  const hasNonBoss = candidates.some(z => z.isBoss !== true);
  if (hasNonBoss) candidates = candidates.filter(z => z.isBoss !== true);

  if (tower.targetType === "both") {
    if (tower.targetPriority === "air") {
      candidates.sort((a, b) => (a.moveType === b.moveType ? 0 : a.moveType === "air" ? -1 : 1));
    }
    if (tower.targetPriority === "ground") {
      candidates.sort((a, b) => (a.moveType === b.moveType ? 0 : a.moveType === "ground" ? -1 : 1));
    }
  }

  switch (tower.targetMode) {
    case "nearest":
      candidates.sort((a, b) => Math.hypot(a.x - tower.x, a.y - tower.y) - Math.hypot(b.x - tower.x, b.y - tower.y));
      break;
    case "maxHpLow":
      candidates.sort((a, b) => a.maxHp - b.maxHp);
      break;
    case "maxHpHigh":
      candidates.sort((a, b) => b.maxHp - a.maxHp);
      break;
    case "hpPercentLow":
      candidates.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      break;
  }

  return candidates[0];
}

export class Tower {
  constructor(x, y, type = "normal") {
    const cfg = TOWER_TYPES[type];

    this.x = x; this.y = y;
    this.type = type;
    this.level = 1;
    this.color = cfg.color;

    this.targetType = cfg.target;
    this.targetPriority = "air";
    this.targetMode = "hpPercentLow";
    this.currentTarget = null;

    this.range = cfg.range;
    this.aimRange = cfg.range * 1.25;

    this.turnSpeed = 8;
    this.angle = 0;
    this.targetAngle = 0;

    this.damage = cfg.damage;
    this.cooldownMax = cfg.cooldown;
    this.cooldown = 0;

    this.critChance = cfg.critChance || 0.05;
    this.critDamage = cfg.critDamage || 2.0;
    this.executeBonus = cfg.executeBonus || 0; // ป้อม executioner: โบนัสดาเมจใส่ศัตรูเลือดต่ำกว่า 20%

    this.maxHp = cfg.hp;
    this.hp = cfg.hp;

    this.healPercent = cfg.healPercent || 0;
    this.healCount = cfg.healCount || 0;
    this.isHealer = this.healPercent > 0;

    this.totalInvest = 0;

    this.spawnAnim = 1;
    this.spawnAngle = -Math.PI / 2;
    this.fireAnim = 0;
    this.destroyAnim = 0;
    this.shake = 0;

    this.spawnTime = Date.now();
    this.dead = false;
    this.destroying = false;
    this.waitingRespawn = false;
    this.respawnProgress = 1;
  }

  getMaxLevel() {
    return TOWER_TYPES[this.type].maxLevel || MAX_TOWER_LEVEL;
  }

  getBulletColor() {
    return this.muzzleColor || "#222";
  }

  update(dt) {
    if (this.destroying) {
      this.destroyAnim -= dt;
      this.shake = Math.max(0, this.destroyAnim) * 6;

      if (this.destroyAnim <= 0) {
        this.destroying = false;
        this.dead = true;
        this.hp = 0;
        this.waitingRespawn = true;
        this.respawnProgress = 0;

        const slot = this.slot;
        if (slot && !slot.respawning) {
          slot.respawning = true;
          slot.respawnTimer = setTimeout(() => {
            this.waitingRespawn = false;
            this.respawnProgress = 0;
            this.spawnAnim = 0;
            this.hp = 0;
            slot.respawning = false;
            slot.respawnTimer = null;
          }, 100);
        }
      }
      return;
    }

    if (this.waitingRespawn) return;

    if (this.respawnProgress < 1) {
      const speed = 0.1;
      this.respawnProgress += dt * speed;
      if (this.respawnProgress > 1) this.respawnProgress = 1;
      this.spawnAnim = this.respawnProgress;
      this.hp = this.maxHp * this.respawnProgress;
      return;
    }

    this.dead = false;

    if (this.fireAnim > 0) {
      this.fireAnim -= dt;
      if (this.fireAnim < 0) this.fireAnim = 0;
    }

    if (this.isHealer) {
      if (this.cooldown > 0) { this.cooldown -= dt; return; }

      const targets = state.towers
        .filter(t => t !== this && !t.dead && t.hp < t.maxHp && Math.hypot(t.x - this.x, t.y - this.y) <= this.range)
        .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))
        .slice(0, this.healCount);

      for (const t of targets) {
        const heal = t.maxHp * this.healPercent;
        t.hp = Math.min(t.maxHp, t.hp + heal);
        spawnDamage(t.x, t.y - 10, `+${Math.floor(heal)}`, "heal");
      }

      this.cooldown = this.cooldownMax;
      return;
    }

    if (this.cooldown <= 0) this.currentTarget = getTowerTarget(this);
    const target = this.currentTarget;

    if (target) {
      this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
      let diff = this.targetAngle - this.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      this.angle += diff * Math.min(1, this.turnSpeed * dt);
    }

    if (this.cooldown > 0) { this.cooldown -= dt; return; }

    if (target) {
      const muzzleFn = TOWER_MUZZLE[this.type] || TOWER_MUZZLE[this.type.replace(/_evo1$/, "")];
      let bx = this.x, by = this.y;
      if (muzzleFn) {
        const m = muzzleFn(this);
        if (m) {
          bx += Math.cos(this.angle) * m.x - Math.sin(this.angle) * m.y;
          by += Math.sin(this.angle) * m.x + Math.cos(this.angle) * m.y;
        }
      }

      const cfg = TOWER_TYPES[this.type];
      if (cfg.chainCount) {
        state.bullets.push(new LightningBullet(bx, by, target, this.damage, cfg, this.color));
      } else {
        const m = muzzleFn ? muzzleFn(this) : null;
        const radius = m?.r ?? 2.5;
        state.bullets.push(new Bullet(bx, by, target, this.damage, this.getBulletColor(), radius, this.critChance, this.critDamage, this.executeBonus));
      }

      this.cooldown = this.cooldownMax;
      this.fireAnim = 0.08;
    }
  }

  draw(ctx) {
    ctx.save();
    let dx = 0, dy = 0, scale = 1;

    if (this.destroying) {
      dx = (Math.random() - 0.5) * this.shake * 6;
      dy = (Math.random() - 0.5) * this.shake * 6;
      scale = 0.7 + this.destroyAnim;
    }

    ctx.translate(this.x + dx, this.y + dy);
    ctx.scale(scale, scale);

    const recoverRatio = this.hp / this.maxHp;

    ctx.fillStyle = "#444";
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    if (!this.dead) {
      let turretAngle = this.angle;
      if (this.spawnAnim < 1) {
        turretAngle = this.spawnAngle * (1 - this.spawnAnim) + this.angle * this.spawnAnim;
      }

      ctx.save();
      ctx.rotate(turretAngle);
      const drawFn = TOWER_DRAW_REGISTRY[this.type];
      if (drawFn) drawFn(ctx, this);
      ctx.restore();
    }

    if (!this.dead) {
      let barrelAngle = this.angle;
      if (this.spawnAnim < 1) {
        barrelAngle = this.spawnAngle * (1 - this.spawnAnim) + this.angle * this.spawnAnim;
      }
      ctx.rotate(barrelAngle);

      if (this.fireAnim > 0) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();

    ctx.fillStyle = "#400";
    ctx.fillRect(this.x - 14, this.y + 18, 28, 4);
    ctx.fillStyle = this.dead ? "#666" : "red";
    ctx.fillRect(this.x - 14, this.y + 18, 28 * recoverRatio, 4);

    const showIcon = (Date.now() - this.spawnTime <= 10000);
    if (showIcon) {
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.fillText(
        this.targetType === "ground" ? "👣" : this.targetType === "air" ? "🪽" : "👣🪽",
        this.x, this.y + 35
      );
    }

    const maxLevel = this.getMaxLevel();
    const isMax = this.level >= maxLevel;
    const levelY = showIcon ? this.y + 48 : this.y + 35;

    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = isMax ? "#ff4444" : "#ffd700";
    ctx.fillText(isMax ? "MAX" : `Lv.${this.level}`, this.x, levelY);
  }
}

export function destroyTower(tower) {
  if (tower.destroying || tower.dead) return;
  tower.currentTarget = null;
  tower.destroying = true;
  tower.destroyAnim = 0.6;
  tower.shake = 1;
}

// หมายเหตุ: ของเดิมมีฟังก์ชัน respawnTower(slot) ที่ไม่เคยถูกเรียกใช้จริงและจะพังทันทีถ้าเรียก
// (อ้างตัวแปร `type` ที่ไม่มีอยู่ในสโคป — ดู AUDIT.md) ตัดทิ้งเพราะเป็น dead code ที่พังอยู่แล้ว
// การรีสปอว์นป้อมจริงทำงานผ่าน Tower.update() (respawnProgress) อยู่แล้ว ไม่ได้ใช้ฟังก์ชันนี้เลย
