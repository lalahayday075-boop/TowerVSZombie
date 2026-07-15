// backend/playerState.js
import { pool } from "./db/pool.js";

export async function getPlayerRow(id) {
  const result = await pool.query("SELECT * FROM players WHERE id = $1", [id]);
  return result.rows[0] || null;
}

// ล็อกแถวผู้เล่นด้วย transaction (SELECT ... FOR UPDATE) ก่อนอ่าน+แก้ active_wave
// กันเคส /wave/kill กับ /wave/complete ยิงมาใกล้ๆ กัน (เช่นซอมบี้ตัวสุดท้ายของเวฟ) แล้วแย่งกันอ่าน/เขียน
// active_wave แบบ read-modify-write จนตัวหนึ่งเขียนทับอีกตัว (เงินไม่หาย เพราะ money = money + $1 เป็น atomic
// อยู่แล้ว แต่ active_wave.killed count กับสถานะ NULL/ไม่ NULL อาจ resurrect หรือหลุด sync กันได้ถ้าไม่ล็อก)
export async function withPlayerLock(id, fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT * FROM players WHERE id = $1 FOR UPDATE", [id]);
    const row = result.rows[0] || null;
    const output = await fn(client, row);
    await client.query("COMMIT");
    return output;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// รูปแบบนี้ตรงกับ src/systems/saveSystem.js -> applyFullGameData() ฝั่ง client เป๊ะๆ
// เพื่อให้ client เอา response จาก /api/state ไปยัดใส่ applyFullGameData ได้ตรงๆ โดยไม่ต้องแปลงอะไรเพิ่ม
export function toClientState(row) {
  return {
    money: Number(row.money),
    diamonds: Number(row.diamonds),
    wave: row.wave,
    totalPlayTime: row.total_play_time,
    totalZombiesKilled: Number(row.total_zombies_killed),
    towerInventory: row.tower_inventory,
    placedTowers: row.placed_towers,
    playerData: {
      name: row.name,
      level: row.level,
      exp: Number(row.exp),
      totalMoneyEarned: Number(row.total_money_earned),
      bestWave: row.best_wave,
      skins: row.skins,
      mapTheme: row.map_theme,
      zombieSkin: row.zombie_skin,
      settings: { sound: true, gameSpeed: 1 },
    },
  };
}
