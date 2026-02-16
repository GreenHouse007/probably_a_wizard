"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  COMBINATION_MAP,
  DEFAULT_BUILDINGS,
  DEFAULT_INVENTORY,
  DEFAULT_MANAGERS,
  DEFAULT_SLOTS,
  HUT_CAPACITY,
  HUT_COST,
  PERSON_MANAGER_IDS,
  WORKSHOP_UNLOCK_HUTS,
  getSticksPpsMultiplier,
  getWorkshopCost,
  makeCombinationKey,
  type Buildings,
  type Inventory,
  type ManagerDefinition,
  type ManagerId,
  type ManagerSlot,
  type ResourceType,
  UNLOCK_COSTS,
} from "@/lib/game-data";
import { gamePersistence } from "@/lib/persistence";

export type GameState = {
  inventory: Inventory;
  managers: Record<ManagerId, ManagerDefinition>;
  discoveredManagerIds: ManagerId[];
  slots: ManagerSlot[];
  buildings: Buildings;
  housingCapacity: number;
  housedPeople: number;
  resourceMultipliers: Record<ResourceType, number>;
  hydrated: boolean;
  addResource: (resource: ResourceType, amount?: number) => void;
  unlockManager: (managerId: ManagerId) => { ok: boolean; reason?: string };
  buildHut: () => { ok: boolean; reason?: string };
  buildWorkshop: () => { ok: boolean; reason?: string };
  getEffectivePps: (managerId: ManagerId, resourceType: ResourceType) => number;
  assignManagerToSlot: (slotId: string, managerId: ManagerId | null) => { ok: boolean; reason?: string };
  attemptCombine: (a: ManagerId, b: ManagerId) => { ok: boolean; discoveredId?: ManagerId; alreadyKnown?: boolean };
};

const GameStoreContext = createContext<GameState | null>(null);

function getInitialDiscovered() {
  return (Object.values(DEFAULT_MANAGERS)
    .filter((manager) => manager.unlocked)
    .map((manager) => manager.id) as ManagerId[]).sort();
}

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);
  const [managers, setManagers] = useState(DEFAULT_MANAGERS);
  const [discoveredManagerIds, setDiscoveredManagerIds] = useState<ManagerId[]>(
    getInitialDiscovered(),
  );
  const [slots, setSlots] = useState(DEFAULT_SLOTS);
  const [hydrated, setHydrated] = useState(false);
  const hasLoadedRef = useRef(false);

  const housedPeople = useMemo(
    () => PERSON_MANAGER_IDS.filter((managerId) => managers[managerId].unlocked).length,
    [managers],
  );
  const housingCapacity = buildings.huts * HUT_CAPACITY;
  const resourceMultipliers = useMemo<Record<ResourceType, number>>(
    () => ({
      food: 1,
      water: 1,
      sticks: getSticksPpsMultiplier(buildings.workshops),
      stone: 1,
    }),
    [buildings.workshops],
  );

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    hasLoadedRef.current = true;
    void gamePersistence.load().then((saved) => {
      if (!saved) {
        setHydrated(true);
        return;
      }

      setInventory(saved.inventory);
      if (saved.buildings) {
        setBuildings({ ...DEFAULT_BUILDINGS, ...saved.buildings });
      }
      setManagers((current) => {
        const next = { ...current };
        for (const managerId of saved.unlockedManagerIds) {
          const manager = next[managerId];
          if (manager) {
            next[managerId] = { ...manager, unlocked: true };
          }
        }
        return next;
      });
      setDiscoveredManagerIds(saved.discoveredManagerIds);
      setSlots(saved.slots.length === 4 ? saved.slots : DEFAULT_SLOTS);
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const unlockedManagerIds = (Object.values(managers)
      .filter((manager) => manager.unlocked)
      .map((manager) => manager.id) as ManagerId[]).sort();

    void gamePersistence.save({
      inventory,
      buildings,
      unlockedManagerIds,
      discoveredManagerIds,
      slots,
    });
  }, [hydrated, inventory, buildings, managers, discoveredManagerIds, slots]);

  const addResource = useCallback((resource: ResourceType, amount = 1) => {
    setInventory((current) => ({
      ...current,
      [resource]: Math.max(0, Number((current[resource] + amount).toFixed(3))),
    }));
  }, []);

  const buildHut = useCallback(() => {
    for (const [resource, amount] of Object.entries(HUT_COST)) {
      const resourceKey = resource as ResourceType;
      if ((amount ?? 0) > inventory[resourceKey]) {
        return { ok: false, reason: "Not enough resources to build a hut." };
      }
    }

    setInventory((current) => ({
      ...current,
      sticks: Math.max(0, current.sticks - (HUT_COST.sticks ?? 0)),
      stone: Math.max(0, current.stone - (HUT_COST.stone ?? 0)),
    }));

    setBuildings((current) => ({ ...current, huts: current.huts + 1 }));
    return { ok: true };
  }, [inventory]);

  const unlockManager = useCallback(
    (managerId: ManagerId) => {
      const costs = UNLOCK_COSTS[managerId];
      if (!costs) {
        return { ok: false, reason: "This manager cannot be unlocked directly." };
      }

      const manager = managers[managerId];
      if (!manager) {
        return { ok: false, reason: "Unknown manager." };
      }

      if (manager.unlocked) {
        return { ok: false, reason: "Manager already unlocked." };
      }

      if (PERSON_MANAGER_IDS.includes(managerId) && housedPeople >= housingCapacity) {
        return {
          ok: false,
          reason: "No housing available. Build a hut before unlocking more people.",
        };
      }

      for (const [resource, amount] of Object.entries(costs)) {
        const key = resource as ResourceType;
        if ((amount ?? 0) > inventory[key]) {
          return { ok: false, reason: "Not enough resources." };
        }
      }

      setInventory((current) => {
        const next = { ...current };
        for (const [resource, amount] of Object.entries(costs)) {
          const key = resource as ResourceType;
          next[key] = Math.max(0, current[key] - (amount ?? 0));
        }
        return next;
      });

      setManagers((current) => ({
        ...current,
        [managerId]: { ...current[managerId], unlocked: true },
      }));

      setDiscoveredManagerIds((current) =>
        current.includes(managerId) ? current : [...current, managerId],
      );

      return { ok: true };
    },
    [housedPeople, housingCapacity, inventory, managers],
  );

  const buildWorkshop = useCallback(() => {
    if (buildings.huts < WORKSHOP_UNLOCK_HUTS) {
      return {
        ok: false,
        reason: `Build at least ${WORKSHOP_UNLOCK_HUTS} hut to unlock workshops.`,
      };
    }

    const cost = getWorkshopCost(buildings.workshops);

    for (const [resource, amount] of Object.entries(cost)) {
      const resourceKey = resource as ResourceType;
      if ((amount ?? 0) > inventory[resourceKey]) {
        return { ok: false, reason: "Not enough resources to build a workshop." };
      }
    }

    setInventory((current) => {
      const next = { ...current };
      for (const [resource, amount] of Object.entries(cost)) {
        const key = resource as ResourceType;
        next[key] = Math.max(0, current[key] - (amount ?? 0));
      }
      return next;
    });

    setBuildings((current) => ({ ...current, workshops: current.workshops + 1 }));
    return { ok: true };
  }, [buildings.huts, buildings.workshops, inventory]);

  const getEffectivePps = useCallback(
    (managerId: ManagerId, resourceType: ResourceType) => {
      const manager = managers[managerId];
      if (!manager) {
        return 0;
      }

      return Number((manager.pps * resourceMultipliers[resourceType]).toFixed(3));
    },
    [managers, resourceMultipliers],
  );

  const assignManagerToSlot = useCallback(
    (slotId: string, managerId: ManagerId | null) => {
      if (managerId) {
        const assigned = slots.find(
          (slot) => slot.managerId === managerId && slot.id !== slotId,
        );

        if (assigned) {
          return { ok: false, reason: "Manager already assigned to another slot." };
        }
      }

      setSlots((current) =>
        current.map((slot) =>
          slot.id === slotId
            ? {
                ...slot,
                managerId,
              }
            : slot,
        ),
      );

      return { ok: true };
    },
    [slots],
  );

  const attemptCombine = useCallback(
    (a: ManagerId, b: ManagerId) => {
      const result = COMBINATION_MAP[makeCombinationKey(a, b)];

      if (!result) {
        return { ok: false };
      }

      if (discoveredManagerIds.includes(result)) {
        return { ok: true, discoveredId: result, alreadyKnown: true };
      }

      setManagers((current) => ({
        ...current,
        [result]: {
          ...current[result],
          unlocked: true,
        },
      }));

      setDiscoveredManagerIds((current) => [...current, result]);

      return { ok: true, discoveredId: result, alreadyKnown: false };
    },
    [discoveredManagerIds],
  );

  const value = useMemo(
    () => ({
      inventory,
      managers,
      discoveredManagerIds,
      slots,
      buildings,
      housedPeople,
      housingCapacity,
      resourceMultipliers,
      hydrated,
      addResource,
      unlockManager,
      buildHut,
      buildWorkshop,
      getEffectivePps,
      assignManagerToSlot,
      attemptCombine,
    }),
    [
      inventory,
      managers,
      discoveredManagerIds,
      slots,
      buildings,
      housedPeople,
      housingCapacity,
      resourceMultipliers,
      hydrated,
      addResource,
      unlockManager,
      buildHut,
      buildWorkshop,
      getEffectivePps,
      assignManagerToSlot,
      attemptCombine,
    ],
  );

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore() {
  const context = useContext(GameStoreContext);

  if (!context) {
    throw new Error("useGameStore must be used within GameStoreProvider");
  }

  return context;
}
