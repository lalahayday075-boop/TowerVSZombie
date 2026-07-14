# Tower vs Zombie

เกม Tower Defense vs Zombie เขียนใหม่ทั้งหมด (ES modules) — ดูรายละเอียดบั๊กที่แก้ไปได้ใน `AUDIT.md`

เกมเป็น **client-side ล้วน** (เซฟข้อมูลผู้เล่นลง `localStorage` ในเบราว์เซอร์) ตัว `server.js` มีหน้าที่แค่
เสิร์ฟไฟล์ static ให้ Railway รันเป็น service ได้เท่านั้น ไม่มี dependency ภายนอกเลย (ใช้ Node built-in
module ทั้งหมด) รันได้ทันทีโดยไม่ต้อง `npm install`

## รันเล่นในเครื่องตัวเอง

```bash
npm start
# หรือ
node server.js
```

แล้วเปิด http://localhost:3000

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
server.js           static file server (Node http ล้วน ไม่มี dependency)
assets/*.css         สไตล์ (คัดลอกจากของเดิม ไม่ได้แก้)
src/data/            ค่าคงที่: ป้อม, เวฟ, กาชา, evolve tree
src/core/            state กลาง, game loop, canvas ref
src/entities/        Tower, Zombie, Bullet, กระสุนซอมบี้
src/systems/         wave/gacha/evolve/save/unlock/dev tools ฯลฯ
src/ui/              popup ต่างๆ, HUD, input handling
src/render/          ลายป้อม/ซอมบี้/ธีมแมพ (แยกตามสกิน)
AUDIT.md             รายงานบั๊กที่เจอจากโค้ดเดิมและวิธีแก้
```
