// scr/ui/loginUI.js
// หน้าจอล็อกอิน/สมัครสมาชิก — ต้องผ่านตรงนี้ก่อนถึงจะเริ่มเกมได้ (server-authoritative)
import { api, getToken, setToken, clearToken } from "../systems/api.js";

function createLoginPage() {
  if (document.getElementById("loginPage")) return;

  const overlay = document.createElement("div");
  overlay.id = "loginPage";
  overlay.className = "overlay login-overlay";
  overlay.innerHTML = `
    <div class="panel login-panel">
      <h2>Tower vs Zombie</h2>

      <div class="login-tabs">
        <button type="button" class="login-tab-btn active" id="loginTabBtn">เข้าสู่ระบบ</button>
        <button type="button" class="login-tab-btn" id="registerTabBtn">สมัครใหม่</button>
      </div>

      <form id="loginForm" autocomplete="off">
        <label for="loginName">ชื่อผู้เล่น</label>
        <input type="text" id="loginName" maxlength="20" placeholder="ชื่อผู้เล่น (1-20 ตัวอักษร)" autocomplete="username" required />

        <label for="loginPin">PIN</label>
        <input type="password" id="loginPin" inputmode="numeric" pattern="[0-9]*" maxlength="6" placeholder="PIN 4-6 หลัก" autocomplete="current-password" required />

        <div class="login-error" id="loginError"></div>

        <button type="submit" class="btn-primary" id="loginSubmitBtn">เข้าสู่ระบบ</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);

  return overlay;
}

/**
 * ลองล็อกอินอัตโนมัติด้วย token เก่าที่เคยเซฟไว้ (ถ้ามีและยังใช้ได้)
 * คืนค่า state จาก server ถ้าสำเร็จ, คืน null ถ้าไม่มี token หรือ token หมดอายุ
 */
export async function tryAutoLogin() {
  const token = getToken();
  if (!token) return null;

  try {
    const state = await api.getState();
    return state;
  } catch (err) {
    // token หมดอายุ/ไม่ถูกต้อง -> ล้างทิ้งแล้วให้ล็อกอินใหม่
    clearToken();
    return null;
  }
}

/**
 * แสดงหน้าจอล็อกอิน/สมัครสมาชิก แล้ว resolve เมื่อล็อกอินสำเร็จ
 * คืนค่า state ที่ตรงกับรูปแบบของ applyFullGameData()
 */
export function showLoginScreen() {
  return new Promise((resolve) => {
    const overlay = createLoginPage() || document.getElementById("loginPage");
    overlay.style.display = "block";

    const form = document.getElementById("loginForm");
    const nameInput = document.getElementById("loginName");
    const pinInput = document.getElementById("loginPin");
    const errorBox = document.getElementById("loginError");
    const submitBtn = document.getElementById("loginSubmitBtn");
    const loginTabBtn = document.getElementById("loginTabBtn");
    const registerTabBtn = document.getElementById("registerTabBtn");

    let mode = "login"; // "login" | "register"

    function setMode(next) {
      mode = next;
      const isLogin = mode === "login";
      loginTabBtn.classList.toggle("active", isLogin);
      registerTabBtn.classList.toggle("active", !isLogin);
      submitBtn.textContent = isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก";
      pinInput.autocomplete = isLogin ? "current-password" : "new-password";
      errorBox.textContent = "";
    }

    loginTabBtn.addEventListener("click", () => setMode("login"));
    registerTabBtn.addEventListener("click", () => setMode("register"));

    async function handleSubmit(e) {
      e.preventDefault();
      errorBox.textContent = "";

      const name = nameInput.value.trim();
      const pin = pinInput.value.trim();

      if (!name) {
        errorBox.textContent = "กรุณากรอกชื่อผู้เล่น";
        return;
      }
      if (!/^\d{4,6}$/.test(pin)) {
        errorBox.textContent = "PIN ต้องเป็นตัวเลข 4-6 หลัก";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "กำลังโหลด...";

      try {
        const result = mode === "login"
          ? await api.login(name, pin)
          : await api.register(name, pin);

        setToken(result.token);
        form.removeEventListener("submit", handleSubmit);
        overlay.style.display = "none";
        resolve(result.state);
      } catch (err) {
        errorBox.textContent = err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
        submitBtn.disabled = false;
        submitBtn.textContent = mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก";
      }
    }

    form.addEventListener("submit", handleSubmit);
  });
}
