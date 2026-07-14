// src/core/canvasRef.js
export const canvasRef = {
  canvas: null,
  ctx: null,
};

export function setCanvas(canvas) {
  canvasRef.canvas = canvas;
  canvasRef.ctx = canvas.getContext("2d");
}
