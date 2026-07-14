// scr/systems/inventorySystem.js
import { state } from "../core/state.js";
import { TOWER_TYPES } from "../data/towerTypes.js";

export function initInventory() {
  if (Object.keys(state.towerInventory).length > 0) return;
  for (const type in TOWER_TYPES) state.towerInventory[type] = 0;
  state.towerInventory["normal"] = 3;
}
