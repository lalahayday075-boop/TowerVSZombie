// backend/routes/auth.js
import { Router } from "express";
import { pool } from "../db/pool.js";
import { hashPin, verifyPin, createSession } from "../auth.js";
import { toClientState } from "../playerState.js";
import { asyncHandler } from "../asyncHandler.js";

export const authRouter = Router();

function validateNamePin(name, pin) {
  if (typeof name !== "string" || name.trim().length < 1 || name.trim().length > 20) {
    return "ชื่อต้องยาว 1-20 ตัวอักษร";
  }
  if (typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
    return "PIN ต้องเป็นตัวเลข 4-6 หลัก";
  }
  return null;
}

authRouter.post("/register", asyncHandler(async (req, res) => {
  const { name, pin } = req.body || {};
  const error = validateNamePin(name, pin);
  if (error) return res.status(400).json({ error });

  const trimmedName = name.trim();

  const existing = await pool.query("SELECT id FROM players WHERE lower(name) = lower($1)", [trimmedName]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: "ชื่อนี้มีคนใช้แล้ว ลองชื่ออื่นหรือกดล็อกอินถ้าเป็นของคุณ" });
  }

  const { hash, salt } = hashPin(pin);
  const insert = await pool.query(
    `INSERT INTO players (name, pin_hash, pin_salt) VALUES ($1, $2, $3) RETURNING *`,
    [trimmedName, hash, salt]
  );
  const row = insert.rows[0];
  const token = await createSession(row.id);

  res.json({ token, state: toClientState(row) });
}));

authRouter.post("/login", asyncHandler(async (req, res) => {
  const { name, pin } = req.body || {};
  const error = validateNamePin(name, pin);
  if (error) return res.status(400).json({ error });

  const result = await pool.query("SELECT * FROM players WHERE lower(name) = lower($1)", [name.trim()]);
  const row = result.rows[0];
  if (!row || !verifyPin(pin, row.pin_salt, row.pin_hash)) {
    return res.status(401).json({ error: "ชื่อหรือ PIN ไม่ถูกต้อง" });
  }

  const token = await createSession(row.id);
  res.json({ token, state: toClientState(row) });
}));
