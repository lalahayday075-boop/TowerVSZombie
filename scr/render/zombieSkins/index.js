// src/render/zombieSkins/index.js
import { playerData } from "../../systems/playerData.js";
import * as base from "./base.js";
import * as songkran from "./songkran.js";

function zombieKey(z) {
  if (z.isBoss) return z.moveType === "ground" ? "boss_ground_melee" : "boss_air_melee";
  return `${z.moveType}_${z.attackMode}`;
}

const DEFAULT_RENDERERS = {
  ground_melee: base.drawGroundMelee,
  ground_ranged: base.drawGroundRanged,
  ground_lightning: base.drawGroundLightning,
  air_melee: base.drawAirMelee,
  air_ranged: base.drawAirRanged,
  air_lightning: base.drawAirLightning,
  boss_ground_melee: base.drawBossGroundMelee,
  boss_air_melee: base.drawBossAirMelee,
};

// เดิม (AUDIT.md ข้อ 9): drawzombies.js มี stub เปล่าของ Songkran ครบ 5 ประเภท เผื่อไฟล์ Songkran มาทับ
// แต่ไฟล์จริงทับให้แค่ 3 ประเภท อีก 3 ประเภท (ground_lightning, air_ranged, air_lightning) เลย "วาดเปล่า"
// (มองไม่เห็นตัวซอมบี้) ที่นี่ใส่เฉพาะประเภทที่มีลายจริงเท่านั้น ที่เหลือปล่อยให้ fallback ไปใช้ default
// โดยอัตโนมัติ (ปลอดภัยกว่าเดิม 100%)
const SKIN_RENDERERS = {
  default: DEFAULT_RENDERERS,
  Songkran: {
    ground_melee: songkran.drawGroundMeleeSongkran,
    ground_ranged: songkran.drawGroundRangedSongkran,
    air_melee: songkran.drawAirMeleeSongkran,
    // ground_lightning / air_ranged / air_lightning: ยังไม่มีลายจริง -> fallback ไป default
  },
};

export function renderZombie(ctx, z) {
  const type = zombieKey(z);
  const equippedSkin = playerData?.zombieSkin?.equipped?.[type] || "default";
  const skinSet = SKIN_RENDERERS[equippedSkin] || DEFAULT_RENDERERS;
  const drawFn = skinSet[type] || DEFAULT_RENDERERS[type];
  if (drawFn) drawFn(ctx, z);
}
