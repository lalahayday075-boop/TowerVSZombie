//drawtw.js
export function drawNormalTower(ctx, tower) {
  ctx.save();
tower.muzzleColor = "#00bfff";
  // ===== ฐานเล็ก =====
  ctx.fillStyle = "#4a4a4a";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.stroke();

  // ===== ตัวป้อม (เล็กลง) =====
  ctx.fillStyle = "#6b6b6b";
  ctx.fillRect(-4, -6, 10, 12);

  ctx.strokeStyle = "#3a3a3a";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-4, -6, 10, 12);

  // ===== ลำกล้องสั้น =====
  ctx.fillStyle = "#222";
  ctx.fillRect(6, -1.5, 8, 3);

  // muzzle flash เบา ๆ
  if (tower.fireAnim > 0) {
    const p = tower.fireAnim / 0.08;
    ctx.fillStyle = `rgba(255,200,80,${p})`;
    ctx.beginPath();
    ctx.arc(14, 0, 3 + Math.random(), 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== ring ฝึก (บางมาก) =====
  ctx.strokeStyle = "#9bdcff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
export function drawRapidTower(ctx, tower) {
  ctx.save();

  const fire = tower.fireAnim > 0
    ? tower.fireAnim / 0.08
    : 0;

  const recoil = -4 * fire;
  const spin = fire * 0.15 * Math.sin(Date.now() * 0.05);

  // ===== โครงป้อม (ไม่ขยับ) =====
  ctx.fillStyle = "#3b3b3b";
  ctx.fillRect(-6, -9, 22, 18);

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.strokeRect(-6, -9, 22, 18);

  // housing ด้านบน
  ctx.fillStyle = "#555";
  ctx.fillRect(2, -14, 10, 6);

  // ===== ชุดลำกล้อง (ขยับจริง) =====
  ctx.save();
  ctx.translate(recoil, 0);
  ctx.rotate(spin);

  ctx.fillStyle = "#222";
  ctx.fillRect(16, -4, 14, 3);
  ctx.fillRect(16, 1, 14, 3);

  // ปลายปากกระบอก
  ctx.fillStyle = "#111";
  ctx.fillRect(28, -5, 2, 4);
  ctx.fillRect(28, 0, 2, 4);

  // muzzle flash
  if (fire > 0) {
    ctx.fillStyle = `rgba(255,200,80,${fire})`;
    ctx.beginPath();
    ctx.arc(30, 0, 5 + Math.random() * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // ===== ช่องระบาย (สั่นเล็กน้อย) =====
  ctx.strokeStyle = "#0f0";
  ctx.lineWidth = 1;
  for (let i = -6; i <= 6; i += 3) {
    ctx.beginPath();
    ctx.moveTo(4 + recoil * 0.5, i);
    ctx.lineTo(14 + recoil * 0.5, i);
    ctx.stroke();
  }

  // สายกระสุน
  ctx.strokeStyle = "#aa8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-6, 4);
  ctx.lineTo(-12, 8);
  ctx.stroke();

  ctx.restore();
}
export function drawDiamondCannon(ctx, tower) {
  ctx.save();
  
  const t = Date.now() * 0.001;
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -5 * fire;
  const pulse = Math.sin(t * 2) * 0.8;
  
  // ===== ฐานโลหะเข้ม =====
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // ===== วงพลังบาง (accent) =====
  ctx.strokeStyle = `rgba(120,200,255,0.6)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();
  
  // ===== โครงปืน (หนัก) =====
  ctx.fillStyle = "#2b2b2b";
  ctx.fillRect(-6, -4, 14, 8);
  
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-6, -4, 14, 8);
  
  // ===== ลำกล้อง =====
  ctx.save();
  ctx.translate(recoil, 0);
  
  ctx.fillStyle = "#111";
  ctx.fillRect(8, -3, 12, 6);
  
  ctx.strokeStyle = "#4aa3ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(8, -3, 12, 6);
  
  ctx.restore();
  
  // ===== แกนเพชร (2 ชั้น) =====
  ctx.save();
  ctx.rotate(t * 0.8);
  
  // outer glow
  ctx.fillStyle = "rgba(120,200,255,0.35)";
  ctx.beginPath();
  ctx.moveTo(0, -7 - pulse);
  ctx.lineTo(7 + pulse, 0);
  ctx.lineTo(0, 7 + pulse);
  ctx.lineTo(-7 - pulse, 0);
  ctx.closePath();
  ctx.fill();
  
  // inner core
  ctx.fillStyle = "#e8fbff";
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 4);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
  
  // ===== ยิง =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(180,230,255,${fire})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(22, 0, 4 + fire * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}
export function drawSoldierTower(ctx, tower) {
  ctx.save();

  // 🔄 กลับทิศทางภาพทั้งหัวป้อม (ไม่ใช้ scale)
  ctx.rotate(Math.PI*1.5);

  const t = Date.now() * 0.003;
  const pulse = Math.sin(t) * 0.5;

  // ===== ฐานเกราะ =====
  ctx.fillStyle = "#2e3b2f";
  ctx.fillRect(-10, -10, 20, 20);

  ctx.strokeStyle = "#1a241b";
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -10, 20, 20);

  // ===== แผ่นเกราะกลาง =====
  ctx.fillStyle = "#3f5242";
  ctx.fillRect(-6, -6, 12, 12);

  // ===== สัญลักษณ์ทหาร =====
  ctx.strokeStyle = "#cde3cd";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.lineTo(0, 3 + pulse);
  ctx.lineTo(4, -1);
  ctx.stroke();

  // ===== ขอบหนักด้านล่าง =====
  ctx.strokeStyle = "#0f150f";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(8, 8);
  ctx.stroke();

  ctx.restore();
}

export function drawSharpshooter1Tower(ctx, tower) {
  ctx.save();
  
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -5 * fire;

  // ===== ฐานบาง =====
  ctx.fillStyle = "#2a2f36";
  ctx.fillRect(-10, -6, 20, 12);

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -6, 20, 12);

  // ===== เสากล้อง =====
  ctx.fillStyle = "#3a4250";
  ctx.fillRect(-2, -12, 4, 12);

  // ===== ลำกล้องมาตรฐาน =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#1c1f26";
  ctx.fillRect(0, -2, 22, 4);

  ctx.fillStyle = "#0e1014";
  ctx.fillRect(22, -3, 4, 6);

  ctx.restore();

  // ===== กล้องเล็งเล็ก =====
  ctx.fillStyle = "#5f6c80";
  ctx.fillRect(4, -8, 6, 4);

  ctx.strokeStyle = "#9bdcff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
  ctx.stroke();

  // ===== muzzle flash =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(200,220,255,${fire})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(26, -2);
    ctx.lineTo(32, 0);
    ctx.lineTo(26, 2);
    ctx.stroke();
  }

  // ===== anti-air icon =====
  ctx.strokeStyle = "#cce6ff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-6, -10);
  ctx.lineTo(-2, -14);
  ctx.lineTo(2, -10);
  ctx.stroke();

  ctx.restore();
}

export function drawGunnerTower(ctx, tower) {
  ctx.save();

  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -3 * fire;

  // ===== ฐานถังหนัก =====
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(-14, -10, 28, 20);

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.strokeRect(-14, -10, 28, 20);

  // ===== เกราะซ้อน (ความถึก) =====
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(-10, -7, 20, 14);

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.strokeRect(-10, -7, 20, 14);

  // ===== ลำกล้องสั้น หนา (ยิงช้าแต่แรง) =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#1b1b1b";
  ctx.fillRect(10, -4, 10, 8);

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(18, -3, 4, 6);

  ctx.restore();

  // ===== bolt / rivet =====
  ctx.fillStyle = "#555";
  for (let x of [-8, 0, 8]) {
    ctx.beginPath();
    ctx.arc(x, -6, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, 6, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== muzzle shock หนัก (ไม่ฟู) =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(255,180,80,${fire})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 0, 4 + fire * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}


export function drawLightningTower(ctx, tower) {
  ctx.save();

  const t = Date.now() * 0.005;
  const pulse = Math.sin(t * 2) * 1.2;

  // ===== ฐานตัวนำไฟ =====
  ctx.fillStyle = "#2b2b33";
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#15151a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();

  // ===== แกนพลัง (เรืองฟ้า) =====
  ctx.fillStyle = "#8be9ff";
  ctx.beginPath();
  ctx.arc(0, 0, 4 + pulse * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // aura
  ctx.strokeStyle = `rgba(160,220,255,${0.4 + Math.sin(t) * 0.2})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // ===== สายฟ้าแตก (สุ่มทุกเฟรม) =====
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#9be9ff";
  ctx.shadowBlur = 8;

  ctx.beginPath();
  let x = -4, y = -6;
  ctx.moveTo(x, y);

  for (let i = 0; i < 4; i++) {
    x += 2 + Math.random() * 2;
    y += 3;
    ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.shadowBlur = 0;

  ctx.restore();
}
export function drawSharpshooter2Tower(ctx, tower) {
  ctx.save();
  
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -7 * fire;

  // ===== ฐานหนา =====
  ctx.fillStyle = "#1f242c";
  ctx.fillRect(-12, -7, 24, 14);

  ctx.strokeStyle = "#0d0f13";
  ctx.lineWidth = 2;
  ctx.strokeRect(-12, -7, 24, 14);

  // ===== แผ่นเสริมหน้า =====
  ctx.fillStyle = "#343c48";
  ctx.fillRect(-6, -4, 12, 8);

  // ===== เสากล้องหนา =====
  ctx.fillStyle = "#3a4250";
  ctx.fillRect(-3, -14, 6, 14);

  // ===== ลำกล้องยาวขึ้น =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#15181f";
  ctx.fillRect(0, -3, 28, 6);

  ctx.fillStyle = "#0b0d11";
  ctx.fillRect(28, -4, 6, 8);

  ctx.restore();

  // ===== heat vent =====
  ctx.fillStyle = "#2e3540";
  ctx.fillRect(8, -6, 10, 2);

  // ===== กล้องใหญ่ =====
  ctx.fillStyle = "#6f7f95";
  ctx.fillRect(6, -10, 8, 5);

  ctx.strokeStyle = "#bde6ff";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(10, -7.5, 2, 0, Math.PI * 2);
  ctx.stroke();

  // ===== muzzle flash ใหญ่กว่า =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(200,230,255,${fire})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(34, -3);
    ctx.lineTo(42, 0);
    ctx.lineTo(34, 3);
    ctx.stroke();
  }

  // ===== anti-air icon upgrade =====
  ctx.strokeStyle = "#e0f4ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.lineTo(0, -18);
  ctx.lineTo(8, -12);
  ctx.stroke();

  ctx.restore();
}
export function drawHealerTower(ctx, tower) {
  // ฐาน
  ctx.fillStyle = "#6ee7b7";
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();

  // คริสตัลกลาง
  ctx.fillStyle = "#a7f3d0";
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();

  // วงออร่าฮีล
  ctx.strokeStyle = "rgba(110, 231, 183, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();

  // แสงบวก (สัญลักษณ์ฮีล)
  ctx.strokeStyle = "#ecfdf5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, 6);
  ctx.moveTo(-6, 0);
  ctx.lineTo(6, 0);
  ctx.stroke();
}
export function drawCrusherTower(ctx, tower) {
  ctx.save();

  const t = Date.now() * 0.01;
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const shake = fire * 1.5;

  ctx.translate(
    (Math.random() - 0.5) * shake,
    (Math.random() - 0.5) * shake
  );

  // ===== ฐานเครื่องจักร =====
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(-14, -10, 28, 20);

  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 2;
  ctx.strokeRect(-14, -10, 28, 20);

  // ===== ลูกบดกลาง =====
  ctx.save();
  ctx.rotate(t);

  ctx.fillStyle = "#555";
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // ฟันบดรอบวง
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(a) * 6,
      Math.sin(a) * 6
    );
    ctx.lineTo(
      Math.cos(a) * 9,
      Math.sin(a) * 9
    );
    ctx.stroke();
  }

  ctx.restore();

  // ===== ช่องยิงด้านหน้า (ปล่อยกระสุนรัว) =====
  ctx.fillStyle = "#111";
  ctx.fillRect(14, -3, 4, 6);

  // ===== flash สั้น ๆ แต่ถี่ =====
  if (fire > 0) {
    ctx.fillStyle = "rgba(255,180,80,0.6)";
    ctx.beginPath();
    ctx.arc(20, 0, 4 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
export function drawStormTower(ctx, tower) {
  ctx.save();

  const t = Date.now() * 0.004;
  const pulse = Math.sin(t * 2) * 1.5;

  // ===== ฐานตัวนำพลัง =====
  ctx.fillStyle = "#26263a";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#141420";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.stroke();

  // ===== วงพายุ (หมุน) =====
  ctx.save();
  ctx.rotate(t);

  ctx.strokeStyle = "rgba(180,200,255,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 9 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // ===== แกนพลังหลัก =====
  ctx.fillStyle = "#aaccff";
  ctx.beginPath();
  ctx.arc(0, 0, 4 + pulse * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ===== สายฟ้ากระจายรอบ =====
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#9be9ff";
  ctx.shadowBlur = 10;

  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.moveTo(
      Math.cos(a) * 4,
      Math.sin(a) * 4
    );
    ctx.lineTo(
      Math.cos(a) * (14 + Math.random() * 3),
      Math.sin(a) * (14 + Math.random() * 3)
    );
    ctx.stroke();
  }

  ctx.shadowBlur = 0;

  ctx.restore();
}
export function drawExecutionerTower(ctx, tower) {
  
  // ตัวฐาน
  ctx.fillStyle = "#7a0000";
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  
  // วงเล็ง (anti-air vibe)
  ctx.strokeStyle = "#ffaaaa";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();
  
  // ใบมีดกากบาท (ยิงแรง)
  ctx.strokeStyle = "#300";
  ctx.lineWidth = 3;
  
  ctx.beginPath();
  ctx.moveTo(-9, -9);
  ctx.lineTo(9, 9);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(9, -9);
  ctx.lineTo(-9, 9);
  ctx.stroke();
}
export function drawVanguardTower(ctx, tower) {
  
  // แกนกลาง
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // วงพลัง (รัว)
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();
  
  // ลำกล้องรอบทิศ (ยิงไม่พัก)
  ctx.strokeStyle = "#e0f2fe";
  ctx.lineWidth = 2;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
    ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
    ctx.stroke();
  }
}
export function drawPomegranateStorm(ctx, tower) {
  const t = Date.now() * 0.004;

  ctx.save();

  // ===== ฐานหนัก =====
  ctx.fillStyle = "#2a2a2a";
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 21, 0, Math.PI * 2);
  ctx.stroke();

  // ===== เสาคอยล์ 4 ทิศ =====
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 3;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 10, Math.sin(a) * 10);
    ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
    ctx.stroke();
  }

  // ===== แกนพลัง (core) =====
  ctx.fillStyle = "#8be9ff";
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // aura กระพริบ
  ctx.strokeStyle = `rgba(180,240,255,${0.4 + Math.sin(t * 2) * 0.2})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 11 + Math.sin(t) * 1.5, 0, Math.PI * 2);
  ctx.stroke();

  // ===== สายฟ้าหมุนแตก (signature) =====
  ctx.save();
  ctx.rotate(t);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;

  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);

    let angle = (Math.PI * 2 / 3) * i;
    let len = 14 + Math.sin(t * 3 + i) * 3;

    ctx.lineTo(
      Math.cos(angle) * len,
      Math.sin(angle) * len
    );
    ctx.stroke();
  }

  ctx.restore();

  ctx.restore();
  // ===== วงแหวนพลังลอย =====
  ctx.save();

  // ชั้นใน (แดงอ่อน)
  ctx.rotate(-t * 0.8);
  ctx.strokeStyle = "rgba(255,120,120,0.85)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    15 + Math.sin(t * 2) * 1.2,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
  ctx.save();

  // ชั้นนอก (แดงเข้ม)
  ctx.rotate(t * 0.5);
  ctx.strokeStyle = "rgba(180,40,40,0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    20 + Math.sin(t * 1.5 + 1) * 1.5,
    0,
    Math.PI * 2
  );
  ctx.stroke();

  ctx.restore();
}