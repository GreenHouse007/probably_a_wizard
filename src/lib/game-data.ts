export const RESOURCE_TYPES = [
  "food",
  "water",
  "sticks",
  "stone",
  "logs",
  "ore",
  "gold",
  "knowledge",
] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export type Inventory = Record<ResourceType, number>;

export type BuildingId = "housing" | "lumber-mill" | "quarry" | "mine" | "library";

export type Buildings = {
  houses: number;
  apartments: number;
  lumberMillLevel: number;
  quarryLevel: number;
  mineLevel: number;
  libraryLevel: number;
};

export type BuildingDefinition = {
  id: BuildingId;
  name: string;
  maxCount: number | null;
  purpose: string;
};

export type ManagerTier = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const MANAGER_CONFIG = [
  { id: "gatherer", name: "Gatherer", pps: 0.2, housingCost: 1, tier: 1 },
  { id: "collector", name: "Collector", pps: 0.2, housingCost: 1, tier: 1 },
  { id: "carrier", name: "Carrier", pps: 0.25, housingCost: 1, tier: 1 },
  { id: "worker", name: "Worker", pps: 0.25, housingCost: 1, tier: 1 },
  { id: "builder", name: "Builder", pps: 0.4, housingCost: 1, tier: 2 },
  { id: "explorer", name: "Explorer", pps: 0.4, housingCost: 1, tier: 2 },
  { id: "miner", name: "Miner", pps: 0.45, housingCost: 1, tier: 2 },
  { id: "supplier", name: "Supplier", pps: 0.45, housingCost: 1, tier: 2 },
  { id: "lumberjack", name: "Lumberjack", pps: 0.6, housingCost: 1, tier: 3 },
  { id: "quarryman", name: "Quarryman", pps: 0.6, housingCost: 1, tier: 3 },
  { id: "scout", name: "Scout", pps: 0.65, housingCost: 1, tier: 3 },
  { id: "craftsman", name: "Craftsman", pps: 0.7, housingCost: 1, tier: 3 },
  { id: "engineer", name: "Engineer", pps: 1, housingCost: 1, tier: 4 },
  { id: "prospector", name: "Prospector", pps: 1.1, housingCost: 1, tier: 4 },
  { id: "foreman", name: "Foreman", pps: 1.2, housingCost: 1, tier: 4 },
  { id: "transporter", name: "Transporter", pps: 1.2, housingCost: 1, tier: 4 },
  { id: "master-lumberjack", name: "Master Lumberjack", pps: 1.5, housingCost: 1, tier: 5 },
  { id: "deep-miner", name: "Deep Miner", pps: 1.6, housingCost: 1, tier: 5 },
  { id: "gold-digger", name: "Gold Digger", pps: 1.7, housingCost: 1, tier: 5 },
  { id: "refiner", name: "Refiner", pps: 1.8, housingCost: 1, tier: 5 },
  { id: "scholar", name: "Scholar", pps: 2, housingCost: 1, tier: 6 },
  { id: "architect", name: "Architect", pps: 2.2, housingCost: 1, tier: 6 },
  { id: "scientist", name: "Scientist", pps: 2.4, housingCost: 1, tier: 6 },
  { id: "planner", name: "Planner", pps: 2.5, housingCost: 1, tier: 6 },
  { id: "chief", name: "Chief", pps: 3, housingCost: 1, tier: 7 },
  { id: "director", name: "Director", pps: 3.2, housingCost: 1, tier: 7 },
  { id: "industrialist", name: "Industrialist", pps: 3.5, housingCost: 1, tier: 7 },
  { id: "professor", name: "Professor", pps: 3.7, housingCost: 1, tier: 7 },
  { id: "master-engineer", name: "Master Engineer", pps: 4, housingCost: 1, tier: 8 },
  { id: "grand-architect", name: "Grand Architect", pps: 4.3, housingCost: 1, tier: 8 },
  { id: "mining-tycoon", name: "Mining Tycoon", pps: 4.6, housingCost: 1, tier: 8 },
  { id: "visionary", name: "Visionary", pps: 5, housingCost: 1, tier: 8 },
  { id: "magnate", name: "Magnate", pps: 5.5, housingCost: 1, tier: 9 },
  { id: "innovator", name: "Innovator", pps: 6, housingCost: 1, tier: 9 },
  { id: "infrastructure-master", name: "Infrastructure Master", pps: 6.5, housingCost: 1, tier: 9 },
  { id: "city-founder", name: "City Founder", pps: 7, housingCost: 1, tier: 9 },
  { id: "civilization-builder", name: "Civilization Builder", pps: 8, housingCost: 1, tier: 10 },
  { id: "resource-king", name: "Resource King", pps: 9, housingCost: 1, tier: 10 },
  { id: "mastermind", name: "Mastermind", pps: 10, housingCost: 1, tier: 10 },
  { id: "world-planner", name: "World Planner", pps: 12, housingCost: 1, tier: 10 },
  { id: "civilization-architect", name: "Civilization Architect", pps: 14, housingCost: 1, tier: 10 },
  { id: "grand-magnate", name: "Grand Magnate", pps: 16, housingCost: 1, tier: 10 },
  { id: "prime-engineer", name: "Prime Engineer", pps: 18, housingCost: 1, tier: 10 },
  { id: "economic-overlord", name: "Economic Overlord", pps: 20, housingCost: 1, tier: 10 },
  { id: "knowledge-keeper", name: "Knowledge Keeper", pps: 22, housingCost: 1, tier: 10 },
  { id: "industrial-overlord", name: "Industrial Overlord", pps: 25, housingCost: 1, tier: 10 },
  { id: "resource-emperor", name: "Resource Emperor", pps: 30, housingCost: 1, tier: 10 },
  { id: "prime-director", name: "Prime Director", pps: 35, housingCost: 1, tier: 10 },
  { id: "civilization-emperor", name: "Civilization Emperor", pps: 40, housingCost: 1, tier: 10 },
  { id: "the-founder", name: "The Founder", pps: 50, housingCost: 1, tier: 10 },
] as const;

export type ManagerId = (typeof MANAGER_CONFIG)[number]["id"];

export type ManagerDefinition = {
  id: ManagerId;
  name: string;
  pps: number;
  housingCost: number;
  tier: ManagerTier;
  unlocked: boolean;
};

export type ManagerSlot = {
  id: string;
  resourceType: ResourceType;
  managerId: ManagerId | null;
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  food: "Food",
  water: "Water",
  sticks: "Sticks",
  stone: "Stone",
  logs: "Logs",
  ore: "Ore",
  gold: "Gold",
  knowledge: "Knowledge",
};

export const DEFAULT_INVENTORY: Inventory = {
  food: 0,
  water: 0,
  sticks: 0,
  stone: 0,
  logs: 0,
  ore: 0,
  gold: 0,
  knowledge: 0,
};

export const DEFAULT_BUILDINGS: Buildings = {
  houses: 0,
  apartments: 0,
  lumberMillLevel: 0,
  quarryLevel: 0,
  mineLevel: 0,
  libraryLevel: 0,
};

export const STARTING_RESOURCES: ResourceType[] = ["food", "water", "sticks", "stone"];

const comboKey = (a: ManagerId, b: ManagerId) => [a, b].sort().join("+");

export const COMBINATION_MAP: Record<string, ManagerId> = {
  [comboKey("gatherer", "collector")]: "builder",
  [comboKey("gatherer", "gatherer")]: "explorer",
  [comboKey("collector", "collector")]: "miner",
  [comboKey("carrier", "worker")]: "supplier",
  [comboKey("builder", "gatherer")]: "lumberjack",
  [comboKey("builder", "miner")]: "quarryman",
  [comboKey("explorer", "worker")]: "scout",
  [comboKey("builder", "worker")]: "craftsman",
  [comboKey("builder", "explorer")]: "engineer",
  [comboKey("miner", "explorer")]: "prospector",
  [comboKey("builder", "supplier")]: "foreman",
  [comboKey("carrier", "engineer")]: "transporter",
  [comboKey("lumberjack", "engineer")]: "master-lumberjack",
  [comboKey("miner", "engineer")]: "deep-miner",
  [comboKey("miner", "prospector")]: "gold-digger",
  [comboKey("engineer", "miner")]: "refiner",
  [comboKey("explorer", "engineer")]: "scholar",
  [comboKey("builder", "scholar")]: "architect",
  [comboKey("engineer", "scholar")]: "scientist",
  [comboKey("foreman", "scholar")]: "planner",
  [comboKey("foreman", "architect")]: "chief",
  [comboKey("planner", "engineer")]: "director",
  [comboKey("gold-digger", "engineer")]: "industrialist",
  [comboKey("scholar", "scientist")]: "professor",
  [comboKey("engineer", "scientist")]: "master-engineer",
  [comboKey("architect", "engineer")]: "grand-architect",
  [comboKey("gold-digger", "industrialist")]: "mining-tycoon",
  [comboKey("professor", "architect")]: "visionary",
  [comboKey("industrialist", "chief")]: "magnate",
  [comboKey("scientist", "visionary")]: "innovator",
  [comboKey("architect", "director")]: "infrastructure-master",
  [comboKey("chief", "visionary")]: "city-founder",
  [comboKey("city-founder", "architect")]: "civilization-builder",
  [comboKey("mining-tycoon", "magnate")]: "resource-king",
  [comboKey("innovator", "professor")]: "mastermind",
  [comboKey("civilization-builder", "mastermind")]: "world-planner",
  [comboKey("world-planner", "architect")]: "civilization-architect",
  [comboKey("resource-king", "magnate")]: "grand-magnate",
  [comboKey("master-engineer", "innovator")]: "prime-engineer",
  [comboKey("grand-magnate", "director")]: "economic-overlord",
  [comboKey("mastermind", "scholar")]: "knowledge-keeper",
  [comboKey("economic-overlord", "industrialist")]: "industrial-overlord",
  [comboKey("industrial-overlord", "resource-king")]: "resource-emperor",
  [comboKey("director", "world-planner")]: "prime-director",
  [comboKey("civilization-architect", "resource-emperor")]: "civilization-emperor",
  [comboKey("civilization-emperor", "prime-engineer")]: "the-founder",
};

export const makeCombinationKey = comboKey;

export const MANAGER_DEFINITIONS: Record<ManagerId, Omit<ManagerDefinition, "unlocked">> =
  Object.fromEntries(MANAGER_CONFIG.map((manager) => [manager.id, manager])) as Record<
    ManagerId,
    Omit<ManagerDefinition, "unlocked">
  >;

export const DEFAULT_MANAGERS: Record<ManagerId, ManagerDefinition> = Object.fromEntries(
  MANAGER_CONFIG.map((manager) => [manager.id, { ...manager, unlocked: false }]),
) as Record<ManagerId, ManagerDefinition>;

export const INITIAL_DISCOVERED_MANAGER_IDS: ManagerId[] = [
  "gatherer",
  "collector",
  "carrier",
  "worker",
];

export const DEFAULT_SLOTS: ManagerSlot[] = RESOURCE_TYPES.map((resourceType) => ({
  id: `slot-${resourceType}`,
  resourceType,
  managerId: null,
}));

export const MANAGER_UNLOCK_COSTS: Record<ManagerId, Partial<Inventory>> = {
  gatherer: { food: 10, water: 10 },
  collector: { sticks: 15, stone: 10 },
  carrier: { food: 20, sticks: 10 },
  worker: { food: 20, water: 20 },
  builder: { sticks: 30, stone: 20 },
  explorer: { food: 25, water: 25 },
  miner: { sticks: 30, stone: 30 },
  supplier: { food: 40 },
  lumberjack: { food: 50, logs: 20 },
  quarryman: { food: 40, stone: 40 },
  scout: { food: 50 },
  craftsman: { logs: 30, stone: 30 },
  engineer: { logs: 100, stone: 50 },
  prospector: { ore: 50 },
  foreman: { logs: 50, food: 50 },
  transporter: { food: 75, logs: 25 },
  "master-lumberjack": { logs: 150 },
  "deep-miner": { ore: 100 },
  "gold-digger": { ore: 75 },
  refiner: { ore: 50, gold: 25 },
  scholar: { knowledge: 50 },
  architect: { logs: 100, knowledge: 50 },
  scientist: { knowledge: 100 },
  planner: { knowledge: 75 },
  chief: { gold: 100 },
  director: { gold: 150 },
  industrialist: { gold: 200 },
  professor: { knowledge: 200 },
  "master-engineer": { knowledge: 200, gold: 100 },
  "grand-architect": { logs: 200, knowledge: 100 },
  "mining-tycoon": { gold: 300 },
  visionary: { knowledge: 300 },
  magnate: { gold: 400 },
  innovator: { knowledge: 400 },
  "infrastructure-master": { logs: 300, knowledge: 200 },
  "city-founder": { gold: 500 },
  "civilization-builder": { logs: 500, knowledge: 300 },
  "resource-king": { gold: 800 },
  mastermind: { knowledge: 800 },
  "world-planner": { knowledge: 1000 },
  "civilization-architect": { knowledge: 1200 },
  "grand-magnate": { gold: 1500 },
  "prime-engineer": { knowledge: 1500 },
  "economic-overlord": { gold: 2000 },
  "knowledge-keeper": { knowledge: 2000 },
  "industrial-overlord": { gold: 2500 },
  "resource-emperor": { gold: 3000 },
  "prime-director": { knowledge: 3000 },
  "civilization-emperor": { gold: 4000, knowledge: 4000 },
  "the-founder": { gold: 5000, knowledge: 5000 },
};

export function getManagerUnlockCost(managerId: ManagerId): Partial<Inventory> {
  return MANAGER_UNLOCK_COSTS[managerId];
}

export function getUnlockedResources(buildings: Buildings): ResourceType[] {
  return RESOURCE_TYPES.filter((resource) => {
    if (STARTING_RESOURCES.includes(resource)) {
      return true;
    }

    if (resource === "logs") {
      return buildings.lumberMillLevel > 0;
    }
    if (resource === "ore") {
      return buildings.quarryLevel > 0;
    }
    if (resource === "gold") {
      return buildings.mineLevel > 0;
    }
    return buildings.libraryLevel > 0;
  });
}

export function getHousingCapacity(buildings: Buildings) {
  return buildings.houses * 2 + buildings.apartments * 4;
}

export function getHouseCost(housesBuilt: number): Partial<Inventory> | null {
  const costs: Partial<Inventory>[] = [
    { sticks: 50, stone: 20 },
    { sticks: 75, stone: 40 },
    { sticks: 120, stone: 80 },
    { sticks: 200, stone: 120 },
  ];
  return costs[housesBuilt] ?? null;
}

export function getApartmentUpgradeCost(): Partial<Inventory> {
  return { logs: 200, stone: 100, gold: 50 };
}

export function getLumberMillBuildCost(): Partial<Inventory> {
  return { sticks: 100, stone: 50 };
}

export function getLumberMillUpgradeCost(level: number): Partial<Inventory> | null {
  const upgrades: Record<number, Partial<Inventory>> = {
    1: { sticks: 150, stone: 75 },
    2: { logs: 200, stone: 100 },
    3: { logs: 300, stone: 150 },
  };
  return upgrades[level] ?? null;
}

export function getQuarryBuildCost(): Partial<Inventory> {
  return { sticks: 150, stone: 100 };
}

export function getQuarryUpgradeCost(level: number): Partial<Inventory> | null {
  const upgrades: Record<number, Partial<Inventory>> = {
    1: { sticks: 200, stone: 150 },
    2: { logs: 250, stone: 150 },
    3: { logs: 350, stone: 200 },
  };
  return upgrades[level] ?? null;
}

export function getMineBuildCost(): Partial<Inventory> {
  return { logs: 200, ore: 100 };
}

export function getMineUpgradeCost(level: number): Partial<Inventory> | null {
  const upgrades: Record<number, Partial<Inventory>> = {
    1: { logs: 300, ore: 150 },
    2: { logs: 400, ore: 250 },
  };
  return upgrades[level] ?? null;
}

export function getLibraryBuildCost(): Partial<Inventory> {
  return { logs: 150, stone: 100, gold: 50 };
}

export function getLibraryUpgradeCost(level: number): Partial<Inventory> | null {
  const upgrades: Record<number, Partial<Inventory>> = {
    1: { logs: 250, stone: 150, gold: 100 },
    2: { logs: 400, stone: 250, gold: 150 },
  };
  return upgrades[level] ?? null;
}

export function getResourceMultiplier(buildings: Buildings, resource: ResourceType): number {
  if (resource === "logs") {
    return Number((1 + Math.max(0, buildings.lumberMillLevel - 1) * 0.25).toFixed(2));
  }
  if (resource === "ore") {
    return Number((1 + Math.max(0, buildings.quarryLevel - 1) * 0.2).toFixed(2));
  }
  if (resource === "gold") {
    return Number((1 + Math.max(0, buildings.mineLevel - 1) * 0.25).toFixed(2));
  }
  if (resource === "knowledge") {
    return Number((1 + Math.max(0, buildings.libraryLevel - 1) * 0.25).toFixed(2));
  }
  return 1;
}

export function getManagerRequirementError(managerId: ManagerId, buildings: Buildings): string | null {
  if ((managerId === "miner" || managerId === "quarryman") && buildings.quarryLevel === 0) {
    return "Requires the Quarry to be built.";
  }
  if (managerId === "lumberjack" && buildings.lumberMillLevel === 0) {
    return "Requires the Lumber Mill to be built.";
  }
  if (managerId === "scholar" && buildings.libraryLevel === 0) {
    return "Requires the Library to be built.";
  }
  return null;
}
