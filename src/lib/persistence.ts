import type { Buildings, Inventory, ManagerId, ManagerSlot } from "./game-data";

export type PersistedGameState = {
  inventory: Inventory;
  buildings: Buildings;
  unlockedManagerIds: ManagerId[];
  discoveredManagerIds: ManagerId[];
  slots: ManagerSlot[];
};

const STORAGE_KEY = "probably-a-wizard-mvp-save-v3";

// Dexie-ready interface for easy future swap.
export interface GamePersistence {
  load(): Promise<PersistedGameState | null>;
  save(state: PersistedGameState): Promise<void>;
}

class LocalStoragePersistence implements GamePersistence {
  async load() {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as PersistedGameState;
    } catch {
      return null;
    }
  }

  async save(state: PersistedGameState) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export const gamePersistence: GamePersistence = new LocalStoragePersistence();
