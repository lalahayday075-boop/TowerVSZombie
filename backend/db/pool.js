// backend/db/pool.js
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "[db] ไม่พบ DATABASE_URL — ต้องเพิ่ม Postgres plugin ใน Railway project แล้วตัวแปรนี้จะถูกตั้งให้อัตโนมัติ"
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Railway Postgres ต้องใช้ SSL แต่ certificate เป็น self-signed ภายใน เลยต้องปิด reject
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});
