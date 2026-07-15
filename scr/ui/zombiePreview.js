// scr/ui/zombiePreview.js
// พรีวิวสกินซอมบี้แบบเคลื่อนไหวจริง ใช้ฟังก์ชันวาดชุดเดียวกับในเกม 100%
// (แพทเทิร์นเดียวกับ towerPreview.js)
import { getZombieSkinDrawFn } from "../render/zombieSkins/index.js";

// อ็อบเจ็กต์ซอมบี้จำลองแบบเบา ๆ พอสำหรับให้ฟังก์ชันวาดใช้งานได้ ไม่ต้องพึ่ง state ของเกมจริง
function makeFakeZombie(canvas, type) {
  const isBoss = type.startsWith("boss_");
  return {
    x: canvas.width / 2,
    y: canvas.height / 2 + (isBoss ? 10 : 6),
    hp: 1,
    maxHp: 1,
    isBoss,
    moveType: type.replace("boss_", "").split("_")[0],
    attackMode: type.includes("ranged") ? "ranged" : type.includes("lightning") ? "lightning" : "melee",
    electricTime: 0,
    aimAngle: Math.PI, // หันปืน/ปืนฉีดน้ำเข้าหากล้องพรีวิวให้ดูสวย
    animTime: Math.random() * Math.PI * 2,
  };
}

export function animateZombiePreview(canvas, skinName, type) {
  const ctx = canvas.getContext("2d");
  const drawFn = getZombieSkinDrawFn(skinName, type);
  const zombie = makeFakeZombie(canvas, type);

  if (!drawFn) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  function loop() {
    if (!canvas.isConnected) return; // การ์ดถูกลบไปแล้ว หยุด loop กันรั่ว
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    zombie.animTime += 0.045;
    zombie.hp = zombie.maxHp; // เลือดเต็มเสมอตอนโชว์พรีวิว

    ctx.save();
    drawFn(ctx, zombie);
    ctx.restore();

    requestAnimationFrame(loop);
  }

  loop();
}
