# Tower vs Zombie

เกม Tower Defense vs Zombie เขียนใหม่ทั้งหมด (ES modules) — ดูรายละเอียดบั๊กที่แก้ไปได้ใน `AUDIT.md`

เกมเป็นแบบ **server-authoritative**: ผู้เล่นต้องล็อกอิน (ชื่อ + PIN) ก่อนเล่น ข้อมูล (เงิน/เพชร/ป้อม/สกิน)
เก็บอยู่บน server (Postgres) ไม่ใช่ localStorage ฝั่งเดียวอีกต่อไป ตัว `backend/server.js` เป็น Express
server ที่เสิร์ฟทั้ง REST API (`/api/*`) และไฟล์หน้าเกม (static) จากโฟลเดอร์เดียวกัน

## รันเล่นในเครื่องตัวเอง

ต้องมี Postgres ก่อน (ตั้งค่าตัวแปรแวดล้อม `DATABASE_URL` ให้ชี้ไปที่ database ที่จะใช้ เช่น
`postgres://user:pass@localhost:5432/tvz`) แล้วรัน:

```bash
npm install
npm start
```

แล้วเปิด http://localhost:3000 (ครั้งแรกที่รันจะสร้างตาราง schema ให้อัตโนมัติ)

## ขึ้น GitHub

```bash
cd tvz-rewrite          # โฟลเดอร์นี้
git init
git add .
git commit -m "Rewrite: ES modules architecture, fix bugs (see AUDIT.md)"
git branch -M main
git remote add origin https://github.com/<username>/<repo-name>.git
git push -u origin main
```

(สร้าง repo เปล่าบน GitHub ก่อนแล้วค่อย push ตามขั้นตอนบน หรือใช้ GitHub CLI: `gh repo create`)

## Deploy ขึ้น Railway

**วิธีที่ง่ายที่สุด — เชื่อม GitHub repo ตรงๆ**
1. เข้า https://railway.app → New Project → **Deploy from GitHub repo**
2. เลือก repo ที่เพิ่ง push ไป
3. Railway จะตรวจเจอ `package.json` + `railway.json` แล้ว build/deploy ให้อัตโนมัติ (Nixpacks)
4. รอ build เสร็จ แล้วกด **Generate Domain** ในแท็บ Settings เพื่อได้ลิงก์สาธารณะ

**ถ้าอยาก deploy จากเครื่องตัวเองโดยไม่ผ่าน GitHub ก็ได้** (ใช้ Railway CLI):
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## อัพเดตเกมทีหลัง

แก้โค้ด → commit → push ขึ้น GitHub → Railway จะ deploy เวอร์ชันใหม่ให้อัตโนมัติ (ถ้าเชื่อมแบบ GitHub repo ไว้)

## โครงสร้างโปรเจกต์

```
index.html          หน้าเกมหลัก
backend/            Express server: REST API (/api/*) + เสิร์ฟไฟล์หน้าเกม + Postgres
assets/*.css         สไตล์ (คัดลอกจากของเดิม ไม่ได้แก้)
scr/data/            ค่าคงที่: ป้อม, เวฟ, กาชา, evolve tree
scr/core/            state กลาง, game loop, canvas ref
scr/entities/        Tower, Zombie, Bullet, กระสุนซอมบี้
scr/systems/         wave/gacha/evolve/save/unlock/dev tools ฯลฯ
scr/ui/              popup ต่างๆ, HUD, input handling
scr/render/          ลายป้อม/ซอมบี้/ธีมแมพ (แยกตามสกิน)
AUDIT.md             รายงานบั๊กที่เจอจากโค้ดเดิมและวิธีแก้
```
