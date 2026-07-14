// server.js
// เกมนี้เป็น client-side ล้วน (เซฟลง localStorage ในเบราว์เซอร์) ไม่มี backend logic จริง
// ใช้ Node "http" module เปล่าๆ เสิร์ฟไฟล์ static เท่านั้น ไม่ต้องพึ่ง dependency ภายนอกเลย
// (กันปัญหา npm install ล้มเหลวตอน deploy)
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  let filePath = path.join(ROOT, urlPath);

  // กันโดน path traversal ออกนอกโฟลเดอร์โปรเจกต์
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // ไม่เจอไฟล์ -> fallback ไปหน้าเกมหลัก (เผื่อ path แปลกๆ)
      fs.readFile(path.join(ROOT, "index.html"), (err2, indexData) => {
        if (err2) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`TVZ server running on port ${PORT}`);
});
