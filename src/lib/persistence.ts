import type { BuildingManagerSlot, Buildings, ChainId, Inventory, ManagerId, ManagerSlot } from "./game-data";

export type PersistedGameState = {
  inventory: Inventory;
  buildings: Buildings;
  unlockedManagerIds: ManagerId[];
  discoveredManagerIds: ManagerId[];
  slots: ManagerSlot[];
  buildingSlots?: BuildingManagerSlot[];
  activeChainTier: Record<ChainId, number>;
  managerLevels?: Record<ManagerId, number>;
  sourceBuildingLevels?: Record<ChainId, number>;
  lastActiveAt: number;
};

const STORAGE_KEY = "probably-a-wizard-save-v5";
const LEGACY_KEY = "probably-a-wizard-save-v4";

export interface GamePersistence {
  load(): Promise<PersistedGameState | null>;
  save(state: PersistedGameState): Promise<void>;
  clear(): Promise<void>;
}

class LocalStoragePersistence implements GamePersistence {
  async load() {
    if (typeof window === "undefined") return null;

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as PersistedGameState;
      } catch {
        return null;
      }
    }

    // Detect legacy v3 save — wipe it and return null (clean start)
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      window.localStorage.removeItem(LEGACY_KEY);
    }

    return null;
  }

  async save(state: PersistedGameState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  async clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  }
}

export const gamePersistence: GamePersistence = new LocalStoragePersistence();
