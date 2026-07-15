// backend/routes/state.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { getPlayerRow, toClientState } from "../playerState.js";
import { asyncHandler } from "../asyncHandler.js";
import { refreshAndPersistUnlocks } from "../unlocks.js";

export const stateRouter = Router();

stateRouter.get("/state", asyncHandler(async (req, res) => {
  const row = await getPlayerRow(req.playerId);
  if (!row) return res.status(404).json({ error: "ไม่พบผู้เล่น" });
  const refreshed = await refreshAndPersistUnlocks(row);
  res.json(toClientState(refreshed));
}));

// client เรียกเป็นระยะ (เช่นทุก 5 วิ เหมือน autosave เดิม) เพื่อสะสมเวลาเล่น
// รับแค่ "จำนวนวินาทีที่ผ่านไปจริงรอบนี้" ไม่รับค่าสะสมรวมจาก client (กันมั่วเวลาเล่น)
stateRouter.post("/state/heartbeat", asyncHandler(async (req, res) => {
  const { deltaSeconds } = req.body || {};
  const delta = Math.max(0, Math.min(30, Number(deltaSeconds) || 0)); // ครอปกันส่งมั่ว
  await pool.query(
    "UPDATE players SET total_play_time = total_play_time + $1, updated_at = now() WHERE id = $2",
    [delta, req.playerId]
  );
  res.json({ ok: true });
}));
