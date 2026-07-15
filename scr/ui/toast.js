// scr/ui/toast.js
// Toast แจ้งเตือนสั้นๆ กลางบน ใช้แทน alert() ที่บล็อกหน้าจอ — ใช้ร่วมกันได้ทุกระบบ
export function showToast(text, color = "#ffcf4d") {
  const toast = document.createElement("div");
  toast.textContent = text;
  toast.className = "app-toast";
  toast.style.setProperty("--toast-color", color);
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("app-toast-in"));
  setTimeout(() => toast.classList.remove("app-toast-in"), 1700);
  setTimeout(() => toast.remove(), 2000);
}
