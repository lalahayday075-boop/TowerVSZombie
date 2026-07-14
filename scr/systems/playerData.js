// src/systems/playerData.js
export let playerData = {
  name: "Player",
  level: 1,
  exp: 0,
  totalMoneyEarned: 0,
  bestWave: 1,

  skins: {
    unlocked: {
      normal: ["default"],
      rapid: ["default"],
      diamond_cannon: ["default"],
    },
    equipped: {
      normal: "default",
      rapid: "default",
      diamond_cannon: "default",
    },
  },
  mapTheme: {
    owned: ["default"],
    equipped: "default",
  },
  zombieSkin: {
    owned: {
      ground_melee: ["default"], ground_ranged: ["default"], ground_lightning: ["default"],
      air_melee: ["default"], air_ranged: ["default"], air_lightning: ["default"],
      boss_ground_melee: ["default"], boss_air_melee: ["default"],
    },
    equipped: {
      ground_melee: "default", ground_ranged: "default", ground_lightning: "default",
      air_melee: "default", air_ranged: "default", air_lightning: "default",
      boss_ground_melee: "default", boss_air_melee: "default",
    },
  },

  settings: {
    sound: true,
    gameSpeed: 1,
  },
};

export function setPlayerData(data) {
  playerData = data;
}

export function savePlayerData() {
  localStorage.setItem("tvz_player", JSON.stringify(playerData));
}

export function loadPlayerData(applySettings) {
  const data = localStorage.getItem("tvz_player");
  if (data) {
    playerData = JSON.parse(data);
    if (applySettings) applySettings();
  }
}

export function ensurePlayerDataShape() {
  if (!playerData.mapTheme) {
    playerData.mapTheme = { owned: ["default"], equipped: "default" };
  }
  if (!playerData.zombieSkin || Array.isArray(playerData.zombieSkin.owned)) {
    playerData.zombieSkin = {
      owned: {
        ground_melee: ["default"], ground_ranged: ["default"], ground_lightning: ["default"],
        air_melee: ["default"], air_ranged: ["default"], air_lightning: ["default"],
        boss_ground_melee: ["default"], boss_air_melee: ["default"],
      },
      equipped: {
        ground_melee: "default", ground_ranged: "default", ground_lightning: "default",
        air_melee: "default", air_ranged: "default", air_lightning: "default",
        boss_ground_melee: "default", boss_air_melee: "default",
      },
    };
  }
}
