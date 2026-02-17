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
  INITIAL_DISCOVERED_MANAGER_IDS,
  RESOURCE_TYPES,
  getApartmentUpgradeCost,
  getHousingCapacity,
  getHouseCost,
  getLibraryBuildCost,
  getLibraryUpgradeCost,
  getLumberMillBuildCost,
  getLumberMillUpgradeCost,
  getManagerRequirementError,
  getManagerUnlockCost,
  getMineBuildCost,
  getMineUpgradeCost,
  getQuarryBuildCost,
  getQuarryUpgradeCost,
  getResourceMultiplier,
  getUnlockedResources,
  makeCombinationKey,
  type Buildings,
  type Inventory,
  type ManagerDefinition,
  type ManagerId,
  type ManagerSlot,
  type ResourceType,
} from "@/lib/game-data";
import { gamePersistence } from "@/lib/persistence";

const OFFLINE_GAIN_CAP_SECONDS = 12 * 60 * 60;

type OfflineProgressSummary = {
  elapsedSeconds: number;
  gains: Partial<Inventory>;
};

export type GameState = {
  inventory: Inventory;
  managers: Record<ManagerId, ManagerDefinition>;
  discoveredManagerIds: ManagerId[];
  slots: ManagerSlot[];
  buildings: Buildings;
  housingCapacity: number;
  housedPeople: number;
  resourceMultipliers: Record<ResourceType, number>;
  unlockedResources: ResourceType[];
  hydrated: boolean;
  offlineProgressSummary: OfflineProgressSummary | null;
  dismissOfflineProgressSummary: () => void;
  resetGame: () => Promise<void>;
  addResource: (resource: ResourceType, amount?: number) => void;
  unlockManager: (managerId: ManagerId) => { ok: boolean; reason?: string };
  buildHouseOrApartment: () => { ok: boolean; reason?: string };
  buildOrUpgradeLumberMill: () => { ok: boolean; reason?: string };
  buildOrUpgradeQuarry: () => { ok: boolean; reason?: string };
  buildOrUpgradeMine: () => { ok: boolean; reason?: string };
  buildOrUpgradeLibrary: () => { ok: boolean; reason?: string };
  getEffectivePps: (managerId: ManagerId, resourceType: ResourceType) => number;
  assignManagerToSlot: (slotId: string, managerId: ManagerId | null) => { ok: boolean; reason?: string };
  attemptCombine: (a: ManagerId, b: ManagerId) => { ok: boolean; discoveredId?: ManagerId; alreadyKnown?: boolean };
};

const GameStoreContext = createContext<GameState | null>(null);

const canAfford = (inventory: Inventory, costs: Partial<Inventory>) =>
  Object.entries(costs).every(([resource, amount]) => inventory[resource as ResourceType] >= (amount ?? 0));

const spend = (inventory: Inventory, costs: Partial<Inventory>) => {
  const next = { ...inventory };
  for (const [resource, amount] of Object.entries(costs)) {
    const key = resource as ResourceType;
    next[key] = Math.max(0, next[key] - (amount ?? 0));
  }
  return next;
};

function getInitialDiscovered() {
  return [...INITIAL_DISCOVERED_MANAGER_IDS].sort();
}

function getDefaultManagers() {
  return Object.fromEntries(
    Object.entries(DEFAULT_MANAGERS).map(([managerId, manager]) => [managerId, { ...manager }]),
  ) as Record<ManagerId, ManagerDefinition>;
}

function getDefaultSlots() {
  return DEFAULT_SLOTS.map((slot) => ({ ...slot }));
}

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);
  const [managers, setManagers] = useState(getDefaultManagers);
  const [discoveredManagerIds, setDiscoveredManagerIds] = useState<ManagerId[]>(getInitialDiscovered());
  const [slots, setSlots] = useState(getDefaultSlots);
  const [hydrated, setHydrated] = useState(false);
  const [offlineProgressSummary, setOfflineProgressSummary] = useState<OfflineProgressSummary | null>(null);
  const hasLoadedRef = useRef(false);

  const housedPeople = useMemo(
    () => Object.values(managers).reduce((total, manager) => total + (manager.unlocked ? manager.housingCost : 0), 0),
    [managers],
  );

  const housingCapacity = useMemo(() => getHousingCapacity(buildings), [buildings]);

  const resourceMultipliers = useMemo<Record<ResourceType, number>>(
    () => Object.fromEntries(RESOURCE_TYPES.map((resource) => [resource, getResourceMultiplier(buildings, resource)])) as Record<ResourceType, number>,
    [buildings],
  );

  const unlockedResources = useMemo(() => getUnlockedResources(buildings), [buildings]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    void gamePersistence.load().then((saved) => {
      if (!saved) {
        setHydrated(true);
        return;
      }

      const restoredSlots = saved.slots.length === DEFAULT_SLOTS.length ? saved.slots : getDefaultSlots();
      const restoredManagers = getDefaultManagers();
      for (const managerId of saved.unlockedManagerIds) {
        const manager = restoredManagers[managerId];
        if (manager) restoredManagers[managerId] = { ...manager, unlocked: true };
      }

      const elapsedSeconds = Math.max(0, Math.min(OFFLINE_GAIN_CAP_SECONDS, saved.lastActiveAt ? (Date.now() - saved.lastActiveAt) / 1000 : 0));
      const gains: Partial<Inventory> = {};
      if (elapsedSeconds > 0) {
        for (const slot of restoredSlots) {
          if (!slot.managerId) continue;
          const manager = restoredManagers[slot.managerId];
          if (!manager) continue;
          gains[slot.resourceType] = (gains[slot.resourceType] ?? 0) + manager.pps * elapsedSeconds;
        }
      }

      const nextInventory = { ...DEFAULT_INVENTORY, ...saved.inventory };
      for (const [resource, amount] of Object.entries(gains)) {
        const key = resource as ResourceType;
        nextInventory[key] = Number((nextInventory[key] + (amount ?? 0)).toFixed(3));
      }

      setInventory(nextInventory);
      if (saved.buildings) setBuildings(saved.buildings);
      setManagers(restoredManagers);
      setDiscoveredManagerIds(saved.discoveredManagerIds.length > 0 ? saved.discoveredManagerIds : getInitialDiscovered());
      setSlots(restoredSlots);

      if (Object.values(gains).some((amount) => (amount ?? 0) > 0)) {
        setOfflineProgressSummary({ elapsedSeconds, gains });
      }

      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unlockedManagerIds = (Object.values(managers).filter((manager) => manager.unlocked).map((manager) => manager.id) as ManagerId[]).sort();
    void gamePersistence.save({ inventory, buildings, unlockedManagerIds, discoveredManagerIds, slots, lastActiveAt: Date.now() });
  }, [hydrated, inventory, buildings, managers, discoveredManagerIds, slots]);

  const dismissOfflineProgressSummary = useCallback(() => setOfflineProgressSummary(null), []);

  const resetGame = useCallback(async () => {
    await gamePersistence.clear();
    setInventory({ ...DEFAULT_INVENTORY });
    setBuildings({ ...DEFAULT_BUILDINGS });
    setManagers(getDefaultManagers());
    setDiscoveredManagerIds(getInitialDiscovered());
    setSlots(getDefaultSlots());
    setOfflineProgressSummary(null);
    setHydrated(true);
  }, []);

  const addResource = useCallback(
    (resource: ResourceType, amount = 1) => {
      if (!unlockedResources.includes(resource)) return;
      setInventory((current) => ({ ...current, [resource]: Math.max(0, Number((current[resource] + amount).toFixed(3))) }));
    },
    [unlockedResources],
  );

  const unlockManager = useCallback((managerId: ManagerId) => {
    if (!discoveredManagerIds.includes(managerId)) return { ok: false, reason: "Discover this character first." };
    const manager = managers[managerId];
    if (!manager) return { ok: false, reason: "Unknown character." };
    if (manager.unlocked) return { ok: false, reason: "Character already unlocked." };

    const requirementError = getManagerRequirementError(managerId, buildings);
    if (requirementError) return { ok: false, reason: requirementError };

    const costs = getManagerUnlockCost(managerId);
    if (!canAfford(inventory, costs)) return { ok: false, reason: "Not enough resources." };

    if (housedPeople + manager.housingCost > housingCapacity) {
      return { ok: false, reason: `Not enough housing (${housedPeople}/${housingCapacity}).` };
    }

    setInventory((current) => spend(current, costs));
    setManagers((current) => ({ ...current, [managerId]: { ...current[managerId], unlocked: true } }));
    return { ok: true };
  }, [buildings, discoveredManagerIds, housedPeople, housingCapacity, inventory, managers]);

  const buildHouseOrApartment = useCallback(() => {
    const houseCost = getHouseCost(buildings.houses);
    if (houseCost) {
      if (!canAfford(inventory, houseCost)) return { ok: false, reason: "Not enough resources to build a house." };
      setInventory((current) => spend(current, houseCost));
      setBuildings((current) => ({ ...current, houses: current.houses + 1 }));
      return { ok: true };
    }

    const apartmentCost = getApartmentUpgradeCost();
    if (!canAfford(inventory, apartmentCost)) return { ok: false, reason: "Not enough resources for apartment upgrade." };
    setInventory((current) => spend(current, apartmentCost));
    setBuildings((current) => ({ ...current, apartments: current.apartments + 1 }));
    return { ok: true };
  }, [buildings.houses, inventory]);

  const buildOrUpgradeLumberMill = useCallback(() => {
    const cost = buildings.lumberMillLevel === 0 ? getLumberMillBuildCost() : getLumberMillUpgradeCost(buildings.lumberMillLevel);
    if (!cost) return { ok: false, reason: "Lumber Mill is fully upgraded." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources for Lumber Mill." };
    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({ ...current, lumberMillLevel: current.lumberMillLevel + 1 }));
    return { ok: true };
  }, [buildings.lumberMillLevel, inventory]);

  const buildOrUpgradeQuarry = useCallback(() => {
    const cost = buildings.quarryLevel === 0 ? getQuarryBuildCost() : getQuarryUpgradeCost(buildings.quarryLevel);
    if (!cost) return { ok: false, reason: "Quarry is fully upgraded." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources for Quarry." };
    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({ ...current, quarryLevel: current.quarryLevel + 1 }));
    return { ok: true };
  }, [buildings.quarryLevel, inventory]);

  const buildOrUpgradeMine = useCallback(() => {
    if (buildings.quarryLevel === 0) return { ok: false, reason: "Build Quarry first to unlock Ore." };
    const cost = buildings.mineLevel === 0 ? getMineBuildCost() : getMineUpgradeCost(buildings.mineLevel);
    if (!cost) return { ok: false, reason: "Mine is fully upgraded." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources for Mine." };
    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({ ...current, mineLevel: current.mineLevel + 1 }));
    return { ok: true };
  }, [buildings.mineLevel, buildings.quarryLevel, inventory]);

  const buildOrUpgradeLibrary = useCallback(() => {
    if (buildings.mineLevel === 0) return { ok: false, reason: "Build Mine first to unlock Gold." };
    const cost = buildings.libraryLevel === 0 ? getLibraryBuildCost() : getLibraryUpgradeCost(buildings.libraryLevel);
    if (!cost) return { ok: false, reason: "Library is fully upgraded." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources for Library." };
    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({ ...current, libraryLevel: current.libraryLevel + 1 }));
    return { ok: true };
  }, [buildings.libraryLevel, buildings.mineLevel, inventory]);

  const getEffectivePps = useCallback(
    (managerId: ManagerId, resourceType: ResourceType) => {
      const manager = managers[managerId];
      if (!manager) return 0;
      return Number((manager.pps * resourceMultipliers[resourceType]).toFixed(3));
    },
    [managers, resourceMultipliers],
  );

  const assignManagerToSlot = useCallback((slotId: string, managerId: ManagerId | null) => {
    if (managerId && !managers[managerId]?.unlocked) return { ok: false, reason: "Character is not unlocked." };
    if (managerId && slots.some((slot) => slot.managerId === managerId && slot.id !== slotId)) {
      return { ok: false, reason: "Character already assigned to another slot." };
    }
    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, managerId } : slot)));
    return { ok: true };
  }, [managers, slots]);

  const attemptCombine = useCallback((a: ManagerId, b: ManagerId) => {
    const result = COMBINATION_MAP[makeCombinationKey(a, b)];
    if (!result) return { ok: false };
    if (discoveredManagerIds.includes(result)) return { ok: true, discoveredId: result, alreadyKnown: true };
    setDiscoveredManagerIds((current) => [...current, result].sort());
    return { ok: true, discoveredId: result, alreadyKnown: false };
  }, [discoveredManagerIds]);

  const value = useMemo(() => ({
    inventory,
    managers,
    discoveredManagerIds,
    slots,
    buildings,
    housedPeople,
    housingCapacity,
    resourceMultipliers,
    unlockedResources,
    hydrated,
    offlineProgressSummary,
    dismissOfflineProgressSummary,
    resetGame,
    addResource,
    unlockManager,
    buildHouseOrApartment,
    buildOrUpgradeLumberMill,
    buildOrUpgradeQuarry,
    buildOrUpgradeMine,
    buildOrUpgradeLibrary,
    getEffectivePps,
    assignManagerToSlot,
    attemptCombine,
  }), [inventory, managers, discoveredManagerIds, slots, buildings, housedPeople, housingCapacity, resourceMultipliers, unlockedResources, hydrated, offlineProgressSummary, dismissOfflineProgressSummary, resetGame, addResource, unlockManager, buildHouseOrApartment, buildOrUpgradeLumberMill, buildOrUpgradeQuarry, buildOrUpgradeMine, buildOrUpgradeLibrary, getEffectivePps, assignManagerToSlot, attemptCombine]);

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore() {
  const context = useContext(GameStoreContext);
  if (!context) throw new Error("useGameStore must be used within GameStoreProvider");
  return context;
}
