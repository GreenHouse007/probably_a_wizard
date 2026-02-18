// ─── Resource Chain System ──────────────────────────────────────────────────

export const CHAIN_IDS = ["food", "construction", "energy", "culture"] as const;
export type ChainId = (typeof CHAIN_IDS)[number];

export type ResourceTier = {
  id: ResourceType;
  name: string;
  tier: number;
};

export type ResourceChain = {
  id: ChainId;
  name: string;
  tiers: ResourceTier[];
};

export const RESOURCE_CHAINS: ResourceChain[] = [
  {
    id: "food",
    name: "Food",
    tiers: [
      { id: "berries", name: "Berries", tier: 1 },
      { id: "croissants", name: "Croissants", tier: 2 },
      { id: "tacos", name: "Tacos", tier: 3 },
      { id: "chocolate-cake", name: "Chocolate Cake", tier: 4 },
      { id: "sushi-platter", name: "Sushi Platter", tier: 5 },
      { id: "nectar-of-the-gods", name: "Nectar of the Gods", tier: 6 },
    ],
  },
  {
    id: "construction",
    name: "Construction",
    tiers: [
      { id: "cool-sticks", name: "Cool Sticks", tier: 1 },
      { id: "cardboard-boxes", name: "Cardboard Boxes", tier: 2 },
      { id: "power-tools", name: "Power Tools", tier: 3 },
      { id: "3d-printers", name: "3D Printers", tier: 4 },
      { id: "autonomous-builders", name: "Autonomous Builders", tier: 5 },
      { id: "nano-bots", name: "Nano Bots", tier: 6 },
    ],
  },
  {
    id: "energy",
    name: "Energy",
    tiers: [
      { id: "coal", name: "Coal", tier: 1 },
      { id: "aa-batteries", name: "AA Batteries", tier: 2 },
      { id: "caffeinated-beverage", name: "Caffeinated Beverage", tier: 3 },
      { id: "radioactive-cores", name: "Radioactive Cores", tier: 4 },
      { id: "lightning-in-a-bottle", name: "Lightning in a Bottle", tier: 5 },
      { id: "pocket-black-hole", name: "Pocket Black Hole", tier: 6 },
    ],
  },
  {
    id: "culture",
    name: "Culture",
    tiers: [
      { id: "novels", name: "Novels", tier: 1 },
      { id: "classic-movies", name: "Classic Movies", tier: 2 },
      { id: "dino-bones", name: "Dino Bones", tier: 3 },
      { id: "video-games", name: "Video Games", tier: 4 },
      { id: "artificial-intelligence", name: "Artificial Intelligence", tier: 5 },
      { id: "alien-tech", name: "Alien Tech", tier: 6 },
    ],
  },
];

export type ResourceType =
  | "berries" | "croissants" | "tacos" | "chocolate-cake" | "sushi-platter" | "nectar-of-the-gods"
  | "cool-sticks" | "cardboard-boxes" | "power-tools" | "3d-printers" | "autonomous-builders" | "nano-bots"
  | "coal" | "aa-batteries" | "caffeinated-beverage" | "radioactive-cores" | "lightning-in-a-bottle" | "pocket-black-hole"
  | "novels" | "classic-movies" | "dino-bones" | "video-games" | "artificial-intelligence" | "alien-tech";

export type Inventory = Record<ResourceType, number>;

export const DEFAULT_INVENTORY: Inventory = {
  berries: 0, croissants: 0, tacos: 0, "chocolate-cake": 0, "sushi-platter": 0, "nectar-of-the-gods": 0,
  "cool-sticks": 0, "cardboard-boxes": 0, "power-tools": 0, "3d-printers": 0, "autonomous-builders": 0, "nano-bots": 0,
  coal: 0, "aa-batteries": 0, "caffeinated-beverage": 0, "radioactive-cores": 0, "lightning-in-a-bottle": 0, "pocket-black-hole": 0,
  novels: 0, "classic-movies": 0, "dino-bones": 0, "video-games": 0, "artificial-intelligence": 0, "alien-tech": 0,
};

export const RESOURCE_LABELS: Record<ResourceType, string> = Object.fromEntries(
  RESOURCE_CHAINS.flatMap((chain) => chain.tiers.map((t) => [t.id, t.name])),
) as Record<ResourceType, string>;

export const STARTING_RESOURCES: ResourceType[] = ["berries", "cool-sticks", "coal", "novels"];

export function getChainForResource(resourceId: ResourceType): ResourceChain | undefined {
  return RESOURCE_CHAINS.find((chain) => chain.tiers.some((t) => t.id === resourceId));
}

export function getChainTierResource(chainId: ChainId, tierIndex: number): ResourceType {
  const chain = RESOURCE_CHAINS.find((c) => c.id === chainId)!;
  return chain.tiers[tierIndex].id;
}

// ─── Building System ────────────────────────────────────────────────────────

export type BuildingId =
  // Food chain
  | "bakery" | "food-truck" | "chocolate-factory" | "boat-dock" | "pirate-ship" | "divine-garden" | "forbidden-tree"
  // Construction chain
  | "tree-fort" | "hardware-store" | "fabrication-lab" | "tech-institute" | "robot-fight-club" | "secret-lab" | "nano-control-tower"
  // Energy chain
  | "electronics-store" | "coffee-shop" | "nuclear-reactor" | "wizard-tower" | "lightning-rod" | "ring-of-stones" | "dimensional-portal"
  // Culture chain
  | "culture-library" | "movie-theater" | "museum" | "nerd-store" | "data-center" | "space-center" | "rocket-ship"
  // Standalone
  | "zoo" | "haunted-house" | "greenhouse" | "train-station" | "airport";

export type BuildingDefinition = {
  id: BuildingId;
  name: string;
  chain: ChainId | null;
  buildCost: Partial<Inventory>;
  prerequisite: BuildingId | null;
  isInfrastructure: boolean;
  isStandalone: boolean;
  conversionInput: ResourceType | null;
  conversionOutput: ResourceType | null;
  conversionRatio: number;
  unlocksResource: ResourceType | null;
};

export const BUILDING_DEFINITIONS: BuildingDefinition[] = [
  // ─── Food Chain ───────────────────────────────────────────
  {
    id: "bakery", name: "Bakery", chain: "food",
    buildCost: { "cool-sticks": 300, berries: 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: false,
    conversionInput: "berries", conversionOutput: "croissants", conversionRatio: 1000,
    unlocksResource: "croissants",
  },
  {
    id: "food-truck", name: "Food Truck", chain: "food",
    buildCost: { croissants: 200, "cardboard-boxes": 100, "aa-batteries": 50 },
    prerequisite: "bakery", isInfrastructure: false, isStandalone: false,
    conversionInput: "croissants", conversionOutput: "tacos", conversionRatio: 2500,
    unlocksResource: "tacos",
  },
  {
    id: "chocolate-factory", name: "Chocolate Factory", chain: "food",
    buildCost: { tacos: 150, "power-tools": 100, "classic-movies": 50 },
    prerequisite: "food-truck", isInfrastructure: false, isStandalone: false,
    conversionInput: "tacos", conversionOutput: "chocolate-cake", conversionRatio: 5000,
    unlocksResource: "chocolate-cake",
  },
  {
    id: "boat-dock", name: "Boat Dock", chain: "food",
    buildCost: { "chocolate-cake": 100, "3d-printers": 75, "radioactive-cores": 50 },
    prerequisite: "chocolate-factory", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "pirate-ship", name: "Pirate Ship", chain: "food",
    buildCost: { "chocolate-cake": 150, "3d-printers": 100, "video-games": 50 },
    prerequisite: "boat-dock", isInfrastructure: false, isStandalone: false,
    conversionInput: "chocolate-cake", conversionOutput: "sushi-platter", conversionRatio: 10000,
    unlocksResource: "sushi-platter",
  },
  {
    id: "divine-garden", name: "Divine Garden", chain: "food",
    buildCost: { "sushi-platter": 75, "autonomous-builders": 50, "artificial-intelligence": 50 },
    prerequisite: "pirate-ship", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "forbidden-tree", name: "Forbidden Tree", chain: "food",
    buildCost: { "sushi-platter": 100, "lightning-in-a-bottle": 50, "alien-tech": 25 },
    prerequisite: "divine-garden", isInfrastructure: false, isStandalone: false,
    conversionInput: "sushi-platter", conversionOutput: "nectar-of-the-gods", conversionRatio: 25000,
    unlocksResource: "nectar-of-the-gods",
  },

  // ─── Construction Chain ───────────────────────────────────
  {
    id: "tree-fort", name: "Tree Fort", chain: "construction",
    buildCost: { "cool-sticks": 300, berries: 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: false,
    conversionInput: "cool-sticks", conversionOutput: "cardboard-boxes", conversionRatio: 1000,
    unlocksResource: "cardboard-boxes",
  },
  {
    id: "hardware-store", name: "Hardware Store", chain: "construction",
    buildCost: { "cardboard-boxes": 200, croissants: 100, "aa-batteries": 50 },
    prerequisite: "tree-fort", isInfrastructure: false, isStandalone: false,
    conversionInput: "cardboard-boxes", conversionOutput: "power-tools", conversionRatio: 2500,
    unlocksResource: "power-tools",
  },
  {
    id: "fabrication-lab", name: "Fabrication Lab", chain: "construction",
    buildCost: { "power-tools": 150, tacos: 100, "classic-movies": 50 },
    prerequisite: "hardware-store", isInfrastructure: false, isStandalone: false,
    conversionInput: "power-tools", conversionOutput: "3d-printers", conversionRatio: 5000,
    unlocksResource: "3d-printers",
  },
  {
    id: "tech-institute", name: "Tech Institute", chain: "construction",
    buildCost: { "3d-printers": 100, "chocolate-cake": 75, "radioactive-cores": 50 },
    prerequisite: "fabrication-lab", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "robot-fight-club", name: "Robot Fight Club", chain: "construction",
    buildCost: { "3d-printers": 150, "chocolate-cake": 100, "video-games": 50 },
    prerequisite: "tech-institute", isInfrastructure: false, isStandalone: false,
    conversionInput: "3d-printers", conversionOutput: "autonomous-builders", conversionRatio: 10000,
    unlocksResource: "autonomous-builders",
  },
  {
    id: "secret-lab", name: "Secret Lab", chain: "construction",
    buildCost: { "autonomous-builders": 75, "sushi-platter": 50, "artificial-intelligence": 50 },
    prerequisite: "robot-fight-club", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "nano-control-tower", name: "Nano Control Tower", chain: "construction",
    buildCost: { "autonomous-builders": 100, "lightning-in-a-bottle": 50, "alien-tech": 25 },
    prerequisite: "secret-lab", isInfrastructure: false, isStandalone: false,
    conversionInput: "autonomous-builders", conversionOutput: "nano-bots", conversionRatio: 25000,
    unlocksResource: "nano-bots",
  },

  // ─── Energy Chain ─────────────────────────────────────────
  {
    id: "electronics-store", name: "Electronics Store", chain: "energy",
    buildCost: { coal: 300, "cool-sticks": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: false,
    conversionInput: "coal", conversionOutput: "aa-batteries", conversionRatio: 1000,
    unlocksResource: "aa-batteries",
  },
  {
    id: "coffee-shop", name: "Coffee Shop", chain: "energy",
    buildCost: { "aa-batteries": 200, croissants: 100, "cardboard-boxes": 50 },
    prerequisite: "electronics-store", isInfrastructure: false, isStandalone: false,
    conversionInput: "aa-batteries", conversionOutput: "caffeinated-beverage", conversionRatio: 2500,
    unlocksResource: "caffeinated-beverage",
  },
  {
    id: "nuclear-reactor", name: "Nuclear Reactor", chain: "energy",
    buildCost: { "caffeinated-beverage": 150, tacos: 100, "classic-movies": 50 },
    prerequisite: "coffee-shop", isInfrastructure: false, isStandalone: false,
    conversionInput: "caffeinated-beverage", conversionOutput: "radioactive-cores", conversionRatio: 5000,
    unlocksResource: "radioactive-cores",
  },
  {
    id: "wizard-tower", name: "Wizard Tower", chain: "energy",
    buildCost: { "radioactive-cores": 100, "chocolate-cake": 75, "3d-printers": 50 },
    prerequisite: "nuclear-reactor", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "lightning-rod", name: "Lightning Rod", chain: "energy",
    buildCost: { "radioactive-cores": 150, "chocolate-cake": 100, "video-games": 50 },
    prerequisite: "wizard-tower", isInfrastructure: false, isStandalone: false,
    conversionInput: "radioactive-cores", conversionOutput: "lightning-in-a-bottle", conversionRatio: 10000,
    unlocksResource: "lightning-in-a-bottle",
  },
  {
    id: "ring-of-stones", name: "Ring of Stones", chain: "energy",
    buildCost: { "lightning-in-a-bottle": 75, "sushi-platter": 50, "artificial-intelligence": 50 },
    prerequisite: "lightning-rod", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "dimensional-portal", name: "Dimensional Portal", chain: "energy",
    buildCost: { "lightning-in-a-bottle": 100, "autonomous-builders": 50, "alien-tech": 25 },
    prerequisite: "ring-of-stones", isInfrastructure: false, isStandalone: false,
    conversionInput: "lightning-in-a-bottle", conversionOutput: "pocket-black-hole", conversionRatio: 25000,
    unlocksResource: "pocket-black-hole",
  },

  // ─── Culture Chain ────────────────────────────────────────
  {
    id: "culture-library", name: "Library", chain: "culture",
    buildCost: { novels: 300, "cool-sticks": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: false,
    conversionInput: "novels", conversionOutput: "classic-movies", conversionRatio: 1000,
    unlocksResource: "classic-movies",
  },
  {
    id: "movie-theater", name: "Movie Theater", chain: "culture",
    buildCost: { "classic-movies": 200, croissants: 100, "cardboard-boxes": 50 },
    prerequisite: "culture-library", isInfrastructure: false, isStandalone: false,
    conversionInput: "classic-movies", conversionOutput: "dino-bones", conversionRatio: 2500,
    unlocksResource: "dino-bones",
  },
  {
    id: "museum", name: "Museum", chain: "culture",
    buildCost: { "dino-bones": 150, tacos: 100, "aa-batteries": 50 },
    prerequisite: "movie-theater", isInfrastructure: false, isStandalone: false,
    conversionInput: "dino-bones", conversionOutput: "video-games", conversionRatio: 5000,
    unlocksResource: "video-games",
  },
  {
    id: "nerd-store", name: "Nerd Store", chain: "culture",
    buildCost: { "video-games": 100, "chocolate-cake": 75, "power-tools": 50 },
    prerequisite: "museum", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "data-center", name: "Data Center", chain: "culture",
    buildCost: { "video-games": 150, "chocolate-cake": 100, "radioactive-cores": 50 },
    prerequisite: "nerd-store", isInfrastructure: false, isStandalone: false,
    conversionInput: "video-games", conversionOutput: "artificial-intelligence", conversionRatio: 10000,
    unlocksResource: "artificial-intelligence",
  },
  {
    id: "space-center", name: "Space Center", chain: "culture",
    buildCost: { "artificial-intelligence": 75, "sushi-platter": 50, "autonomous-builders": 50 },
    prerequisite: "data-center", isInfrastructure: true, isStandalone: false,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "rocket-ship", name: "Rocket Ship", chain: "culture",
    buildCost: { "artificial-intelligence": 100, "lightning-in-a-bottle": 50, "pocket-black-hole": 25 },
    prerequisite: "space-center", isInfrastructure: false, isStandalone: false,
    conversionInput: "artificial-intelligence", conversionOutput: "alien-tech", conversionRatio: 25000,
    unlocksResource: "alien-tech",
  },

  // ─── Standalone Buildings ─────────────────────────────────
  {
    id: "zoo", name: "Zoo", chain: null,
    buildCost: { tacos: 200, "power-tools": 200, "dino-bones": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: true,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "haunted-house", name: "Haunted House", chain: null,
    buildCost: { tacos: 200, "caffeinated-beverage": 200, "dino-bones": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: true,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "greenhouse", name: "Greenhouse", chain: null,
    buildCost: { tacos: 200, "power-tools": 200, "caffeinated-beverage": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: true,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "train-station", name: "Train Station", chain: null,
    buildCost: { "chocolate-cake": 200, "3d-printers": 200, "radioactive-cores": 100 },
    prerequisite: null, isInfrastructure: false, isStandalone: true,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
  {
    id: "airport", name: "Airport", chain: null,
    buildCost: { "chocolate-cake": 500, "3d-printers": 500, "radioactive-cores": 200 },
    prerequisite: null, isInfrastructure: false, isStandalone: true,
    conversionInput: null, conversionOutput: null, conversionRatio: 0,
    unlocksResource: null,
  },
];

export function getBuildingById(id: BuildingId): BuildingDefinition | undefined {
  return BUILDING_DEFINITIONS.find((b) => b.id === id);
}

export function getBuildingsForChain(chainId: ChainId): BuildingDefinition[] {
  return BUILDING_DEFINITIONS.filter((b) => b.chain === chainId);
}

export function getStandaloneBuildings(): BuildingDefinition[] {
  return BUILDING_DEFINITIONS.filter((b) => b.isStandalone);
}

// ─── Housing System ─────────────────────────────────────────────────────────

export type HousingTier = {
  name: string;
  capacity: number;
  level: number;
};

export const HOUSING_TIERS: HousingTier[] = [
  { name: "Tent", capacity: 1, level: 1 },
  { name: "House", capacity: 2, level: 2 },
  { name: "Duplex", capacity: 4, level: 3 },
  { name: "Hotel", capacity: 8, level: 4 },
  { name: "Apartment Complex", capacity: 16, level: 5 },
  { name: "Floating City", capacity: 32, level: 6 },
  { name: "Space Station", capacity: 64, level: 7 },
];

const HOUSING_TIER_CAPACITY = [0, 1, 2, 4, 8, 16, 32, 64];

const HOUSING_UPGRADE_COSTS: Partial<Inventory>[] = [
  {}, // level 0 → nothing
  { berries: 100, "cool-sticks": 100 }, // → Tent
  { berries: 250, "cool-sticks": 250, coal: 100, novels: 100 }, // → House
  { croissants: 100, "cardboard-boxes": 100, "aa-batteries": 100, "classic-movies": 100 }, // → Duplex
  { tacos: 50, "power-tools": 50, "caffeinated-beverage": 50, "dino-bones": 50 }, // → Hotel
  { "chocolate-cake": 25, "3d-printers": 25, "radioactive-cores": 25, "video-games": 25 }, // → Apartment Complex
  { "sushi-platter": 10, "autonomous-builders": 10, "lightning-in-a-bottle": 10, "artificial-intelligence": 10 }, // → Floating City
  { "nectar-of-the-gods": 5, "nano-bots": 5, "pocket-black-hole": 5, "alien-tech": 5 }, // → Space Station
];

export function getHousingUpgradeCost(currentLevel: number, chains: number): Partial<Inventory> | null {
  const nextLevel = currentLevel + 1;
  const baseCost = HOUSING_UPGRADE_COSTS[nextLevel];
  if (!baseCost) return null;
  const multiplier = Math.max(1, chains);
  return Object.fromEntries(
    Object.entries(baseCost).map(([resource, amount]) => [resource, (amount ?? 0) * multiplier]),
  ) as Partial<Inventory>;
}

export function getNewChainCost(currentLevel: number): Partial<Inventory> | null {
  if (currentLevel === 0) return HOUSING_UPGRADE_COSTS[1] ?? null;
  return HOUSING_UPGRADE_COSTS[currentLevel] ?? null;
}

export function getHousingTierName(level: number): string {
  if (level === 0) return "None";
  return HOUSING_TIERS[level - 1]?.name ?? "Unknown";
}

// ─── Buildings State ────────────────────────────────────────────────────────

export type Buildings = {
  builtBuildings: Record<string, boolean>;
  housingLevel: number;
  housingChains: number;
};

export const DEFAULT_BUILDINGS: Buildings = {
  builtBuildings: {},
  housingLevel: 0,
  housingChains: 0,
};

export function getHousingCapacity(buildings: Buildings): number {
  return buildings.housingChains * (HOUSING_TIER_CAPACITY[buildings.housingLevel] ?? 0);
}

export function getUnlockedResources(buildings: Buildings): ResourceType[] {
  const unlocked = new Set<ResourceType>(STARTING_RESOURCES);
  for (const building of BUILDING_DEFINITIONS) {
    if (buildings.builtBuildings[building.id] && building.unlocksResource) {
      unlocked.add(building.unlocksResource);
    }
  }
  return [...unlocked];
}

export function getUnlockedTiers(chainId: ChainId, buildings: Buildings): number[] {
  const chain = RESOURCE_CHAINS.find((c) => c.id === chainId);
  if (!chain) return [0];
  const unlockedSet = new Set(getUnlockedResources(buildings));
  return chain.tiers
    .map((_, i) => i)
    .filter((i) => unlockedSet.has(chain.tiers[i].id));
}

export function isBuildingPrerequisiteMet(building: BuildingDefinition, buildings: Buildings): boolean {
  if (!building.prerequisite) return true;
  return buildings.builtBuildings[building.prerequisite] === true;
}

// ─── Manager / Character System ─────────────────────────────────────────────

export type ManagerTier = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const MANAGER_IDS = [
  "gatherer", "builder", "curious", "strange",
  "farmer", "fisher", "hunter", "toolmaker",
  "scholar", "engineer",
] as const;

export type ManagerId = (typeof MANAGER_IDS)[number];

export type ManagerDefinition = {
  id: ManagerId;
  name: string;
  pps: number;
  housingCost: number;
  tier: ManagerTier;
  unlocked: boolean;
  shortBio: string;
  fullBio: string;
};

type ManagerConfig = {
  id: ManagerId;
  name: string;
  pps: number;
  housingCost: number;
  tier: ManagerTier;
  shortBio: string;
  fullBio: string;
};

const MANAGER_CONFIG: ManagerConfig[] = [
  {
    id: "gatherer", name: "Gatherer", pps: 0.2, housingCost: 0, tier: 0,
    shortBio: "Picks up random things and insists they might be useful later. Usually right.",
    fullBio: "The Gatherer lives at the edge of everything, collecting what others overlook. To them, every stick, stone, and scrap holds potential. They don't know what they're building toward, but they trust that someday, all these small pieces will matter. And somehow, they always do.",
  },
  {
    id: "builder", name: "Builder", pps: 0.2, housingCost: 0, tier: 0,
    shortBio: "Can turn a pile of junk into a slightly more organized pile of junk.",
    fullBio: "The Builder sees structure where others see chaos. With enough time and stubbornness, they can turn raw materials into tools, tools into shelters, and shelters into civilizations. They rarely follow instructions, because they prefer discovering better ways by accident.",
  },
  {
    id: "curious", name: "Curious", pps: 0.2, housingCost: 0, tier: 0,
    shortBio: "Has pressed every button labeled \"Do Not Press.\"",
    fullBio: "The Curious one cannot resist a mystery. They poke, prod, and experiment with everything around them, often unlocking secrets others never knew existed. While their actions sometimes cause trouble, they are also responsible for nearly every great discovery.",
  },
  {
    id: "strange", name: "Strange", pps: 0.2, housingCost: 0, tier: 0,
    shortBio: "Nobody knows where they came from. Not even them.",
    fullBio: "Strange doesn't quite fit into the world. They move through reality as if they belong somewhere else entirely. Their presence causes unusual reactions, and when combined with others, unpredictable things tend to happen.",
  },
  {
    id: "farmer", name: "Farmer", pps: 0.25, housingCost: 0, tier: 1,
    shortBio: "Accidentally invented agriculture by dropping food and forgetting about it.",
    fullBio: "The Farmer learned that life can grow when given patience and care. What began as simple gathering turned into cultivation, and cultivation turned into abundance. Their work transformed survival into stability.",
  },
  {
    id: "fisher", name: "Fisher", pps: 0.25, housingCost: 0, tier: 1,
    shortBio: "Stares at water for hours. Calls it \"productive.\"",
    fullBio: "The Fisher learned that beneath still waters lies hidden life. They built tools to reach what hands alone could not grasp. Their quiet patience feeds others and expands the reach of survival.",
  },
  {
    id: "hunter", name: "Hunter", pps: 0.3, housingCost: 0, tier: 1,
    shortBio: "Tracks creatures using instinct, patience, and questionable guesses.",
    fullBio: "The Hunter moves where others cannot, following signs invisible to most. They rely on instinct sharpened by necessity. Their success ensures that survival does not depend on chance alone.",
  },
  {
    id: "toolmaker", name: "Toolmaker", pps: 0.3, housingCost: 0, tier: 1,
    shortBio: "Solves problems by making new problems that solve old problems.",
    fullBio: "The Toolmaker understands that hands alone are not enough. They create instruments that extend strength, precision, and possibility. Each new tool unlocks new ways to shape the world.",
  },
  {
    id: "scholar", name: "Scholar", pps: 0.35, housingCost: 0, tier: 2,
    shortBio: "Knows many things. Rarely useful things, but still impressive.",
    fullBio: "The Scholar collects knowledge the way others collect food. They observe patterns, record discoveries, and pass understanding forward. Their mind builds foundations no hammer ever could.",
  },
  {
    id: "engineer", name: "Engineer", pps: 0.4, housingCost: 0, tier: 2,
    shortBio: "Can fix anything. May leave behind extra screws.",
    fullBio: "The Engineer sees systems where others see parts. They understand how things work together and how to improve them. Their creations shape the future, even when they don't fully understand the consequences themselves.",
  },
];

export const MANAGER_DEFINITIONS: Record<ManagerId, Omit<ManagerDefinition, "unlocked">> =
  Object.fromEntries(MANAGER_CONFIG.map((m) => [m.id, m])) as Record<ManagerId, Omit<ManagerDefinition, "unlocked">>;

export const DEFAULT_MANAGERS: Record<ManagerId, ManagerDefinition> = Object.fromEntries(
  MANAGER_CONFIG.map((m) => [m.id, { ...m, unlocked: false }]),
) as Record<ManagerId, ManagerDefinition>;

export const INITIAL_DISCOVERED_MANAGER_IDS: ManagerId[] = ["gatherer", "builder", "curious", "strange"];
export const STARTER_MANAGER_IDS: ManagerId[] = ["gatherer", "builder", "curious", "strange"];

// ─── Manager Slots ──────────────────────────────────────────────────────────

export type ManagerSlot = {
  id: string;
  chainId: ChainId;
  managerId: ManagerId | null;
};

export const DEFAULT_SLOTS: ManagerSlot[] = CHAIN_IDS.flatMap((chainId) =>
  [0, 1, 2, 3].map((i) => ({
    id: `${chainId}-slot-${i}`,
    chainId,
    managerId: null,
  })),
);

// ─── Combination Map ────────────────────────────────────────────────────────

const comboKey = (a: ManagerId, b: ManagerId) => [a, b].sort().join("+");

export const COMBINATION_MAP: Record<string, ManagerId> = {
  [comboKey("gatherer", "gatherer")]: "farmer",
  [comboKey("gatherer", "builder")]: "fisher",
  [comboKey("gatherer", "strange")]: "hunter",
  [comboKey("builder", "farmer")]: "toolmaker",
  [comboKey("curious", "farmer")]: "scholar",
  [comboKey("builder", "toolmaker")]: "engineer",
};

export const makeCombinationKey = comboKey;

// ─── Unlock Costs ───────────────────────────────────────────────────────────

export const MANAGER_UNLOCK_COSTS: Record<ManagerId, Partial<Inventory>> = {
  gatherer: {},
  builder: {},
  curious: {},
  strange: {},
  farmer: { "cool-sticks": 50, berries: 25 },
  fisher: { "cool-sticks": 50, berries: 25 },
  hunter: { "cool-sticks": 60, berries: 30 },
  toolmaker: { "cardboard-boxes": 75 },
  scholar: { novels: 75 },
  engineer: { "power-tools": 50 },
};

export function getManagerUnlockCost(managerId: ManagerId): Partial<Inventory> {
  return MANAGER_UNLOCK_COSTS[managerId];
}

// ─── Building Manager Slots ──────────────────────────────────────────────────

export type BuildingManagerSlot = {
  id: string;
  buildingId: BuildingId;
  managerId: ManagerId | null;
};

export const DEFAULT_BUILDING_SLOTS: BuildingManagerSlot[] = BUILDING_DEFINITIONS
  .filter((b) => b.conversionInput !== null)
  .flatMap((b) => [0, 1, 2, 3].map((i) => ({
    id: `${b.id}-bslot-${i}`,
    buildingId: b.id,
    managerId: null,
  })));

// ─── Character Level System ──────────────────────────────────────────────────

export function getLevelUpResource(tier: ManagerTier): ResourceType {
  if (tier === 0) return "berries";
  if (tier === 1) return "croissants";
  if (tier === 2) return "tacos";
  return "berries";
}

export function getLevelUpCost(currentLevel: number, tier: ManagerTier): Partial<Inventory> {
  const amount = Math.floor(50 * Math.pow(1.15, currentLevel));
  const resource = getLevelUpResource(tier);
  return { [resource]: amount };
}

export function getEffectiveMultiplier(level: number): number {
  const tierBonus = level >= 100 ? 3.0 : level >= 75 ? 2.0 : level >= 50 ? 1.5 : level >= 25 ? 1.25 : 1.0;
  return (1 + level * 0.02) * tierBonus;
}

export function getLevelTierName(level: number): "default" | "bronze" | "silver" | "gold" | "legendary" {
  if (level >= 100) return "legendary";
  if (level >= 75) return "gold";
  if (level >= 50) return "silver";
  if (level >= 25) return "bronze";
  return "default";
}

export function getNextTierThreshold(level: number): number {
  if (level < 25) return 25;
  if (level < 50) return 50;
  if (level < 75) return 75;
  return 100;
}

// ─── Character Leveling (convenience helpers) ────────────────────────────────

export const MANAGER_LEVEL_MAX = 100;

/** Capitalized tier label for display (vs getLevelTierName which returns lowercase keys) */
export function getManagerLevelTierLabel(level: number): string {
  if (level >= 100) return "Legendary";
  if (level >= 75) return "Gold";
  if (level >= 50) return "Silver";
  if (level >= 25) return "Bronze";
  return "";
}
