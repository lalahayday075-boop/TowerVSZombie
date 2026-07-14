// scr/data/gachaPools.js
export const GACHA_POOLS = {
  money_basic: {
    currency: "money",
    cost: 100,
    towers: ["normal", "rapid", "soldier"],
  },
  money_mid: {
    currency: "money",
    cost: 5000,
    towers: [
      "normal_evo1", "rapid_evo1", "soldier_evo1",
      "sharpshooter1", "gunner", "lightning", "sharpshooter2",
    ],
  },
  money_high: {
    currency: "money",
    cost: 500000,
    towers: [
      "sharpshooter1_evo1", "gunner_evo1", "lightning_evo1", "sharpshooter2_evo1",
      "crusher", "storm", "executioner", "vanguard",
    ],
  },
  diamond: {
    currency: "diamond",
    cost: 50,
    towers: ["diamond_cannon", "healer", "pomegranate_storm"],
  },
};
