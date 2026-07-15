// scr/ui/rarityUtils.js
// ระบบเรตติ้งความหายากกลาง ใช้ร่วมกันระหว่างหน้ากาชา/อีโว
// หมายเหตุ: ค่า "rarity" ในข้อมูลป้อมคือ "น้ำหนักสุ่ม" (ยิ่งเลขสูงยิ่งเจอบ่อย)
// ฟังก์ชันนี้แปลงน้ำหนักกลับเป็น "ระดับความหายาก" (ยิ่งเลขน้อย ยิ่งหายาก) เพื่อโชว์ผู้เล่น
export function getRarityTier(rarity) {
  const r = rarity || 1;
  if (r >= 35) return { key: "common", label: "ธรรมดา", stars: 1, color: "#9aa0aa", glow: "rgba(154,160,170,.4)" };
  if (r >= 18) return { key: "uncommon", label: "ไม่ธรรมดา", stars: 2, color: "#3cff9d", glow: "rgba(60,255,157,.4)" };
  if (r >= 10) return { key: "rare", label: "หายาก", stars: 3, color: "#4aa3ff", glow: "rgba(74,163,255,.45)" };
  if (r >= 5) return { key: "epic", label: "เอปิก", stars: 4, color: "#c084ff", glow: "rgba(192,132,255,.5)" };
  return { key: "legendary", label: "เลเจนดารี", stars: 5, color: "#ffcf4d", glow: "rgba(255,207,77,.6)" };
}

export function starString(n) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export function dropChance(type, towerList, towerTypes) {
  const total = towerList.reduce((sum, t) => sum + (towerTypes[t].rarity || 1), 0);
  return ((towerTypes[type].rarity || 1) / total) * 100;
}
