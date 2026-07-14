export function drawNormalSongkran(ctx, tower) {
  ctx.save();
tower.muzzleColor = "#1D7BC5";
  // ===== ฐาน (ขันน้ำสีสด) =====
  ctx.fillStyle = "#ffcc00"; // เหลืองสด
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ff6699"; // ขอบชมพู
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== ตัวป้อม (ถังน้ำฟ้าใส) =====
  ctx.fillStyle = "#6ed3ff";
  ctx.fillRect(-5, -7, 12, 14);

  ctx.strokeStyle = "#2aa9e0";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-5, -7, 12, 14);

  // ลายหยดน้ำ
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(-1, -2, 2, 0, Math.PI * 2);
  ctx.fill();

  // ===== ปืนฉีดน้ำ =====
  ctx.fillStyle = "#ff4444"; // ตัวปืนแดง
  ctx.fillRect(6, -2, 9, 4);

  ctx.fillStyle = "#00bfff"; // ปลายหัวฉีด
  ctx.fillRect(14, -1.5, 3, 3);

  // ===== เอฟเฟกต์สาดน้ำ =====
  if (tower.fireAnim > 0) {
    const p = tower.fireAnim / 0.08;

    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = `rgba(120,200,255,${p})`;
      ctx.beginPath();
      ctx.arc(
        18 + Math.random() * 6,
        (Math.random() - 0.5) * 6,
        1.5 + Math.random() * 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  // ===== วงน้ำกระเซ็นรอบฐาน =====
  ctx.strokeStyle = "rgba(0,200,255,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
export function drawRapidSongkran(ctx, tower) {
  ctx.save();
tower.muzzleColor = "#1D7BC5";
  const fire = tower.fireAnim > 0
    ? tower.fireAnim / 0.08
    : 0;

  const recoil = -5 * fire;
  const spin = fire * 0.25 * Math.sin(Date.now() * 0.08);

  // ===== โครงป้อม (ถังน้ำสีสด) =====
  ctx.fillStyle = "#ffcc00"; // เหลืองขัน
  ctx.fillRect(-7, -10, 24, 20);

  ctx.strokeStyle = "#ff4da6"; // ขอบชมพู
  ctx.lineWidth = 2;
  ctx.strokeRect(-7, -10, 24, 20);

  // housing ด้านบน (ฝาถัง)
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(1, -15, 12, 7);

  // ลายหยดน้ำบนตัวถัง
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(2, -2, 2, 0, Math.PI * 2);
  ctx.fill();

  // ===== ชุดปืนฉีดน้ำคู่ (ขยับจริง) =====
  ctx.save();
  ctx.translate(recoil, 0);
  ctx.rotate(spin);

  // ตัวปืน
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(17, -5, 15, 4);
  ctx.fillRect(17, 2, 15, 4);

  // หัวฉีด
  ctx.fillStyle = "#0099ff";
  ctx.fillRect(30, -6, 4, 5);
  ctx.fillRect(30, 1, 4, 5);

  // ===== สายน้ำพุ่ง =====
  if (fire > 0) {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(120,200,255,${fire})`;
      ctx.beginPath();
      ctx.arc(
        36 + Math.random() * 12,
        (Math.random() - 0.5) * 10,
        2 + Math.random() * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();

  // ===== ช่องระบาย (ลายคลื่นน้ำ) =====
  ctx.strokeStyle = "#00e0ff";
  ctx.lineWidth = 1;
  for (let i = -7; i <= 7; i += 3) {
    ctx.beginPath();
    ctx.moveTo(4 + recoil * 0.5, i);
    ctx.lineTo(15 + recoil * 0.5, i);
    ctx.stroke();
  }

  // ===== สายยางน้ำแทนสายกระสุน =====
  ctx.strokeStyle = "#00bfff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-7, 5);
  ctx.quadraticCurveTo(-16, 12, -20, 6);
  ctx.stroke();

  // ===== วงน้ำกระเซ็นรอบฐาน =====
  ctx.strokeStyle = "rgba(0,200,255,0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}
export function drawDiamondCannonSongkran(ctx, tower) {
  ctx.save();
  
  const t = Date.now() * 0.001;
  const fire = tower.fireAnim > 0 ? tower.fireAnim / 0.08 : 0;
  const recoil = -6 * fire;
  const pulse = Math.sin(t * 3) * 1.2;
  
  // ===== ฐานขันทองสงกรานต์ =====
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = "#ff4da6";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // วงน้ำหมุนรอบฐาน
  ctx.strokeStyle = "rgba(0,200,255,0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 16 + pulse * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  
  // ===== โครงปืน (ถังแรงดันน้ำ) =====
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(-7, -5, 16, 10);
  
  ctx.strokeStyle = "#007acc";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-7, -5, 16, 10);
  
  // ลายหยดน้ำ
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(-1, -1, 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  // ===== ลำกล้องแรงดันสูง =====
  ctx.save();
  ctx.translate(recoil, 0);
  
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(9, -4, 14, 8);
  
  ctx.strokeStyle = "#0099ff";
  ctx.lineWidth = 1;
  ctx.strokeRect(9, -4, 14, 8);
  
  ctx.restore();
  
  // ===== คริสตัลน้ำ (แทนเพชร) =====
  ctx.save();
  ctx.rotate(t * 1.2);
  
  // outer splash glow
  ctx.fillStyle = "rgba(120,220,255,0.4)";
  ctx.beginPath();
  ctx.moveTo(0, -9 - pulse);
  ctx.lineTo(9 + pulse, 0);
  ctx.lineTo(0, 9 + pulse);
  ctx.lineTo(-9 - pulse, 0);
  ctx.closePath();
  ctx.fill();
  
  // inner core น้ำใส
  ctx.fillStyle = "#eaffff";
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(5, 0);
  ctx.lineTo(0, 5);
  ctx.lineTo(-5, 0);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
  
  // ===== เอฟเฟกต์ยิง (คลื่นน้ำกระแทก) =====
  if (fire > 0) {
    ctx.strokeStyle = `rgba(120,200,255,${fire})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(26, 0, 6 + fire * 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // ละอองน้ำหนัก
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `rgba(150,220,255,${fire})`;
      ctx.beginPath();
      ctx.arc(
        28 + Math.random() * 15,
        (Math.random() - 0.5) * 12,
        2 + Math.random() * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  ctx.restore();
}
export function drawPomegranateStormSongkran(ctx, tower) {
  const t = Date.now() * 0.004;

  ctx.save();

  // ===== ฐานขันทองยักษ์ =====
  ctx.fillStyle = "#ffcc00";
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ff4da6";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, 23, 0, Math.PI * 2);
  ctx.stroke();

  // ===== เสาน้ำแรงดัน 4 ทิศ =====
  ctx.strokeStyle = "#00bfff";
  ctx.lineWidth = 4;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12);
    ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24);
    ctx.stroke();
  }

  // ===== แกนพลังน้ำ =====
  ctx.fillStyle = "#8be9ff";
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 2);
  ctx.fill();

  // aura คลื่นน้ำกระเพื่อม
  ctx.strokeStyle = `rgba(120,220,255,${0.5 + Math.sin(t * 2) * 0.25})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 14 + Math.sin(t * 1.5) * 2, 0, Math.PI * 2);
  ctx.stroke();

  // ===== พายุสายน้ำหมุน (แทนสายฟ้า) =====
  ctx.save();
  ctx.rotate(t * 1.5);

  ctx.strokeStyle = "#eaffff";
  ctx.lineWidth = 3;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);

    let angle = (Math.PI * 2 / 4) * i;
    let len = 18 + Math.sin(t * 3 + i) * 4;

    ctx.lineTo(
      Math.cos(angle) * len,
      Math.sin(angle) * len
    );
    ctx.stroke();
  }

  ctx.restore();

  // ===== วงพายุชั้นใน (ฟ้าใส) =====
  ctx.save();
  ctx.rotate(-t * 1.2);
  ctx.strokeStyle = "rgba(120,200,255,0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    18 + Math.sin(t * 2) * 2,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.restore();

  // ===== วงพายุชั้นนอก (คลื่นน้ำหนัก) =====
  ctx.save();
  ctx.rotate(t * 0.8);
  ctx.strokeStyle = "rgba(0,160,255,0.95)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    26 + Math.sin(t * 1.5 + 1) * 3,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.restore();

  // ===== ละอองน้ำกระจายรอบนอก =====
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = "rgba(150,230,255,0.6)";
    ctx.beginPath();
    ctx.arc(
      Math.cos(i + t) * (30 + Math.sin(t + i) * 4),
      Math.sin(i + t) * (30 + Math.cos(t + i) * 4),
      2 + Math.random() * 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  ctx.restore();
}