// src/systems/api.js
const TOKEN_KEY = "tvz_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try { data = await res.json(); } catch { /* ไม่มี body ก็ไม่เป็นไร */ }

  if (!res.ok) {
    const error = new Error(data?.error || `เรียก ${path} ไม่สำเร็จ (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return data;
}

export const api = {
  register: (name, pin) => request("POST", "/register", { name, pin }),
  login: (name, pin) => request("POST", "/login", { name, pin }),

  getState: () => request("GET", "/state"),
  heartbeat: (deltaSeconds) => request("POST", "/state/heartbeat", { deltaSeconds }),

  startWave: () => request("POST", "/wave/start"),
  completeWave: () => request("POST", "/wave/complete"),
  failWave: () => request("POST", "/wave/fail"),

  placeTower: (type, slotIndex) => request("POST", "/tower/place", { type, slotIndex }),
  upgradeTower: (slotIndex) => request("POST", "/tower/upgrade", { slotIndex }),
  sellTower: (slotIndex) => request("POST", "/tower/sell", { slotIndex }),

  rollGacha: (poolKey, amount) => request("POST", "/gacha/roll", { poolKey, amount }),
  evolve: (type) => request("POST", "/evolve", { type }),

  equipTowerSkin: (type, skinId) => request("POST", "/skin/equip", { type, skinId }),
  equipMapTheme: (theme) => request("POST", "/theme/equip", { theme }),
  equipZombieSkin: (type, skinName) => request("POST", "/zombieskin/equip", { type, skinName }),
};
