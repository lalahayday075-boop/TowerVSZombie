// src/systems/evolveSystem.js
import { api } from "./api.js";
import { applyFullGameData, saveGame } from "./saveSystem.js";

export async function evolveTower(type) {
  try {
    const result = await api.evolve(type);
    applyFullGameData(result.state);
    saveGame();
    return { ok: true, next: result.next };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}
