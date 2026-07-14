// scr/render/mapThemes.js
import { playerData } from "../systems/playerData.js";
import { canvasRef } from "../core/canvasRef.js";

function drawDefaultTheme(ctx, canvas) {
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawWaterGun(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(0, 0, 30, 12);
  ctx.fillStyle = "#29b6f6";
  ctx.fillRect(25, 4, 20, 4);
  ctx.fillStyle = "#66bb6a";
  ctx.fillRect(8, 10, 10, 15);
  ctx.restore();
}

function drawFlower(ctx, x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  for (let i = 0; i < 5; i++) {
    ctx.rotate((Math.PI * 2) / 5);
    ctx.beginPath();
    ctx.ellipse(0, size / 2, size / 3, size / 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,0,0.3)";
  ctx.fill();
  ctx.restore();
}

function drawSongkranTheme(ctx, canvas) {
  ctx.fillStyle = "#f2efe6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const laneWidth = canvas.width * 0.35;
  const laneX = canvas.width / 2 - laneWidth / 2;
  ctx.fillStyle = "#d7ccc8";
  ctx.fillRect(laneX, 0, laneWidth, canvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 4;
  for (let y = 0; y < canvas.height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, y);
    ctx.lineTo(canvas.width / 2, y + 30);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0,150,255,0.25)";
  for (let i = 0; i < 20; i++) {
    const x = (i * 173) % canvas.width;
    const y = (i * 97) % canvas.height;
    ctx.beginPath();
    ctx.ellipse(x, y, 25, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawWaterGun(ctx, 30, canvas.height - 260);
  drawWaterGun(ctx, canvas.width - 60, 60);

  ctx.globalAlpha = 0.08;
  for (let i = 0; i < 12; i++) {
    const x = (i * 211) % canvas.width;
    const y = (i * 149) % canvas.height;
    drawFlower(ctx, x, y, 50, "#ff4081");
  }
  ctx.globalAlpha = 1;
}

function drawLavaTheme(ctx, canvas) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#3b0f0f");
  grad.addColorStop(1, "#8b1a1a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawForestTheme(ctx, canvas) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, "#1e3d1e");
  grad.addColorStop(1, "#355e3b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export const MAP_THEMES = ["default", "Songkran", "lava", "forest"];

export function drawMapTheme() {
  const { ctx, canvas } = canvasRef;
  const theme = playerData?.mapTheme?.equipped || "default";
  switch (theme) {
    case "Songkran": return drawSongkranTheme(ctx, canvas);
    case "lava": return drawLavaTheme(ctx, canvas);
    case "forest": return drawForestTheme(ctx, canvas);
    default: return drawDefaultTheme(ctx, canvas);
  }
}
