// scr/core/viewportLock.js
// ล็อกหน้าเว็บให้พฤติกรรมเหมือนแอป: ห้ามซูม, ห้ามเลื่อนจอ, ห้ามลากเลือกข้อความ,
// ห้ามเมนู "คัดลอก/แชร์" ตอนกดค้าง — ยกเว้นช่อง input จริงๆ (เช่น ชื่อผู้เล่น) ที่ยังพิมพ์/เลือกได้ปกติ

(function () {
  function isEditable(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
  }

  // ห้ามซูมด้วยสองนิ้ว (pinch) บน iOS Safari
  document.addEventListener("gesturestart", e => e.preventDefault());
  document.addEventListener("gesturechange", e => e.preventDefault());
  document.addEventListener("gestureend", e => e.preventDefault());

  // ห้ามซูมด้วย ctrl+scroll wheel (เผื่อทดสอบบนเดสก์ท็อป)
  document.addEventListener(
    "wheel",
    e => {
      if (e.ctrlKey) e.preventDefault();
    },
    { passive: false }
  );

  // ห้ามเมนูคลิกขวา / กดค้างแล้วขึ้นเมนูคัดลอก-แชร์ ยกเว้นใน input
  document.addEventListener("contextmenu", e => {
    if (!isEditable(e.target)) e.preventDefault();
  });

  // ห้ามลากเลือกข้อความ/รูปภาพ ยกเว้นใน input
  document.addEventListener("selectstart", e => {
    if (!isEditable(e.target)) e.preventDefault();
  });

  // ห้ามลากรูป/องค์ประกอบ (เช่น การลาก canvas)
  document.addEventListener("dragstart", e => e.preventDefault());

  // เลือกได้ว่า element ไหน "ตั้งใจให้เลื่อน (scroll) ได้" เช่น รายการในป๊อปอัพต่างๆ
  const SCROLLABLE_SELECTOR =
    "#towerInspectPopup, .tower-list, .panel, .evolve-list, .gacha-box, " +
    ".zombie-scroll-area, .tower-skin-list, #mapThemeList, .gacha-info-box";

  function isInsideScrollable(el) {
    return !!(el && el.closest && el.closest(SCROLLABLE_SELECTOR));
  }

  // กันลาก pull-to-refresh / bounce scroll ของทั้งหน้า (ที่ทำให้ Safari ยุบ/โชว์แถบ URL
  // แล้วเห็นพื้นที่ขาวโผล่ด้านบน-ล่าง) แต่ยังปล่อยให้เลื่อนในกล่องที่ตั้งใจให้เลื่อนได้ตามปกติ
  document.addEventListener(
    "touchmove",
    e => {
      if (e.touches.length > 1) {
        e.preventDefault(); // กันซูมด้วยสองนิ้วผ่านการลาก
        return;
      }
      if (!isInsideScrollable(e.target)) {
        e.preventDefault();
      }
    },
    { passive: false }
  );
})();
