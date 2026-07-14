// src/render/towerSkins/index.js
import { playerData } from "../../systems/playerData.js";
import * as base from "./base.js";
import * as evo1 from "./evo1.js";
import * as songkran from "./songkran.js";

function equippedSkin(type) {
  return playerData?.skins?.equipped?.[type] || "default";
}

// เดิม: case "obsidian" เรียก drawNormalObsidian() ที่ไม่มีอยู่จริง → ทำให้เกมพังทันที (AUDIT.md ข้อ 1)
// ที่นี่ยังไม่มีลายจริงให้ ก็ fallback ไปใช้ default แทนไปก่อน กันเกมพัง แต่ยังคงตัวเลือกไว้ในเมนูให้เลือกได้
function drawNormalBySkin(ctx, tower) {
  switch (equippedSkin(tower.type)) {
    case "Songkran": return songkran.drawNormalSongkran(ctx, tower);
    case "obsidian": return base.drawNormalTower(ctx, tower); // TODO: ยังไม่มีลาย obsidian จริง
    default: return base.drawNormalTower(ctx, tower);
  }
}

function drawRapidBySkin(ctx, tower) {
  switch (equippedSkin(tower.type)) {
    case "Songkran": return songkran.drawRapidSongkran(ctx, tower);
    default: return base.drawRapidTower(ctx, tower);
  }
}

function drawDiamondBySkin(ctx, tower) {
  switch (equippedSkin(tower.type)) {
    case "Songkran": return songkran.drawDiamondCannonSongkran(ctx, tower);
    default: return base.drawDiamondCannon(ctx, tower);
  }
}

function drawPomegranateStormBySkin(ctx, tower) {
  switch (equippedSkin(tower.type)) {
    case "Songkran": return songkran.drawPomegranateStormSongkran(ctx, tower);
    default: return base.drawPomegranateStorm(ctx, tower);
  }
}

// รวม dispatch ตาม tower.type ไว้จุดเดียว (เดิมมี switch(this.type) ก็อปปี้อยู่ 2 ที่ใน tower.js กับ UIt.js — AUDIT.md)
export const TOWER_DRAW_REGISTRY = {
  normal: drawNormalBySkin,
  normal_evo1: evo1.drawNormalEvo1,
  rapid: drawRapidBySkin,
  rapid_evo1: evo1.drawRapidEvo1,
  diamond_cannon: drawDiamondBySkin,
  diamond_cannon_evo1: evo1.drawDiamondCannonEvo1,
  soldier: base.drawSoldierTower,
  soldier_evo1: evo1.drawSoldierEvo1,
  sharpshooter1: base.drawSharpshooter1Tower,
  sharpshooter1_evo1: evo1.drawSharpshooter1Evo1,
  gunner: base.drawGunnerTower,
  gunner_evo1: evo1.drawGunnerEvo1,
  lightning: base.drawLightningTower,
  lightning_evo1: evo1.drawLightningEvo1,
  healer: base.drawHealerTower,
  sharpshooter2: base.drawSharpshooter2Tower,
  sharpshooter2_evo1: evo1.drawSharpshooter2Evo1,
  crusher: base.drawCrusherTower,
  storm: base.drawStormTower,
  executioner: base.drawExecutionerTower,
  vanguard: base.drawVanguardTower,
  pomegranate_storm: drawPomegranateStormBySkin,
};

export const SKIN_DATABASE = {
  normal: [
    { id: "default", name: "Default" },
    { id: "Songkran", name: "Songkran" },
    { id: "obsidian", name: "Obsidian", unlock: { bestWave: 10 } },
  ],
  rapid: [
    { id: "default", name: "Default" },
    { id: "Songkran", name: "Songkran", unlock: { totalZombiesKilled: 1 } },
  ],
  diamond_cannon: [
    { id: "default", name: "Default" },
    { id: "Songkran", name: "Songkran", unlock: { level: 1 } },
  ],
  pomegranate_storm: [
    { id: "default", name: "Default" },
    { id: "Songkran", name: "Songkran", unlock: { level: 1 } },
  ],
};
