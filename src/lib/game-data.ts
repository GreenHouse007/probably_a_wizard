export type ResourceType = "food" | "water" | "sticks" | "stone";

export type ManagerId =
  | "basic-gatherer"
  | "gatherer"
  | "collector"
  | "builder"
  | "explorer"
  | "miner"
  | "engineer"
  | "foreman"
  | "scout"
  | "prospector"
  | "smith"
  | "architect"
  | "cartographer"
  | "driller"
  | "supply-chief"
  | "trailblazer"
  | "excavator";

export type Inventory = Record<ResourceType, number>;

export type ManagerDefinition = {
  id: ManagerId;
  name: string;
  pps: number;
  unlocked: boolean;
};

export type ManagerSlot = {
  id: string;
  resourceType: ResourceType;
  managerId: ManagerId | null;
};

export type Buildings = {
  huts: number;
};

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  food: "Food",
  water: "Water",
  sticks: "Sticks",
  stone: "Stone",
};

export const DEFAULT_INVENTORY: Inventory = {
  food: 0,
  water: 0,
  sticks: 0,
  stone: 0,
};

export const DEFAULT_BUILDINGS: Buildings = {
  huts: 0,
};

export const HUT_COST: Partial<Inventory> = {
  sticks: 12,
  stone: 8,
};

export const HUT_CAPACITY = 2;

export const MANAGER_DEFINITIONS: Record<ManagerId, Omit<ManagerDefinition, "unlocked">> = {
  "basic-gatherer": { id: "basic-gatherer", name: "Basic Gatherer", pps: 0.5 },
  gatherer: { id: "gatherer", name: "Gatherer", pps: 1 },
  collector: { id: "collector", name: "Collector", pps: 1.1 },
  builder: { id: "builder", name: "Builder", pps: 1.5 },
  explorer: { id: "explorer", name: "Explorer", pps: 1.2 },
  miner: { id: "miner", name: "Miner", pps: 1.3 },
  engineer: { id: "engineer", name: "Engineer", pps: 2 },
  foreman: { id: "foreman", name: "Foreman", pps: 1.9 },
  scout: { id: "scout", name: "Scout", pps: 1.8 },
  prospector: { id: "prospector", name: "Prospector", pps: 2 },
  smith: { id: "smith", name: "Smith", pps: 2 },
  architect: { id: "architect", name: "Architect", pps: 2.3 },
  cartographer: { id: "cartographer", name: "Cartographer", pps: 2.3 },
  driller: { id: "driller", name: "Driller", pps: 2.4 },
  "supply-chief": { id: "supply-chief", name: "Supply Chief", pps: 2.2 },
  trailblazer: { id: "trailblazer", name: "Trailblazer", pps: 2.2 },
  excavator: { id: "excavator", name: "Excavator", pps: 2.7 },
};

export const PERSON_MANAGER_IDS: ManagerId[] = ["gatherer", "collector"];

export const UNLOCK_COSTS: Partial<Record<ManagerId, Partial<Inventory>>> = {
  gatherer: { food: 10, water: 5 },
  collector: { sticks: 10, stone: 10 },
};

const comboKey = (a: ManagerId, b: ManagerId) => [a, b].sort().join("+");

export const COMBINATION_MAP: Record<string, ManagerId> = {
  [comboKey("gatherer", "collector")]: "builder",
  [comboKey("gatherer", "gatherer")]: "explorer",
  [comboKey("collector", "collector")]: "miner",
  [comboKey("builder", "explorer")]: "engineer",
  [comboKey("builder", "builder")]: "foreman",
  [comboKey("explorer", "explorer")]: "scout",
  [comboKey("miner", "explorer")]: "prospector",
  [comboKey("miner", "builder")]: "smith",
  [comboKey("engineer", "builder")]: "architect",
  [comboKey("engineer", "explorer")]: "cartographer",
  [comboKey("engineer", "miner")]: "driller",
  [comboKey("foreman", "collector")]: "supply-chief",
  [comboKey("scout", "gatherer")]: "trailblazer",
  [comboKey("driller", "foreman")]: "excavator",
};

export const makeCombinationKey = comboKey;

export const DEFAULT_MANAGERS: Record<ManagerId, ManagerDefinition> = {
  "basic-gatherer": { ...MANAGER_DEFINITIONS["basic-gatherer"], unlocked: true },
  gatherer: { ...MANAGER_DEFINITIONS.gatherer, unlocked: false },
  collector: { ...MANAGER_DEFINITIONS.collector, unlocked: false },
  builder: { ...MANAGER_DEFINITIONS.builder, unlocked: false },
  explorer: { ...MANAGER_DEFINITIONS.explorer, unlocked: false },
  miner: { ...MANAGER_DEFINITIONS.miner, unlocked: false },
  engineer: { ...MANAGER_DEFINITIONS.engineer, unlocked: false },
  foreman: { ...MANAGER_DEFINITIONS.foreman, unlocked: false },
  scout: { ...MANAGER_DEFINITIONS.scout, unlocked: false },
  prospector: { ...MANAGER_DEFINITIONS.prospector, unlocked: false },
  smith: { ...MANAGER_DEFINITIONS.smith, unlocked: false },
  architect: { ...MANAGER_DEFINITIONS.architect, unlocked: false },
  cartographer: { ...MANAGER_DEFINITIONS.cartographer, unlocked: false },
  driller: { ...MANAGER_DEFINITIONS.driller, unlocked: false },
  "supply-chief": { ...MANAGER_DEFINITIONS["supply-chief"], unlocked: false },
  trailblazer: { ...MANAGER_DEFINITIONS.trailblazer, unlocked: false },
  excavator: { ...MANAGER_DEFINITIONS.excavator, unlocked: false },
};

export const DEFAULT_SLOTS: ManagerSlot[] = [
  { id: "slot-food", resourceType: "food", managerId: null },
  { id: "slot-water", resourceType: "water", managerId: null },
  { id: "slot-sticks", resourceType: "sticks", managerId: null },
  { id: "slot-stone", resourceType: "stone", managerId: null },
];
