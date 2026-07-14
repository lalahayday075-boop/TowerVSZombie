//zombie/zombieskin/drawzombieSongkran.js
export function drawGroundMeleeSongkran(ctx, z) {
  const size = z.isBoss ? 44 : 28;
  const half = size / 2;

  const t = z.animTime;
  const bob = Math.sin(t) * 1.8;
  const sway = Math.sin(t * 0.6) * 0.2;
  const limp = Math.sin(t * 1.4) * 6;

  // ===== SHADOW =====
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    z.x,
    z.y + half + 6,
    half * 1.2,
    half * 0.4,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  // ===== BODY GROUP =====
  ctx.save();
  ctx.translate(z.x, z.y + bob);
  ctx.rotate(sway);

  const skin = z.electricTime > 0 ? "#fff" : "#6fae8a";

  // ===== LEGS =====
  ctx.strokeStyle = "#2f4f2f";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-half * 0.3, half * 1.0);
  ctx.lineTo(-half * 0.6, half * 1.6 + limp);
  ctx.stroke();

  ctx.strokeStyle = "#355";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(half * 0.2, half * 0.9);
  ctx.lineTo(half * 0.3, half * 1.3 - limp * 0.3);
  ctx.stroke();

  // ===== เสื้อฮาวาย =====
  ctx.fillStyle = "#ff4da6";
  ctx.beginPath();
  ctx.moveTo(-half * 0.9, -half * 0.3);
  ctx.lineTo(half * 0.6, -half * 0.4);
  ctx.lineTo(half * 1.0, half * 1.0);
  ctx.lineTo(-half * 0.8, half * 1.1);
  ctx.closePath();
  ctx.fill();

  // ลายดอกมั่ว ๆ
  ctx.fillStyle = "#fff";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(i * 5, 5, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== HEAD =====
  ctx.save();
  ctx.translate(-half * 0.3, -half * 0.95);
  ctx.rotate(-0.35);

  ctx.fillStyle = skin;
  ctx.fillRect(-half * 0.65, -half * 0.55, size * 0.6, size * 0.55);

  ctx.fillStyle = "#fff";
  ctx.fillRect(-5, -3, 3, 3);

  ctx.fillStyle = "#300";
  ctx.fillRect(2, -1, 2, 2);

  ctx.fillStyle = "#200";
  ctx.fillRect(-3, 4, 11, 3);

  ctx.restore();

  // ===== ปืนฉีดน้ำ =====
  ctx.save();
  ctx.translate(half * 0.6, -2);

  ctx.fillStyle = "#00bfff";
  ctx.fillRect(0, 0, 16, 6);

  ctx.fillStyle = "#ff0";
  ctx.fillRect(12, -2, 6, 4);

  ctx.restore();

  // ===== แขน =====
  ctx.strokeStyle = "#354";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-half * 0.9, half * 0.15);
  ctx.lineTo(-half - 15, limp);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half * 0.5, half * 0.25);
  ctx.lineTo(half + 8, -limp * 0.3);
  ctx.stroke();

  // ===== เอฟเฟกต์น้ำกระเด็น =====
  ctx.fillStyle = "rgba(100,200,255,0.6)";
  for (let i = 0; i < 5; i++) {
    const splashX = half + 20 + Math.sin(t + i) * 6;
    const splashY = Math.cos(t * 2 + i) * 6;
    ctx.beginPath();
    ctx.arc(splashX, splashY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // ===== HP BAR =====
  const hpW = size;
  const hpH = 4;
  const hpY = z.y - half - 12;

  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, hpH);

  ctx.fillStyle = "#f33";
  ctx.fillRect(
    z.x - hpW / 2,
    hpY,
    hpW * (z.hp / z.maxHp),
    hpH
  );
}
export function drawGroundRangedSongkran(ctx, z) {
  const size = z.isBoss ? 48 : 28;
  const half = size / 2;

  const t = z.animTime;
  const step = Math.sin(t * 10);
  const sway = Math.sin(t * 1.2) * 0.08;

  const skin = z.electricTime > 0 ? "#fff" : "#7ecf9a";
  const aimAngle = z.aimAngle || 0;

  // ===== SHADOW =====
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(
    z.x,
    z.y + half + 6,
    half * 1.1,
    half * 0.35,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.save();
  ctx.translate(z.x, z.y);
  ctx.rotate(sway);

  // =========================
  // LEGS
  // =========================
  ctx.lineCap = "round";
  ctx.strokeStyle = "#2a3f2a";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-half * 0.25, half * 0.9);
  ctx.lineTo(-half * 0.35, half * 1.4 + step * 3);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half * 0.25, half * 0.9);
  ctx.lineTo(half * 0.35, half * 1.4 - step * 3);
  ctx.stroke();

  // =========================
  // BODY (เสื้อฮาวาย)
  // =========================
  ctx.fillStyle = "#ff4db8";
  ctx.fillRect(-half * 0.5, -half * 0.3, half * 1.0, half * 1.5);

  // ลายดอก
  ctx.fillStyle = "#fff";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 6, 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // =========================
  // ถังน้ำสะพายหลัง
  // =========================
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(-half * 0.9, -half * 0.1, 10, 16);

  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-half * 0.4, -half * 0.2);
  ctx.lineTo(-half * 0.9 + 5, -half * 0.1);
  ctx.stroke();

  // =========================
  // HEAD
  // =========================
  ctx.save();
  ctx.translate(0, -half * 0.95);

  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(0, 0, half * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // แว่นกันน้ำ
  ctx.fillStyle = "#00d8ff";
  ctx.fillRect(-7, -3, 14, 5);
  ctx.strokeStyle = "#003";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-7, -3, 14, 5);

  ctx.restore();

  // =========================
  // WATER GUN SYSTEM
  // =========================
  ctx.save();

  const gunBaseX = 0;
  const gunBaseY = -half * 0.05;

  ctx.translate(gunBaseX, gunBaseY);
  ctx.rotate(aimAngle);

  // แขน
  ctx.strokeStyle = "#445";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // ปืนฉีดน้ำ
  ctx.fillStyle = "#00cfff";
  ctx.fillRect(0, -5, 28, 10);

  ctx.fillStyle = "#ff0";
  ctx.fillRect(22, -3, 10, 6);

  // ด้ามจับ
  ctx.fillStyle = "#0088aa";
  ctx.fillRect(8, 5, 6, 10);

  // =========================
  // น้ำพุ่ง (beam สายสาด)
  // =========================
  ctx.strokeStyle = "rgba(120,220,255,0.8)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(32, 0);
  ctx.lineTo(60 + Math.sin(t * 20) * 5, Math.sin(t * 10) * 3);
  ctx.stroke();

  // ละอองน้ำ
  ctx.fillStyle = "rgba(100,200,255,0.7)";
  for (let i = 0; i < 4; i++) {
    const px = 60 + i * 6 + Math.sin(t + i) * 4;
    const py = Math.cos(t * 2 + i) * 4;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
  ctx.restore();

  // =========================
  // HP BAR
  // =========================
  const hpW = size;
  const hpH = 4;
  const hpY = z.y - half - 16;

  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, hpH);

  ctx.fillStyle = "#f33";
  ctx.fillRect(
    z.x - hpW / 2,
    hpY,
    hpW * (z.hp / z.maxHp),
    hpH
  );
}
export function drawAirMeleeSongkran(ctx, z) {
  const size = z.isBoss ? 46 : 30;
  const half = size / 2;

  const t = z.animTime;
  const hover = Math.sin(t * 1.6) * 6;
  const sway = Math.sin(t * 0.5) * 0.12;
  const flap = Math.sin(t * 3.0) * 0.3;

  // ===== SHADOW =====
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, z.y + half + 22, half * 0.9, half * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(z.x, z.y - half - 6 + hover);
  ctx.rotate(sway);

  // ===== WINGS (โปร่งฟ้าแบบน้ำ) =====
  function drawWing(dir) {
    ctx.save();
    ctx.scale(dir, 1);
    ctx.translate(0, -half * 0.35);
    ctx.rotate(flap);

    ctx.fillStyle = "rgba(120,220,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(half * 1.2, -half * 0.4);
    ctx.lineTo(half * 1.4, half * 0.2);
    ctx.lineTo(half * 0.9, half * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawWing(-1);
  drawWing(1);

  // ===== BODY (เสื้อฮาวาย) =====
  ctx.fillStyle = "#ff5cab";
  ctx.beginPath();
  ctx.ellipse(0, half * 0.3, half * 0.7, half * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // ลายดอก
  ctx.fillStyle = "#fff";
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.arc(i * 6, half * 0.2, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== ถังสะพายน้ำ =====
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(-half * 0.9, half * 0.1, 8, 14);

  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-half * 0.5, -half * 0.2);
  ctx.lineTo(-half * 0.9 + 4, half * 0.1);
  ctx.stroke();

  // ===== HEAD =====
  ctx.save();
  ctx.translate(-half * 0.1, -half * 1.1);
  ctx.rotate(-0.25);

  ctx.fillStyle = "#7fd4aa";
  ctx.beginPath();
  ctx.ellipse(0, 0, half * 0.4, half * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // แว่นกันน้ำ
  ctx.fillStyle = "#00d0ff";
  ctx.fillRect(-6, -3, 12, 5);
  ctx.strokeStyle = "#003";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-6, -3, 12, 5);

  // ปาก
  ctx.fillStyle = "#200";
  ctx.fillRect(-4, 5, 8, 2);

  ctx.restore();

  // ===== LEGS =====
  ctx.strokeStyle = "#2b4a3f";
  ctx.lineWidth = 1.6;

  ctx.beginPath();
  ctx.moveTo(-half * 0.25, half * 1.05);
  ctx.lineTo(-half * 0.3, half * 1.9 + hover * 0.2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half * 0.2, half * 1.05);
  ctx.lineTo(half * 0.3, half * 1.8 - hover * 0.2);
  ctx.stroke();

  // ===== เอฟเฟกต์สาดน้ำ =====
  ctx.fillStyle = "rgba(100,200,255,0.7)";
  for (let i = 0; i < 6; i++) {
    const splashX = half + 18 + Math.sin(t + i) * 8;
    const splashY = Math.cos(t * 2 + i) * 8;
    ctx.beginPath();
    ctx.arc(splashX, splashY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // ===== HP BAR =====
  const hpW = size;
  const hpY = z.y - size - 32;

  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, 4);

  ctx.fillStyle = "#f33";
  ctx.fillRect(
    z.x - hpW / 2,
    hpY,
    hpW * (z.hp / z.maxHp),
    4
  );
}