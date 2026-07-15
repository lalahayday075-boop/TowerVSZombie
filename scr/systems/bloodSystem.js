// src/systems/bloodSystem.js
const bloodParticles = [];
const bloodStains = [];

class BloodParticle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = (Math.random() - 0.5) * 120;
    this.vy = (Math.random() - 0.5) * 120;
    this.life = 0.4 + Math.random() * 0.3;
  }
  update(dt) {
    this.life -= dt;
    this.vy += 300 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  draw(ctx) {
    ctx.fillStyle = "rgba(150,0,0,0.8)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class BloodStain {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.life = 2.0;
    this.size = 6 + Math.random() * 6;
  }
  update(dt) { this.life -= dt; }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    const scaleX = 1 + Math.random() * 0.6;
    const scaleY = 0.4 + Math.random() * 0.3;
    ctx.scale(scaleX, scaleY);
    ctx.fillStyle = `rgba(120,0,0,${this.life / 2})`;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function spawnBlood(x, y) {
  for (let i = 0; i < 6; i++) bloodParticles.push(new BloodParticle(x, y));
  bloodStains.push(new BloodStain(x, y));
}

export function updateBlood(dt, ctx) {
  for (let i = bloodParticles.length - 1; i >= 0; i--) {
    const b = bloodParticles[i];
    b.update(dt); b.draw(ctx);
    if (b.life <= 0) bloodParticles.splice(i, 1);
  }
  for (let i = bloodStains.length - 1; i >= 0; i--) {
    const s = bloodStains[i];
    s.update(dt); s.draw(ctx);
    if (s.life <= 0) bloodStains.splice(i, 1);
  }
}
