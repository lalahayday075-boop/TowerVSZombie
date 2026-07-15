// backend/routes/gacha.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { GACHA_POOLS, rollGachaPool } from "../data/gachaFormulas.js";
import { asyncHandler } from "../asyncHandler.js";

export const gachaRouter = Router();

gachaRouter.post("/gacha/roll", asyncHandler(async (req, res) => {
  const { poolKey, amount } = req.body || {};
  const pool_ = GACHA_POOLS[poolKey];
  if (!pool_) return res.status(400).json({ error: "ไม่พบตู้กาชานี้" });

  const rollAmount = Number(amount);
  if (![1, 10].includes(rollAmount)) return res.status(400).json({ error: "สุ่มได้แค่ 1 หรือ 10 ครั้งเท่านั้น" });

  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const totalCost = pool_.cost * rollAmount;
  const money = Number(row.money);
  const diamonds = Number(row.diamonds);

  if (pool_.currency === "money" && money < totalCost) return res.status(400).json({ error: "เงินไม่พอ" });
  if (pool_.currency === "diamond" && diamonds < totalCost) return res.status(400).json({ error: "เพชรไม่พอ" });

  const results = rollGachaPool(poolKey, rollAmount);
  const inventory = row.tower_inventory || {};
  results.forEach(type => { inventory[type] = (inventory[type] || 0) + 1; });

  const moneyDelta = pool_.currency === "money" ? -totalCost : 0;
  const diamondDelta = pool_.currency === "diamond" ? -totalCost : 0;

  const updated = await pool.query(
    `UPDATE players SET
       money = money + $1,
       diamonds = diamonds + $2,
       tower_inventory = $3,
       updated_at = now()
     WHERE id = $4 RETURNING *`,
    [moneyDelta, diamondDelta, JSON.stringify(inventory), req.playerId]
  );

  res.json({ results, state: toClientState(updated.rows[0]) });
}));
