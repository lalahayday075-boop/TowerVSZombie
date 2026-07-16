// src/systems/devState.js
// แยกธงของโหมด dev ออกมาเป็น module เดี่ยว เพื่อให้ทุก entity (Tower/Zombie/Bullet)
// import มาเช็คได้จุดเดียว ป้องกันบั๊กแบบเดิมที่ DEV_TOWER_IMMORTAL ถูกเช็คแค่บางที่ (AUDIT.md ข้อ 5)

// เดิม DEV_MODE = true ถูกปล่อยติดไปด้วย (AUDIT.md ข้อ 3) → ปรับ default เป็น false
// เปิดได้จากคอนโซล/ตั้งค่าตอน dev เอง ไม่ต้องแก้ไฟล์นี้
export const devState = {
  DEV_MODE: false,
  DEV_PAUSE: false,
  DEV_TOWER_IMMORTAL: false,
  GAME_SPEED: 1,
};
