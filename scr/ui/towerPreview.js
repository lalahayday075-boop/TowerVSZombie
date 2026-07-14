// src/ui/towerPreview.js
import { Tower } from "../entities/Tower.js";
import { TOWER_DRAW_REGISTRY } from "../render/towerSkins/index.js";

export function animateTowerPreview(canvas, type) {
  const ctx2 = canvas.getContext("2d");
  const fakeTower = new Tower(canvas.width / 2, canvas.height / 2, type);

  function loop() {
    if (!canvas.isConnected) return; // การ์ดถูกลบไปแล้ว หยุด loop กันรั่ว
    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    const t = Date.now() * 0.002;
    fakeTower.angle = Math.sin(t) * 0.8;

    ctx2.save();
    ctx2.translate(fakeTower.x, fakeTower.y);

    ctx2.fillStyle = "#444";
    ctx2.beginPath();
    ctx2.arc(0, 0, 16, 0, Math.PI * 2);
    ctx2.fill();

    ctx2.rotate(fakeTower.angle);
    const drawFn = TOWER_DRAW_REGISTRY[type];
    if (drawFn) drawFn(ctx2, fakeTower);

    ctx2.restore();
    requestAnimationFrame(loop);
  }

  loop();
}
