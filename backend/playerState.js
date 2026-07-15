// backend/playerState.js
import { pool } from "./db/pool.js";

export async function getPlayerRow(id) {
  const result = await pool.query("SELECT * FROM players WHERE id = $1", [id]);
  return result.rows[0] || null;
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
