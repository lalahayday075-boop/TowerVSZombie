// scr/core/canvasResize.js
// ปรับขนาดพื้นที่แสดงผลของ canvas ให้พอดีกับหน้าจอเสมอ (responsive)
// หมายเหตุ: ไม่ได้แก้ความละเอียดจริงของ canvas (width/height attribute ยังคง 400x775
// เพื่อไม่ให้ตำแหน่ง/พิกัดของเกม (ป้อม, ซอมบี้ ฯลฯ) เพี้ยน) แค่ปรับขนาดที่ "แสดงผล" ทาง CSS เท่านั้น

(function () {
  function resizeStage() {
    const stage = document.getElementById("gameStage");
    if (!stage) return;

    const viewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    const dock = document.getElementById("bottomDock");
    const dockHeight = dock ? dock.getBoundingClientRect().height : 0;

    // เผื่อระยะขอบล่างเล็กน้อยกันชิดขอบจอเกินไป + พื้นที่แถบเมนูล่างแบบ fixed
    const bottomMargin = 8 + dockHeight;
    const availableHeight = viewportHeight - stage.getBoundingClientRect().top - bottomMargin;

    stage.style.height = Math.max(200, availableHeight) + "px";
  }

  window.addEventListener("resize", resizeStage);
  window.addEventListener("orientationchange", () => setTimeout(resizeStage, 50));
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", resizeStage);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", resizeStage);
  } else {
    resizeStage();
  }

  // เผื่อ layout ด้านบน (ui, ปุ่มต่างๆ) โหลด/เปลี่ยนขนาดหลัง DOM ready
  window.addEventListener("load", resizeStage);
})();
