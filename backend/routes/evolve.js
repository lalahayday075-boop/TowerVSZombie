// backend/routes/evolve.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { EVOLVE_TREE } from "../../scr/data/evolveTree.js";
import { asyncHandler } from "../asyncHandler.js";

export const evolveRouter = Router();

evolveRouter.post("/evolve", asyncHandler(async (req, res) => {
  const { type } = req.body || {};
  const data = EVOLVE_TREE[type];
  if (!data) return res.status(400).json({ error: "ป้อมนี้อีโวไม่ได้" });

  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });

  const inventory = row.tower_inventory || {};
  if (!(inventory[type] >= data.need)) {
    return res.status(400).json({ error: `ต้องมี ${type.toUpperCase()} อย่างน้อย ${data.need} ตัว` });
  }

  inventory[type] -= data.need;
  inventory[data.next] = (inventory[data.next] || 0) + 1;

  const updated = await pool.query(
    "UPDATE players SET tower_inventory = $1, updated_at = now() WHERE id = $2 RETURNING *",
    [JSON.stringify(inventory), req.playerId]
  );

  res.json({ next: data.next, state: toClientState(updated.rows[0]) });
}));
