// backend/server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { initDb } from "./db/init.js";
import { requireAuth } from "./auth.js";

import { authRouter } from "./routes/auth.js";
import { stateRouter } from "./routes/state.js";
import { waveRouter } from "./routes/wave.js";
import { towerRouter } from "./routes/tower.js";
import { gachaRouter } from "./routes/gacha.js";
import { evolveRouter } from "./routes/evolve.js";
import { skinRouter } from "./routes/skin.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// เส้นทางที่ไม่ต้องล็อกอิน
app.use("/api", authRouter);

// เส้นทางที่ต้องล็อกอิน (ต้องมี Authorization: Bearer <token>)
app.use("/api", requireAuth, stateRouter);
app.use("/api", requireAuth, waveRouter);
app.use("/api", requireAuth, towerRouter);
app.use("/api", requireAuth, gachaRouter);
app.use("/api", requireAuth, evolveRouter);
app.use("/api", requireAuth, skinRouter);

// ไฟล์หน้าเกม (client-side) เสิร์ฟจาก root โปรเจกต์
app.use(express.static(ROOT, { extensions: ["html"] }));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "ไม่พบ endpoint นี้" });
  res.sendFile(path.join(ROOT, "index.html"));
});

// จับ error ที่หลุดมาจาก route (เช่น query พังกลางทาง) กันเซิร์ฟเวอร์ล้มทั้งตัว
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์" });
});

async function start() {
  try {
    await initDb();
  } catch (err) {
    console.error("[db] เชื่อมต่อฐานข้อมูลไม่สำเร็จ:", err.message);
    console.error("ตรวจสอบว่าเพิ่ม Postgres plugin ใน Railway project แล้วหรือยัง (ตัวแปร DATABASE_URL ต้องถูกตั้งอัตโนมัติ)");
  }
  app.listen(PORT, () => console.log(`TVZ server running on port ${PORT}`));
}

start();
