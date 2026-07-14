//drawtwevo.js
export function drawNormalEvo1(ctx, tower) {
  ctx.save();

  const t = Date.now() / 300;

  // ===== ฐานใหญ่ขึ้น =====
  ctx.fillStyle = "#3a3f46";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1f2328";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();

  // ===== วงพลังหมุน =====
  ctx.save();
  ctx.rotate(t);
  ctx.strokeStyle = "#00cfff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();

  // ===== ตัวป้อมหนา แข็งแรงขึ้น =====
  ctx.fillStyle = "#5c636b";
  ctx.fillRect(-6, -9, 14, 18);

  ctx.strokeStyle = "#2b2f34";
  ctx.lineWidth = 2;
  ctx.strokeRect(-6, -9, 14, 18);

  // ===== core กลางเรืองแสง =====
  const pulse = 0.5 + Math.sin(Date.now() / 200) * 0.5;
  ctx.fillStyle = `rgba(0,220,255,${0.4 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(0, 0, 4 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();

  // ===== ลำกล้องยาว 2 ชั้น =====
  ctx.fillStyle = "#1c1f24";
  ctx.fillRect(8, -3, 14, 6);

  ctx.fillStyle = "#2a2e34";
  ctx.fillRect(20, -2, 6, 4);

  // ===== muzzle flash แรงกว่าเดิม =====
  if (tower.fireAnim > 0) {
    const p = tower.fireAnim / 0.08;

    ctx.fillStyle = `rgba(255,230,120,${p})`;
    ctx.beginPath();
    ctx.arc(26, 0, 4 + Math.random() * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,120,40,${p * 0.7})`;
    ctx.beginPath();
    ctx.arc(28, 0, 6 * p, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
export function drawRapidEvo1(ctx, tower) {
  ctx.save();

  const fire = tower.fireAnim > 0
    ? tower.fireAnim / 0.08
    : 0;

  const recoil = -6 * fire;
  const spin = Date.now() * 0.02 * (0.5 + fire * 2);

  // ===== ฐาน EVO หนักแน่น =====
  ctx.fillStyle = "#2c3138";
  ctx.fillRect(-10, -12, 30, 24);

  ctx.strokeStyle = "#111";
  ctx.lineWidth = 3;
  ctx.strokeRect(-10, -12, 30, 24);

  // ===== core พลังงานหลังป้อม =====
  const pulse = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
  ctx.fillStyle = `rgba(0,255,180,${0.4 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(-6, 0, 5 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();

  // housing บนใหญ่ขึ้น
  ctx.fillStyle = "#4a4f57";
  ctx.fillRect(4, -16, 12, 8);

  // ===== ชุดลำกล้อง 3 ท่อ =====
  ctx.save();

// ขยับ recoil ก่อน
ctx.translate(recoil, 0);

// กำหนดจุดหมุนเป็นโคนลำกล้อง
const pivotX = 18; 
const pivotY = 0;

ctx.translate(pivotX, pivotY);
ctx.rotate(spin);
ctx.translate(-pivotX, -pivotY);

  ctx.fillStyle = "#1a1d22";

  ctx.fillRect(18, -6, 18, 3);
  ctx.fillRect(18, -1.5, 18, 3);
  ctx.fillRect(18, 3, 18, 3);

  // ปลายกระบอก
  ctx.fillStyle = "#000";
  ctx.fillRect(36, -7, 3, 5);
  ctx.fillRect(36, -2, 3, 5);
  ctx.fillRect(36, 3, 3, 5);

  // ===== muzzle flash รุนแรง =====
  if (fire > 0) {
    ctx.fillStyle = `rgba(255,230,120,${fire})`;
    ctx.beginPath();
    ctx.arc(40, 0, 6 + Math.random() * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,120,40,${fire * 0.7})`;
    ctx.beginPath();
    ctx.arc(42, 0, 10 * fire, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // ===== ช่องระบายพลัง EVO =====
  ctx.strokeStyle = "#00ffaa";
  ctx.lineWidth = 1.5;
  for (let i = -8; i <= 8; i += 4) {
    ctx.beginPath();
    ctx.moveTo(2 + recoil * 0.3, i);
    ctx.lineTo(16 + recoil * 0.3, i);
    ctx.stroke();
  }

  // ===== สายกระสุนใหญ่ขึ้น =====
  ctx.strokeStyle = "#d8b870";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 6);
  ctx.lineTo(-18, 12);
  ctx.stroke();

  ctx.restore();
}
export function drawDiamondCannonEvo1(ctx, tower) {
  ctx.save();
  
  const t = Date.now() * 0.001;
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -7 * fire;
  const pulse = Math.sin(t * 3) * 1.2;
  
  // ===== ฐาน EVO =====
  ctx.fillStyle = "#0f141a";
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#1e2a35";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ===== วงพลังชั้นนอก =====
  ctx.save();
  ctx.rotate(t * 0.5);
  ctx.strokeStyle = "rgba(80,200,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 1.7);
  ctx.stroke();
  ctx.restore();

  // ===== โครงปืนหนาขึ้น =====
  ctx.fillStyle = "#1c2228";
  ctx.fillRect(-8, -6, 18, 12);

  ctx.strokeStyle = "#3a4a55";
  ctx.lineWidth = 2;
  ctx.strokeRect(-8, -6, 18, 12);

  // ===== ลำกล้องคริสตัล =====
  ctx.save();
  ctx.translate(recoil, 0);

  const grad = ctx.createLinearGradient(10, 0, 26, 0);
  grad.addColorStop(0, "#4adfff");
  grad.addColorStop(1, "#c8f8ff");
  ctx.fillStyle = grad;

  ctx.fillRect(10, -4, 16, 8);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, -4, 16, 8);

  ctx.restore();

  // ===== แกนเพชร 3 ชั้น =====
  ctx.save();
  ctx.rotate(t * 0.9);

  // ชั้นเรืองแสง
  ctx.fillStyle = "rgba(120,220,255,0.25)";
  ctx.beginPath();
  ctx.moveTo(0, -10 - pulse);
  ctx.lineTo(10 + pulse, 0);
  ctx.lineTo(0, 10 + pulse);
  ctx.lineTo(-10 - pulse, 0);
  ctx.closePath();
  ctx.fill();

  // ชั้นกลาง
  ctx.fillStyle = "#7fe8ff";
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 6);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();

  // core
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -3);
  ctx.lineTo(3, 0);
  ctx.lineTo(0, 3);
  ctx.lineTo(-3, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // ===== เอฟเฟกต์ยิงแบบระเบิดพลัง =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(180,240,255,${fire})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(28, 0, 6 + fire * 8, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(120,220,255,${fire * 0.6})`;
    ctx.beginPath();
    ctx.arc(28, 0, 4 + fire * 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
export function drawSoldierEvo1(ctx, tower) {
  ctx.save();

  // หมุนเหมือนของเดิม
  ctx.rotate(Math.PI * 1.5);

  const t = Date.now() * 0.004;
  const pulse = Math.sin(t) * 1.2;
  const glow = 0.5 + Math.sin(t * 2) * 0.5;

  // ===== ฐาน EVO หนักขึ้น =====
  ctx.fillStyle = "#1f2a22";
  ctx.fillRect(-14, -14, 28, 28);

  ctx.strokeStyle = "#0e140f";
  ctx.lineWidth = 3;
  ctx.strokeRect(-14, -14, 28, 28);

  // ===== เกราะชั้นกลาง =====
  ctx.fillStyle = "#314438";
  ctx.fillRect(-9, -9, 18, 18);

  ctx.strokeStyle = "#1b2a21";
  ctx.lineWidth = 2;
  ctx.strokeRect(-9, -9, 18, 18);

  // ===== แถบพลังด้านบน =====
  ctx.fillStyle = `rgba(120,255,160,${0.4 + glow * 0.4})`;
  ctx.fillRect(-6, -12, 12, 3);

  // ===== Core กลางอก =====
  ctx.fillStyle = `rgba(80,255,140,${0.5 + glow * 0.5})`;
  ctx.beginPath();
  ctx.arc(0, 0, 4 + pulse * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // ===== สัญลักษณ์ทหาร EVO =====
  ctx.strokeStyle = "#e6ffe6";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.lineTo(0, 6 + pulse * 0.2);
  ctx.lineTo(6, -2);
  ctx.stroke();

  // ===== แถบล่างหนักแน่น =====
  ctx.strokeStyle = "#050805";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-10, 11);
  ctx.lineTo(10, 11);
  ctx.stroke();

  ctx.restore();
}
export function drawSharpshooter1Evo1(ctx, tower) {
  ctx.save();
  
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -8 * fire;
  const t = Date.now() * 0.003;
  const glow = 0.5 + Math.sin(t * 2) * 0.5;

  // ===== ฐาน EVO ยาวขึ้น =====
  ctx.fillStyle = "#1f252d";
  ctx.fillRect(-14, -8, 28, 16);

  ctx.strokeStyle = "#0c0f13";
  ctx.lineWidth = 3;
  ctx.strokeRect(-14, -8, 28, 16);

  // ===== ขาตั้งเสริม =====
  ctx.strokeStyle = "#2f3945";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-10, 8);
  ctx.lineTo(-14, 14);
  ctx.moveTo(10, 8);
  ctx.lineTo(14, 14);
  ctx.stroke();

  // ===== เสากล้องสูงขึ้น =====
  ctx.fillStyle = "#2e3742";
  ctx.fillRect(-3, -16, 6, 16);

  // ===== ลำกล้องยาวพิเศษ =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#141820";
  ctx.fillRect(0, -3, 32, 6);

  ctx.fillStyle = "#05070a";
  ctx.fillRect(32, -4, 6, 8);

  ctx.restore();

  // ===== กล้องเล็ง EVO =====
  ctx.fillStyle = "#4f5d70";
  ctx.fillRect(6, -12, 10, 6);

  ctx.fillStyle = `rgba(120,220,255,${0.5 + glow * 0.5})`;
  ctx.beginPath();
  ctx.arc(11, -9, 3, 0, Math.PI * 2);
  ctx.fill();

  // ===== เส้นพลังเล็ง =====
  ctx.strokeStyle = `rgba(120,220,255,${0.3 + glow * 0.3})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(38, 0);
  ctx.lineTo(48, 0);
  ctx.stroke();

  // ===== ยิงแบบเส้นคม =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(220,240,255,${fire})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(38, 0);
    ctx.lineTo(60, 0);
    ctx.stroke();

    ctx.fillStyle = `rgba(180,220,255,${fire * 0.6})`;
    ctx.beginPath();
    ctx.arc(60, 0, 4 + fire * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== anti-air EVO icon =====
  ctx.strokeStyle = "#e0f4ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, -14);
  ctx.lineTo(0, -20);
  ctx.lineTo(8, -14);
  ctx.stroke();

  ctx.restore();
}
export function drawGunnerEvo1(ctx, tower) {
  ctx.save();

  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -6 * fire;
  const t = Date.now() * 0.002;
  const pulse = 0.5 + Math.sin(t * 2) * 0.5;

  // ===== ฐาน EVO ใหญ่ขึ้น =====
  ctx.fillStyle = "#1c1c1c";
  ctx.fillRect(-18, -14, 36, 28);

  ctx.strokeStyle = "#0a0a0a";
  ctx.lineWidth = 4;
  ctx.strokeRect(-18, -14, 36, 28);

  // ===== เกราะชั้นกลาง =====
  ctx.fillStyle = "#2e2e2e";
  ctx.fillRect(-13, -10, 26, 20);

  ctx.strokeStyle = "#141414";
  ctx.lineWidth = 3;
  ctx.strokeRect(-13, -10, 26, 20);

  // ===== แกนพลังหลังป้อม =====
  ctx.fillStyle = `rgba(255,120,40,${0.3 + pulse * 0.4})`;
  ctx.beginPath();
  ctx.arc(-10, 0, 5 + pulse * 2, 0, Math.PI * 2);
  ctx.fill();

  // ===== ลำกล้องยาว หนัก =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#101010";
  ctx.fillRect(14, -6, 18, 12);

  ctx.fillStyle = "#000";
  ctx.fillRect(28, -5, 6, 10);

  ctx.restore();

  // ===== rivet เพิ่มความถึก =====
  ctx.fillStyle = "#555";
  for (let x of [-12, -4, 4, 12]) {
    ctx.beginPath();
    ctx.arc(x, -8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, 8, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== Shockwave ยิงแรง =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(255,200,120,${fire})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(36, 0, 6 + fire * 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,120,40,${fire * 0.6})`;
    ctx.beginPath();
    ctx.arc(36, 0, 3 + fire * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
export function drawLightningEvo1(ctx, tower) {
  ctx.save();

  const time = Date.now() * 0.004;
  const pulse = Math.sin(time * 3) * 1.5;

  // ===================== ฐาน =====================
  ctx.fillStyle = "#1f1f28";
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f0f14";
  ctx.lineWidth = 3;
  ctx.stroke();

  // ===================== วงแหวนหมุน =====================
  ctx.rotate(time * 0.8);
  ctx.strokeStyle = "rgba(120,220,255,0.6)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 1.5);
  ctx.stroke();

  ctx.rotate(-time * 0.8);

  // ===================== แกนพลัง =====================
  ctx.shadowColor = "#7df9ff";
  ctx.shadowBlur = 15;

  const coreRadius = 5 + pulse * 0.4;
  ctx.fillStyle = "#b6f3ff";
  ctx.beginPath();
  ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;



  // ===================== สายฟ้าเสถียร =====================
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#9be9ff";
  ctx.shadowBlur = 12;

  ctx.beginPath();
  let x = 0;
  let y = -10;
  ctx.moveTo(x, y);

  for (let i = 0; i < 6; i++) {
    const offset = Math.sin(time * 10 + i) * 3;
    x = offset;
    y += 5;
    ctx.lineTo(x, y);
  }

  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
}
export function drawSharpshooter2Evo1(ctx, tower) {
  ctx.save();
  
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -10 * fire;
  const t = Date.now() * 0.003;
  const glow = 0.5 + Math.sin(t * 3) * 0.5;

  // ===== ฐาน EVO หนัก =====
  ctx.fillStyle = "#161b22";
  ctx.fillRect(-16, -9, 32, 18);

  ctx.strokeStyle = "#05070a";
  ctx.lineWidth = 3;
  ctx.strokeRect(-16, -9, 32, 18);

  // ===== แผ่นเสริมหน้าใหญ่ขึ้น =====
  ctx.fillStyle = "#2a323e";
  ctx.fillRect(-8, -6, 16, 12);

  // ===== ขาค้ำเสถียร =====
  ctx.strokeStyle = "#2e3742";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, 9);
  ctx.lineTo(-18, 16);
  ctx.moveTo(12, 9);
  ctx.lineTo(18, 16);
  ctx.stroke();

  // ===== เสากล้องเสริม =====
  ctx.fillStyle = "#2f3744";
  ctx.fillRect(-4, -18, 8, 18);

  // ===== ลำกล้อง Rail =====
  ctx.save();
  ctx.translate(recoil, 0);

  ctx.fillStyle = "#0f1318";
  ctx.fillRect(0, -4, 40, 8);

  // รางพลังด้านบน
  ctx.fillStyle = `rgba(120,220,255,${0.4 + glow * 0.4})`;
  ctx.fillRect(6, -6, 28, 2);

  ctx.fillStyle = "#000";
  ctx.fillRect(40, -5, 8, 10);

  ctx.restore();

  // ===== กล้อง EVO ใหญ่ + เรืองแสง =====
  ctx.fillStyle = "#56677f";
  ctx.fillRect(8, -14, 12, 7);

  ctx.fillStyle = `rgba(150,230,255,${0.5 + glow * 0.5})`;
  ctx.beginPath();
  ctx.arc(14, -10.5, 4, 0, Math.PI * 2);
  ctx.fill();

  // ===== เส้นเล็งบาง =====
  ctx.strokeStyle = `rgba(120,220,255,${0.3 + glow * 0.3})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(48, 0);
  ctx.lineTo(60, 0);
  ctx.stroke();

  // ===== ยิงแบบ Rail Beam =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(200,240,255,${fire})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(48, 0);
    ctx.lineTo(80, 0);
    ctx.stroke();

    ctx.fillStyle = `rgba(150,220,255,${fire * 0.6})`;
    ctx.beginPath();
    ctx.arc(80, 0, 6 + fire * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== anti-air icon EVO =====
  ctx.strokeStyle = "#f0fbff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-10, -16);
  ctx.lineTo(0, -24);
  ctx.lineTo(10, -16);
  ctx.stroke();

  ctx.restore();
}