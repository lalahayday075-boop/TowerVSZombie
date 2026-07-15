// backend/auth.js
import crypto from "crypto";
import { pool } from "./db/pool.js";

export function hashPin(pin, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(pin, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPin(pin, salt, expectedHash) {
  const { hash } = hashPin(pin, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createSession(playerId) {
  const token = crypto.randomBytes(32).toString("hex");
  await pool.query("INSERT INTO sessions (token, player_id) VALUES ($1, $2)", [token, playerId]);
  return token;
}

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "ไม่ได้ล็อกอิน" });

  const result = await pool.query(
    "SELECT player_id FROM sessions WHERE token = $1",
    [token]
  );
  if (result.rows.length === 0) return res.status(401).json({ error: "session หมดอายุ กรุณาล็อกอินใหม่" });

  req.playerId = result.rows[0].player_id;
  next();
}
