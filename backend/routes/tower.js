// backend/routes/tower.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { TOWER_TYPES, getMaxLevel, getUpgradeCost } from "../data/towerFormulas.js";
import { asyncHandler } from "../asyncHandler.js";

export const towerRouter = Router();

towerRouter.post("/tower/place", asyncHandler(async (req, res) => {
  const { type, slotIndex } = req.body || {};
  if (!TOWER_TYPES[type]) return res.status(400).json({ error: "ไม่รู้จักป้อมชนิดนี้" });
  if (typeof slotIndex !== "number") return res.status(400).json({ error: "slotIndex ไม่ถูกต้อง" });

  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const inventory = row.tower_inventory || {};
  if (!(inventory[type] > 0)) return res.status(400).json({ error: "ไม่มีป้อมชนิดนี้ในคลัง" });

  const placedTowers = row.placed_towers || [];
  if (placedTowers.some(t => t.slotIndex === slotIndex)) {
    return res.status(400).json({ error: "ช่องนี้มีป้อมอยู่แล้ว" });
  }

  inventory[type] -= 1;
  placedTowers.push({ slotIndex, type, level: 1, totalInvest: 0 });

  const updated = await pool.query(
    "UPDATE players SET tower_inventory = $1, placed_towers = $2, updated_at = now() WHERE id = $3 RETURNING *",
    [JSON.stringify(inventory), JSON.stringify(placedTowers), req.playerId]
  );

  res.json({ state: toClientState(updated.rows[0]) });
}));

towerRouter.post("/tower/upgrade", asyncHandler(async (req, res) => {
  const { slotIndex } = req.body || {};
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const placedTowers = row.placed_towers || [];
  const tower = placedTowers.find(t => t.slotIndex === slotIndex);
  if (!tower) return res.status(400).json({ error: "ไม่พบป้อมในช่องนี้" });

  const maxLevel = getMaxLevel(tower.type);
  if (tower.level >= maxLevel) return res.status(400).json({ error: "เลเวลสูงสุดแล้ว" });

  const costData = getUpgradeCost(tower.type, tower.level);
  const money = Number(row.money);
  const diamonds = Number(row.diamonds);

  if (costData.currency === "money" && money < costData.cost) {
    return res.status(400).json({ error: "เงินไม่พอ" });
  }
  if (costData.currency === "diamond" && diamonds < costData.cost) {
    return res.status(400).json({ error: "เพชรไม่พอ" });
  }

  tower.level += 1;
  tower.totalInvest += costData.cost;

  const moneyDelta = costData.currency === "money" ? -costData.cost : 0;
  const diamondDelta = costData.currency === "diamond" ? -costData.cost : 0;

  const updated = await pool.query(
    `UPDATE players SET
       money = money + $1,
       diamonds = diamonds + $2,
       placed_towers = $3,
       updated_at = now()
     WHERE id = $4 RETURNING *`,
    [moneyDelta, diamondDelta, JSON.stringify(placedTowers), req.playerId]
  );

  res.json({ state: toClientState(updated.rows[0]) });
}));

towerRouter.post("/tower/sell", asyncHandler(async (req, res) => {
  const { slotIndex } = req.body || {};
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const placedTowers = row.placed_towers || [];
  const idx = placedTowers.findIndex(t => t.slotIndex === slotIndex);
  if (idx === -1) return res.status(400).json({ error: "ไม่พบป้อมในช่องนี้" });

  const [tower] = placedTowers.splice(idx, 1);
  const inventory = row.tower_inventory || {};
  inventory[tower.type] = (inventory[tower.type] || 0) + 1;

  const updated = await pool.query(
    "UPDATE players SET tower_inventory = $1, placed_towers = $2, updated_at = now() WHERE id = $3 RETURNING *",
    [JSON.stringify(inventory), JSON.stringify(placedTowers), req.playerId]
  );

  res.json({ state: toClientState(updated.rows[0]) });
}));
