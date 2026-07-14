//zombie/zombieskin/drawzombies.js
export function drawGroundMelee(ctx, z) {
  const size = z.isBoss ? 40 : 26;
  const half = size / 2;

  const t = z.animTime;
  const bob = Math.sin(t) * 1.6;
  const sway = Math.sin(t * 0.5) * 0.18;
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

  // ===== ZOMBIE =====
  ctx.save();
  ctx.translate(z.x, z.y + bob);
  ctx.rotate(sway);

  const skin = z.electricTime > 0 ? "#fff" : "#6c8f6c";

  // ===== LEGS (ขาลากพื้น) =====
  ctx.strokeStyle = "#2f4f2f";
  ctx.lineWidth = 4;

  // ขาซ้าย (ลากพื้น ยาว ตายด้าน)
  ctx.beginPath();
  ctx.moveTo(-half * 0.3, half * 1.0);
  ctx.lineTo(-half * 0.6, half * 1.6 + limp);
  ctx.stroke();

  // รอยลาก
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-half * 0.6, half * 1.6 + limp);
  ctx.lineTo(-half * 1.2, half * 1.75 + limp);
  ctx.stroke();

  // ขาขวา (งอ พอเดินได้)
  ctx.strokeStyle = "#355";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(half * 0.2, half * 0.9);
  ctx.lineTo(half * 0.3, half * 1.3 - limp * 0.3);
  ctx.stroke();

  // ===== BODY (ทรงคางหมู งุ้ม) =====
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.moveTo(-half * 0.9, -half * 0.3);
  ctx.lineTo(half * 0.6, -half * 0.4);
  ctx.lineTo(half * 1.0, half * 1.0);
  ctx.lineTo(-half * 0.8, half * 1.1);
  ctx.closePath();
  ctx.fill();

  // ===== WOUND =====
  ctx.fillStyle = "#4a2";
  ctx.fillRect(-2, half * 0.4, 7, 4);
  ctx.fillStyle = "#822";
  ctx.fillRect(1, half * 0.45, 4, 3);

  // ===== HEAD =====
  ctx.save();
  ctx.translate(-half * 0.3, -half * 0.95);
  ctx.rotate(-0.35);

  ctx.fillStyle = "#7a9f7a";
  ctx.fillRect(-half * 0.65, -half * 0.55, size * 0.6, size * 0.55);

  ctx.fillStyle = "#eee";
  ctx.fillRect(-5, -3, 3, 3);

  ctx.fillStyle = "#300";
  ctx.fillRect(2, -1, 2, 2);

  ctx.fillStyle = "#200";
  ctx.fillRect(-3, 4, 11, 3);

  ctx.restore();

  // ===== ARMS =====
  ctx.strokeStyle = "#354";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(-half * 0.9, half * 0.15);
  ctx.lineTo(-half - 15, limp);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half * 0.5, half * 0.25);
  ctx.lineTo(half + 7, -limp * 0.3);
  ctx.stroke();

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
export function drawGroundRanged(ctx, z) {
  const size = z.isBoss ? 44 : 26;
  const half = size / 2;
  
  const t = z.animTime;
  const step = Math.sin(t * 10);
  const sway = Math.sin(t * 1.2) * 0.08;
  
  const skin = z.electricTime > 0 ? "#fff" : "#5f8560";
  
  // ===== AIM ANGLE =====
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
  // BODY
  // =========================
  ctx.fillStyle = skin;
  ctx.fillRect(-half * 0.45, -half * 0.3, half * 0.9, half * 1.4);
  
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(-half * 0.35, -half * 0.1, half * 0.7, half * 0.9);
  
  // =========================
  // HEAD
  // =========================
  ctx.save();
  ctx.translate(0, -half * 0.9);
  ctx.rotate(0.1);
  
  ctx.fillStyle = "#6f9a6f";
  ctx.beginPath();
  ctx.arc(0, 0, half * 0.55, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#111";
  ctx.fillRect(-6, -2, 12, 4);
  
  ctx.restore();
  
  // =========================
  // GUN SYSTEM (หมุนตามเป้า)
  // =========================
  ctx.save();
  
  const gunBaseX = 0;
  const gunBaseY = -half * 0.05;
  
  ctx.translate(gunBaseX, gunBaseY);
  ctx.rotate(aimAngle);
  
  // แขนหลัง
  ctx.strokeStyle = "#445";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
  
  // ปืน
  ctx.fillStyle = "#222";
  ctx.fillRect(0, -4, 26, 8);
  
  ctx.fillStyle = "#111";
  ctx.fillRect(26, -3, 8, 6);
  
  // ด้าม
  ctx.fillStyle = "#333";
  ctx.fillRect(6, 4, 5, 10);
  
  ctx.restore();
  
  ctx.restore();
  
  // =========================
  // HP BAR
  // =========================
  const hpW = size;
  const hpH = 4;
  const hpY = z.y - half - 14;
  
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
export function drawGroundLightning(ctx, z) {
  const size = 26;
  const half = size / 2;
  const t = z.animTime;

  ctx.save();
  ctx.translate(z.x, z.y);

  // body
  ctx.fillStyle = "#5f8fa5";
  ctx.fillRect(-half, -half, size, size * 1.4);

  // head
  ctx.fillStyle = "#7fbfd4";
  ctx.fillRect(-half * 0.6, -half * 1.2, half * 1.2, half * 0.8);

  // arm up
  ctx.strokeStyle = "#355";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(half * 0.8, -half * 0.2);
  ctx.lineTo(half * 1.1, -half * 0.8);
  ctx.stroke();

  // electric orb
  ctx.fillStyle = "#88f";
  ctx.beginPath();
  ctx.arc(
    half * 1.2,
    -half * 0.9,
    4 + Math.sin(t * 6) * 1.5,
    0,
    Math.PI * 2
  );
  ctx.fill();

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
export function drawAirMelee(ctx, z) {
  const size = z.isBoss ? 42 : 28;
  const half = size / 2;
  
  const t = z.animTime;
  const hover = Math.sin(t * 1.6) * 6;
  const sway = Math.sin(t * 0.5) * 0.12;
  const flap = Math.sin(t * 3.0) * 0.25;
  
  // ===== SHADOW =====
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, z.y + half + 20, half * 0.8, half * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.save();
  ctx.translate(z.x, z.y - half - 6 + hover);
  ctx.rotate(sway);
  
  // ===== WINGS (สูงขึ้น + ยาวขึ้นเล็กน้อย) =====
  function drawWing(dir) {
    ctx.save();
    ctx.scale(dir, 1);
    ctx.translate(0, -half * 0.35); // 🔼 ยกปีกขึ้น
    ctx.rotate(flap);
    
    ctx.fillStyle = "rgba(120,180,180,0.45)";
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(half * 1.15, -half * 0.35); // ➕ ยาวขึ้นนิด
    ctx.lineTo(half * 1.35, half * 0.15);
    ctx.lineTo(half * 0.85, half * 0.45);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = "#355";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(half * 1.1, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  drawWing(-1);
  drawWing(1);
  
  // ===== BODY (ยาว แนวตั้ง) =====
  ctx.fillStyle = "#5f9f7f";
  ctx.beginPath();
  ctx.ellipse(0, half * 0.25, half * 0.65, half * 1.0, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // แผล / กระดูก
  ctx.strokeStyle = "#cfeedd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, half * 0.2);
  ctx.lineTo(-6, half * 0.65);
  ctx.stroke();
  
  // ===== HEAD (เล็ก + คอยืด) =====
  ctx.save();
  ctx.translate(-half * 0.15, -half * 1.05);
  ctx.rotate(-0.3);
  
  ctx.strokeStyle = "#3a6";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(2, half * 0.3);
  ctx.lineTo(0, half * 0.75);
  ctx.stroke();
  
  ctx.fillStyle = "#7fd4aa";
  ctx.beginPath();
  ctx.ellipse(0, 0, half * 0.38, half * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = "#fff";
  ctx.fillRect(-5, -2, 3, 3);
  ctx.fillRect(1, -1, 2, 2);
  
  ctx.fillStyle = "#200";
  ctx.fillRect(-4, 4, 8, 2);
  
  ctx.restore();
  
  // ===== LEGS (เล็ก ไร้แรง) =====
  ctx.strokeStyle = "#2b4a3f";
  ctx.lineWidth = 1.6; // 👈 ทำให้ผอม
  
  ctx.beginPath();
  ctx.moveTo(-half * 0.25, half * 1.05);
  ctx.lineTo(-half * 0.3, half * 1.85 + hover * 0.2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(half * 0.2, half * 1.05);
  ctx.lineTo(half * 0.28, half * 1.75 - hover * 0.2);
  ctx.stroke();
  
  ctx.restore();
  
  // ===== HP BAR =====
  const hpW = size;
  const hpY = z.y - size - 30;
  
  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, 4);
  ctx.fillStyle = "#f33";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW * (z.hp / z.maxHp), 4);
}
export function drawAirRanged(ctx, z) {
  const size = 28;
  const half = size / 2;
  const t = z.animTime;
  const hover = Math.sin(t * 1.5) * 6;

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(z.x, z.y + half + 20, half, half * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(z.x, z.y - half + hover);

  // wings (ง่ายมาก)
  ctx.fillStyle = "rgba(120,180,180,0.4)";
  ctx.beginPath();
  ctx.moveTo(-half, 0);
  ctx.lineTo(-half * 2, -half * 0.3);
  ctx.lineTo(-half * 2, half * 0.3);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(half * 2, -half * 0.3);
  ctx.lineTo(half * 2, half * 0.3);
  ctx.fill();

  // body
  ctx.fillStyle = "#6fa98f";
  ctx.fillRect(-half * 0.6, -half * 0.2, half * 1.2, size);

  // gun
  ctx.fillStyle = "#444";
  ctx.fillRect(half * 0.6, 0, 10, 3);

  ctx.restore();
    // ===== HP BAR =====
  const hpW = size;
  const hpY = z.y - size - 30;
  
  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, 4);
  ctx.fillStyle = "#f33";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW * (z.hp / z.maxHp), 4);
}
export function drawAirLightning(ctx, z) {
  const size = 28;
  const half = size / 2;
  const t = z.animTime;
  const hover = Math.sin(t * 1.3) * 6;

  ctx.save();
  ctx.translate(z.x, z.y - half + hover);

  // body
  ctx.fillStyle = "#5fa0c0";
  ctx.fillRect(-half * 0.6, -half * 0.2, half * 1.2, size);

  // head
  ctx.fillStyle = "#8fd0ff";
  ctx.fillRect(-half * 0.4, -half * 0.9, half * 0.8, half * 0.6);

  // electric core
  ctx.strokeStyle = "#99f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, half * 0.5, 6 + Math.sin(t * 5) * 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
    // ===== HP BAR =====
  const hpW = size;
  const hpY = z.y - size - 30;
  
  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, 4);
  ctx.fillStyle = "#f33";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW * (z.hp / z.maxHp), 4);
}
export function drawBossGroundMelee(ctx, z) {
  const size = 60;
  const half = size / 2;

  const t = z.animTime;
  const bob = Math.sin(t * 0.6) * 1.4;
  const limp = Math.sin(t * 1.2) * 6;

  // ===== SHADOW =====
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.ellipse(
    z.x,
    z.y + half + 18,
    half * 2.2,
    half * 0.55,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(z.x, z.y + bob);
  ctx.rotate(-0.08); // 🔥 ค่อม

  // ===== LEGS (ลาก หนัก) =====
  ctx.strokeStyle = "#2a3b2a";
  ctx.lineWidth = 7;

  ctx.beginPath();
  ctx.moveTo(-half * 0.5, half * 0.7);
  ctx.lineTo(-half * 0.8, half * 2.0 + limp);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half * 0.3, half * 0.8);
  ctx.lineTo(half * 0.5, half * 1.7 - limp * 0.3);
  ctx.stroke();

  // ===== BODY (บิด + เน่า) =====
  ctx.fillStyle = "#556b4f";
  ctx.beginPath();
  ctx.moveTo(-half * 1.2, -half * 0.2);
  ctx.lineTo(half * 0.9, -half * 0.5);
  ctx.lineTo(half * 1.2, half * 1.1);
  ctx.lineTo(-half * 1.0, half * 1.3);
  ctx.closePath();
  ctx.fill();

  // แผลแตก
  ctx.fillStyle = "#3a2";
  ctx.fillRect(-10, half * 0.2, 14, 6);
  ctx.fillStyle = "#822";
  ctx.fillRect(-6, half * 0.25, 6, 4);

  // ===== HEAD (เล็ก เอียง แตก) =====
  ctx.save();
  ctx.translate(-half * 0.4, -half * 0.95);
  ctx.rotate(-0.45);

  ctx.fillStyle = "#6f8f6f";
  ctx.fillRect(-half * 0.4, -half * 0.35, half * 0.8, half * 0.55);

  // ตาไม่เท่ากัน
  ctx.fillStyle = "#eee";
  ctx.fillRect(-6, -2, 3, 3);
  ctx.fillStyle = "#300";
  ctx.fillRect(2, 0, 2, 2);

  // ปากฉีก
  ctx.fillStyle = "#200";
  ctx.fillRect(-5, 6, 12, 3);

  ctx.restore();

  // ===== ARMS (ยาว ผิดรูป) =====
  ctx.strokeStyle = "#314531";
  ctx.lineWidth = 6;

  // แขนซ้ายลากพื้น
  ctx.beginPath();
  ctx.moveTo(-half * 1.1, half * 0.1);
  ctx.lineTo(-half * 2.1, half * 1.2 + limp);
  ctx.stroke();

  // แขนขวางอ
  ctx.beginPath();
  ctx.moveTo(half * 0.8, half * 0.2);
  ctx.lineTo(half * 1.4, half * 0.6);
  ctx.stroke();

  ctx.restore();
  // ===== BOSS HP BAR =====
const hpW = size;
const hpH = 7;
const hpY = z.y - half - 20;

ctx.fillStyle = "#300";
ctx.fillRect(z.x - hpW / 2, hpY, hpW, hpH);

ctx.fillStyle = "#ff3333";
ctx.fillRect(
  z.x - hpW / 2,
  hpY,
  hpW * (z.hp / z.maxHp),
  hpH
);
}
export function drawBossAirMelee(ctx, z) {
  const size = 64;
  const half = size / 2;

  const t = z.animTime;
  const hover = Math.sin(t * 0.8) * 6;
  const sway = Math.sin(t * 0.4) * 0.12;
  const flap = Math.sin(t * 1.6) * 0.25;

  // ===== SHADOW (ใหญ่ หนัก) =====
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.beginPath();
  ctx.ellipse(
    z.x,
    z.y + half + 26,
    half * 2.0,
    half * 0.5,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(z.x, z.y - half + hover);
  ctx.rotate(sway);

  // ===== WINGS (ขาด + ไม่เท่ากัน) =====
  function drawWing(dir, scaleY) {
    ctx.save();
    ctx.scale(dir, scaleY);
    ctx.rotate(flap * dir);

    ctx.fillStyle = "rgba(90,130,110,0.45)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(half * 1.4, -half * 0.3);
    ctx.lineTo(half * 1.8, half * 0.4);
    ctx.lineTo(half * 0.9, half * 0.6);
    ctx.closePath();
    ctx.fill();

    // กระดูกปีก
    ctx.strokeStyle = "#2a4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(half * 1.4, half * 0.2);
    ctx.stroke();

    ctx.restore();
  }

  drawWing(-1, 0.9); // ปีกซ้าย
  drawWing(1, 0.6);  // ปีกขวาขาดกว่า

  // ===== BODY (ยาว ห้อย หนัก) =====
  ctx.fillStyle = "#5f7f6a";
  ctx.beginPath();
  ctx.ellipse(0, half * 0.5, half * 0.75, half * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // แผลเน่า
  ctx.fillStyle = "#3a2";
  ctx.fillRect(-8, half * 0.6, 12, 6);
  ctx.fillStyle = "#822";
  ctx.fillRect(-5, half * 0.65, 6, 4);

  // ===== HEAD (คอยืด + เอียงแรง) =====
  ctx.save();
  ctx.translate(-half * 0.25, -half * 0.9);
  ctx.rotate(-0.45);

  // คอ
  ctx.strokeStyle = "#355";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(6, half * 0.3);
  ctx.lineTo(2, half * 0.8);
  ctx.stroke();

  // หัว
  ctx.fillStyle = "#7fa88f";
  ctx.beginPath();
  ctx.ellipse(0, 0, half * 0.45, half * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ตาไม่เท่ากัน
  ctx.fillStyle = "#eee";
  ctx.fillRect(-6, -3, 3, 3);
  ctx.fillStyle = "#300";
  ctx.fillRect(3, -1, 2, 2);

  // ปากฉีก
  ctx.fillStyle = "#200";
  ctx.fillRect(-6, 6, 14, 3);

  ctx.restore();

  // ===== ARMS (ยาว + ฟาดได้) =====
  ctx.strokeStyle = "#2f4f3a";
  ctx.lineWidth = 6;

  // แขนซ้ายยาวผิดธรรมชาติ
  ctx.beginPath();
  ctx.moveTo(-half * 0.9, half * 0.4);
  ctx.lineTo(-half * 1.9, half * 1.1 + hover * 0.2);
  ctx.stroke();

  // แขนขวางอ
  ctx.beginPath();
  ctx.moveTo(half * 0.6, half * 0.3);
  ctx.lineTo(half * 1.2, half * 0.8);
  ctx.stroke();

  ctx.restore();

  // ===== BOSS HP BAR =====
  const hpW = size;
  const hpH = 7;
  const hpY = z.y - size - 30;

  ctx.fillStyle = "#300";
  ctx.fillRect(z.x - hpW / 2, hpY, hpW, hpH);

  ctx.fillStyle = "#ff3333";
  ctx.fillRect(
    z.x - hpW / 2,
    hpY,
    hpW * (z.hp / z.maxHp),
    hpH
  );
}


