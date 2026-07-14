// src/systems/evolveSystem.js
import { state } from "../core/state.js";
import { EVOLVE_TREE } from "../data/evolveTree.js";

export function evolveTower(type) {
  const data = EVOLVE_TREE[type];
  if (!data) return { ok: false };
  if ((state.towerInventory[type] || 0) < data.need) return { ok: false };

  state.towerInventory[type] -= data.need;
  state.towerInventory[data.next] = (state.towerInventory[data.next] || 0) + 1;

  return { ok: true, next: data.next };
}
