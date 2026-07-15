-- backend/db/schema.sql
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  pin_salt TEXT NOT NULL,

  money BIGINT NOT NULL DEFAULT 100,
  diamonds BIGINT NOT NULL DEFAULT 0,

  wave INTEGER NOT NULL DEFAULT 1,
  best_wave INTEGER NOT NULL DEFAULT 1,

  level INTEGER NOT NULL DEFAULT 1,
  exp BIGINT NOT NULL DEFAULT 0,

  total_money_earned BIGINT NOT NULL DEFAULT 0,
  total_zombies_killed BIGINT NOT NULL DEFAULT 0,
  total_play_time DOUBLE PRECISION NOT NULL DEFAULT 0,

  tower_inventory JSONB NOT NULL DEFAULT '{"normal": 3}',
  placed_towers JSONB NOT NULL DEFAULT '[]',

  skins JSONB NOT NULL DEFAULT '{"unlocked": {}, "equipped": {}}',
  map_theme JSONB NOT NULL DEFAULT '{"owned": ["default"], "equipped": "default"}',
  zombie_skin JSONB NOT NULL DEFAULT '{"owned": {}, "equipped": {}}',

  -- เวฟที่ server เพิ่งออกให้ผู้เล่นคนนี้ (ยืนยันตอนจบเวฟ กันไคลเอนต์มั่วจำนวน/รางวัล)
  active_wave JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS players_name_lower_idx ON players (lower(name));

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_player_idx ON sessions (player_id);
