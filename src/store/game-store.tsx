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
  BUILDING_DEFINITIONS,
  CHAIN_IDS,
  COMBINATION_MAP,
  DEFAULT_BUILDING_SLOTS,
  DEFAULT_BUILDINGS,
  DEFAULT_INVENTORY,
  DEFAULT_MANAGERS,
  DEFAULT_SLOTS,
  INITIAL_DISCOVERED_MANAGER_IDS,
  STARTER_MANAGER_IDS,
  getBuildingById,
  getChainTierResource,
  getEffectiveMultiplier,
  getHousingCapacity,
  getHousingUpgradeCost,
  getLevelUpCost,
  getManagerUnlockCost,
  getNewChainCost,
  getUnlockedResources,
  isBuildingPrerequisiteMet,
  makeCombinationKey,
  type BuildingId,
  type BuildingManagerSlot,
  type Buildings,
  type ChainId,
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

function getDefaultManagerLevels(): Record<ManagerId, number> {
  return Object.fromEntries(
    Object.keys(DEFAULT_MANAGERS).map((id) => [id, 0]),
  ) as Record<ManagerId, number>;
}

function computeEffectivePps(pps: number, level: number): number {
  return pps * getEffectiveMultiplier(level);
}

export type GameState = {
  inventory: Inventory;
  managers: Record<ManagerId, ManagerDefinition>;
  discoveredManagerIds: ManagerId[];
  slots: ManagerSlot[];
  buildingSlots: BuildingManagerSlot[];
  buildings: Buildings;
  activeChainTier: Record<ChainId, number>;
  housingCapacity: number;
  housedPeople: number;
  unlockedResources: ResourceType[];
  hydrated: boolean;
  offlineProgressSummary: OfflineProgressSummary | null;
  newResourceUnlocked: string | null;
  managerLevels: Record<ManagerId, number>;
  dismissOfflineProgressSummary: () => void;
  dismissNewResourceUnlocked: () => void;
  resetGame: () => Promise<void>;
  addResource: (resource: ResourceType, amount?: number) => void;
  unlockManager: (managerId: ManagerId) => { ok: boolean; reason?: string };
  getEffectivePps: (managerId: ManagerId) => number;
  assignManagerToSlot: (slotId: string, managerId: ManagerId | null) => { ok: boolean; reason?: string };
  assignManagerToBuildingSlot: (slotId: string, managerId: ManagerId | null) => { ok: boolean; reason?: string };
  attemptCombine: (a: ManagerId, b: ManagerId) => { ok: boolean; discoveredId?: ManagerId; alreadyKnown?: boolean };
  setActiveChainTier: (chainId: ChainId, tierIndex: number) => void;
  buildBuilding: (buildingId: BuildingId) => { ok: boolean; reason?: string };
  convertResource: (buildingId: BuildingId) => { ok: boolean; reason?: string };
  upgradeHousing: () => { ok: boolean; reason?: string };
  addHousingChain: () => { ok: boolean; reason?: string };
  levelUpManager: (managerId: ManagerId) => { ok: boolean; reason?: string };
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
  const managers = Object.fromEntries(
    Object.entries(DEFAULT_MANAGERS).map(([managerId, manager]) => [managerId, { ...manager }]),
  ) as Record<ManagerId, ManagerDefinition>;
  for (const starterId of STARTER_MANAGER_IDS) {
    managers[starterId] = { ...managers[starterId], unlocked: true };
  }
  return managers;
}

function getDefaultSlots() {
  return DEFAULT_SLOTS.map((slot) => ({ ...slot }));
}

function getDefaultBuildingSlots() {
  return DEFAULT_BUILDING_SLOTS.map((slot) => ({ ...slot }));
}

function getDefaultActiveChainTier(): Record<ChainId, number> {
  return Object.fromEntries(CHAIN_IDS.map((id) => [id, 0])) as Record<ChainId, number>;
}

export function GameStoreProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState(DEFAULT_INVENTORY);
  const [buildings, setBuildings] = useState(DEFAULT_BUILDINGS);
  const [managers, setManagers] = useState(getDefaultManagers);
  const [discoveredManagerIds, setDiscoveredManagerIds] = useState<ManagerId[]>(getInitialDiscovered());
  const [slots, setSlots] = useState(getDefaultSlots);
  const [buildingSlots, setBuildingSlots] = useState(getDefaultBuildingSlots);
  const [managerLevels, setManagerLevels] = useState(getDefaultManagerLevels);
  const [activeChainTier, setActiveChainTierState] = useState(getDefaultActiveChainTier);
  const [hydrated, setHydrated] = useState(false);
  const [offlineProgressSummary, setOfflineProgressSummary] = useState<OfflineProgressSummary | null>(null);
  const [newResourceUnlocked, setNewResourceUnlocked] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const housedPeople = useMemo(
    () => Object.values(managers).reduce((total, manager) => total + (manager.unlocked ? manager.housingCost : 0), 0),
    [managers],
  );

  const housingCapacity = useMemo(() => getHousingCapacity(buildings), [buildings]);
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

      // Restore building slots — merge with defaults to handle new buildings added after save
      const savedBuildingSlotMap = Object.fromEntries(
        (saved.buildingSlots ?? []).map((s) => [s.id, s.managerId]),
      );
      const restoredBuildingSlots = getDefaultBuildingSlots().map((s) => ({
        ...s,
        managerId: savedBuildingSlotMap[s.id] ?? null,
      }));

      const restoredManagers = getDefaultManagers();
      for (const managerId of saved.unlockedManagerIds) {
        const manager = restoredManagers[managerId as ManagerId];
        if (manager) restoredManagers[managerId as ManagerId] = { ...manager, unlocked: true };
      }

      // Restore manager levels
      const restoredManagerLevels: Record<ManagerId, number> = {
        ...getDefaultManagerLevels(),
        ...(saved.managerLevels ?? {}),
      };

      const elapsedSeconds = Math.max(0, Math.min(OFFLINE_GAIN_CAP_SECONDS, saved.lastActiveAt ? (Date.now() - saved.lastActiveAt) / 1000 : 0));
      const gains: Partial<Inventory> = {};
      if (elapsedSeconds > 0) {
        for (const slot of restoredSlots) {
          if (!slot.managerId) continue;
          const manager = restoredManagers[slot.managerId as ManagerId];
          if (!manager) continue;
          const level = restoredManagerLevels[slot.managerId as ManagerId] ?? 0;
          const effectivePps = computeEffectivePps(manager.pps, level);
          const resourceType = getChainTierResource(slot.chainId, 0);
          gains[resourceType] = (gains[resourceType] ?? 0) + effectivePps * elapsedSeconds;
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
      setBuildingSlots(restoredBuildingSlots);
      setManagerLevels(restoredManagerLevels);
      if (saved.activeChainTier) setActiveChainTierState(saved.activeChainTier);

      if (Object.values(gains).some((amount) => (amount ?? 0) > 0)) {
        setOfflineProgressSummary({ elapsedSeconds, gains });
      }

      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const unlockedManagerIds = (Object.values(managers).filter((m) => m.unlocked).map((m) => m.id) as ManagerId[]).sort();
    void gamePersistence.save({
      inventory,
      buildings,
      unlockedManagerIds,
      discoveredManagerIds,
      slots,
      buildingSlots,
      activeChainTier,
      managerLevels,
      lastActiveAt: Date.now(),
    });
  }, [hydrated, inventory, buildings, managers, discoveredManagerIds, slots, buildingSlots, activeChainTier, managerLevels]);

  const dismissOfflineProgressSummary = useCallback(() => setOfflineProgressSummary(null), []);
  const dismissNewResourceUnlocked = useCallback(() => setNewResourceUnlocked(null), []);

  const resetGame = useCallback(async () => {
    await gamePersistence.clear();
    setInventory({ ...DEFAULT_INVENTORY });
    setBuildings({ ...DEFAULT_BUILDINGS });
    setManagers(getDefaultManagers());
    setDiscoveredManagerIds(getInitialDiscovered());
    setSlots(getDefaultSlots());
    setBuildingSlots(getDefaultBuildingSlots());
    setManagerLevels(getDefaultManagerLevels());
    setActiveChainTierState(getDefaultActiveChainTier());
    setOfflineProgressSummary(null);
    setNewResourceUnlocked(null);
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

    const costs = getManagerUnlockCost(managerId);
    if (Object.keys(costs).length > 0 && !canAfford(inventory, costs)) {
      return { ok: false, reason: "Not enough resources." };
    }

    if (manager.housingCost > 0 && housedPeople + manager.housingCost > housingCapacity) {
      return { ok: false, reason: `Not enough housing (${housedPeople}/${housingCapacity}).` };
    }

    if (Object.keys(costs).length > 0) {
      setInventory((current) => spend(current, costs));
    }
    setManagers((current) => ({ ...current, [managerId]: { ...current[managerId], unlocked: true } }));
    return { ok: true };
  }, [discoveredManagerIds, housedPeople, housingCapacity, inventory, managers]);

  const getEffectivePps = useCallback(
    (managerId: ManagerId) => {
      const manager = managers[managerId];
      if (!manager) return 0;
      const level = managerLevels[managerId] ?? 0;
      return computeEffectivePps(manager.pps, level);
    },
    [managers, managerLevels],
  );

  const assignManagerToSlot = useCallback((slotId: string, managerId: ManagerId | null) => {
    if (managerId && !managers[managerId]?.unlocked) return { ok: false, reason: "Character is not unlocked." };
    if (managerId && slots.some((slot) => slot.managerId === managerId && slot.id !== slotId)) {
      return { ok: false, reason: "Character already assigned to another slot." };
    }
    setSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, managerId } : slot)));
    return { ok: true };
  }, [managers, slots]);

  const assignManagerToBuildingSlot = useCallback((slotId: string, managerId: ManagerId | null) => {
    if (managerId && !managers[managerId]?.unlocked) return { ok: false, reason: "Character is not unlocked." };
    if (managerId && buildingSlots.some((slot) => slot.managerId === managerId && slot.id !== slotId)) {
      return { ok: false, reason: "Character already assigned to another building slot." };
    }
    setBuildingSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, managerId } : slot)));
    return { ok: true };
  }, [managers, buildingSlots]);

  const attemptCombine = useCallback((a: ManagerId, b: ManagerId) => {
    const result = COMBINATION_MAP[makeCombinationKey(a, b)];
    if (!result) return { ok: false };
    if (discoveredManagerIds.includes(result)) return { ok: true, discoveredId: result, alreadyKnown: true };
    setDiscoveredManagerIds((current) => [...current, result].sort());
    return { ok: true, discoveredId: result, alreadyKnown: false };
  }, [discoveredManagerIds]);

  const setActiveChainTier = useCallback((chainId: ChainId, tierIndex: number) => {
    setActiveChainTierState((current) => ({ ...current, [chainId]: tierIndex }));
  }, []);

  // ─── Building Actions ───────────────────────────────────────────────────

  const buildBuilding = useCallback((buildingId: BuildingId) => {
    const building = getBuildingById(buildingId);
    if (!building) return { ok: false, reason: "Unknown building." };

    if (buildings.builtBuildings[buildingId]) return { ok: false, reason: "Already built." };

    if (!isBuildingPrerequisiteMet(building, buildings)) {
      const prereq = getBuildingById(building.prerequisite!);
      return { ok: false, reason: `Requires ${prereq?.name ?? building.prerequisite} to be built first.` };
    }

    if (!canAfford(inventory, building.buildCost)) return { ok: false, reason: "Not enough resources." };

    setInventory((current) => spend(current, building.buildCost));
    setBuildings((current) => ({
      ...current,
      builtBuildings: { ...current.builtBuildings, [buildingId]: true },
    }));

    if (building.unlocksResource) {
      const resourceName = building.conversionOutput;
      const tierInfo = resourceName ? RESOURCE_LABELS_INTERNAL[resourceName] : null;
      setNewResourceUnlocked(tierInfo ?? building.name);
    }

    return { ok: true };
  }, [buildings, inventory]);

  const convertResource = useCallback((buildingId: BuildingId) => {
    const building = getBuildingById(buildingId);
    if (!building) return { ok: false, reason: "Unknown building." };
    if (!buildings.builtBuildings[buildingId]) return { ok: false, reason: "Building not built yet." };
    if (!building.conversionInput || !building.conversionOutput) return { ok: false, reason: "This building cannot convert resources." };

    if (inventory[building.conversionInput] < building.conversionRatio) {
      return { ok: false, reason: `Need ${building.conversionRatio} ${building.conversionInput} to convert.` };
    }

    setInventory((current) => ({
      ...current,
      [building.conversionInput!]: current[building.conversionInput!] - building.conversionRatio,
      [building.conversionOutput!]: current[building.conversionOutput!] + 1,
    }));

    return { ok: true };
  }, [buildings, inventory]);

  // ─── Housing Actions ────────────────────────────────────────────────────

  const upgradeHousing = useCallback(() => {
    if (buildings.housingChains === 0) return { ok: false, reason: "Build a housing chain first." };
    if (buildings.housingLevel >= 7) return { ok: false, reason: "Housing is at maximum level." };

    const cost = getHousingUpgradeCost(buildings.housingLevel, buildings.housingChains);
    if (!cost) return { ok: false, reason: "No upgrade available." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources." };

    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({ ...current, housingLevel: current.housingLevel + 1 }));
    return { ok: true };
  }, [buildings, inventory]);

  const addHousingChain = useCallback(() => {
    if (buildings.housingChains >= 4) return { ok: false, reason: "Maximum 4 housing chains." };

    const cost = getNewChainCost(buildings.housingLevel);
    if (!cost) return { ok: false, reason: "Cannot add chain." };
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources." };

    setInventory((current) => spend(current, cost));
    setBuildings((current) => ({
      ...current,
      housingChains: current.housingChains + 1,
      housingLevel: Math.max(current.housingLevel, 1),
    }));
    return { ok: true };
  }, [buildings, inventory]);

  // ─── Level Up Action ────────────────────────────────────────────────────

  const levelUpManager = useCallback((managerId: ManagerId) => {
    const manager = managers[managerId];
    if (!manager || !manager.unlocked) return { ok: false, reason: "Character not unlocked." };

    const currentLevel = managerLevels[managerId] ?? 0;
    if (currentLevel >= 100) return { ok: false, reason: "Already at maximum level." };

    const cost = getLevelUpCost(currentLevel, manager.tier);
    if (!canAfford(inventory, cost)) return { ok: false, reason: "Not enough resources." };

    setInventory((current) => spend(current, cost));
    setManagerLevels((current) => ({ ...current, [managerId]: currentLevel + 1 }));
    return { ok: true };
  }, [managers, managerLevels, inventory]);

  const value = useMemo(() => ({
    inventory,
    managers,
    discoveredManagerIds,
    slots,
    buildingSlots,
    buildings,
    activeChainTier,
    housedPeople,
    housingCapacity,
    unlockedResources,
    hydrated,
    offlineProgressSummary,
    newResourceUnlocked,
    managerLevels,
    dismissOfflineProgressSummary,
    dismissNewResourceUnlocked,
    resetGame,
    addResource,
    unlockManager,
    getEffectivePps,
    assignManagerToSlot,
    assignManagerToBuildingSlot,
    attemptCombine,
    setActiveChainTier,
    buildBuilding,
    convertResource,
    upgradeHousing,
    addHousingChain,
    levelUpManager,
  }), [
    inventory, managers, discoveredManagerIds, slots, buildingSlots, buildings,
    activeChainTier, housedPeople, housingCapacity, unlockedResources, hydrated,
    offlineProgressSummary, newResourceUnlocked, managerLevels,
    dismissOfflineProgressSummary, dismissNewResourceUnlocked, resetGame,
    addResource, unlockManager, getEffectivePps, assignManagerToSlot,
    assignManagerToBuildingSlot, attemptCombine, setActiveChainTier,
    buildBuilding, convertResource, upgradeHousing, addHousingChain, levelUpManager,
  ]);

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>;
}

export function useGameStore() {
  const context = useContext(GameStoreContext);
  if (!context) throw new Error("useGameStore must be used within GameStoreProvider");
  return context;
}

// Internal label lookup for resource unlock popup
import { RESOURCE_LABELS } from "@/lib/game-data";
const RESOURCE_LABELS_INTERNAL = RESOURCE_LABELS;
