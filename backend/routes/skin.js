// backend/routes/skin.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { SKIN_DATABASE } from "../../src/render/towerSkins/index.js";
import { ZOMBIE_TYPES } from "../../src/systems/unlockSystem.js";
import { asyncHandler } from "../asyncHandler.js";
import { computeUnlockedTowerSkins, computeUnlockedMapThemes, computeUnlockedZombieSkins } from "../unlocks.js";

export const skinRouter = Router();

skinRouter.post("/skin/equip", asyncHandler(async (req, res) => {
  const { type, skinId } = req.body || {};
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });
  if (!SKIN_DATABASE[type]) return res.status(400).json({ error: "ไม่รู้จักป้อมชนิดนี้" });

  const unlocked = computeUnlockedTowerSkins(row);
  if (!unlocked[type]?.includes(skinId)) return res.status(400).json({ error: "ยังไม่ปลดล็อกสกินนี้" });

  const skins = row.skins || { unlocked: {}, equipped: {} };
  skins.unlocked = unlocked;
  skins.equipped = { ...(skins.equipped || {}), [type]: skinId };

  const updated = await pool.query(
    "UPDATE players SET skins = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [JSON.stringify(skins), req.playerId]
  );
  res.json({ state: toClientState(updated.rows[0]) });
}));

skinRouter.post("/theme/equip", asyncHandler(async (req, res) => {
  const { theme } = req.body || {};
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const owned = computeUnlockedMapThemes(row);
  if (!owned.includes(theme)) return res.status(400).json({ error: "ยังไม่ปลดล็อกธีมนี้" });

  const mapTheme = { owned, equipped: theme };
  const updated = await pool.query(
    "UPDATE players SET map_theme = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [JSON.stringify(mapTheme), req.playerId]
  );
  res.json({ state: toClientState(updated.rows[0]) });
}));

skinRouter.post("/zombieskin/equip", asyncHandler(async (req, res) => {
  const { type, skinName } = req.body || {};
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });
  if (!ZOMBIE_TYPES.includes(type)) return res.status(400).json({ error: "ไม่รู้จักซอมบี้ชนิดนี้" });

  const owned = computeUnlockedZombieSkins(row);
  if (!owned[type]?.includes(skinName)) return res.status(400).json({ error: "ยังไม่ปลดล็อกสกินนี้" });

  const zombieSkin = row.zombie_skin || { owned: {}, equipped: {} };
  zombieSkin.owned = owned;
  zombieSkin.equipped = { ...(zombieSkin.equipped || {}), [type]: skinName };

  const updated = await pool.query(
    "UPDATE players SET zombie_skin = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [JSON.stringify(zombieSkin), req.playerId]
  );
  res.json({ state: toClientState(updated.rows[0]) });
}));
