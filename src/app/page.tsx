"use client";

import { useState, useMemo } from "react";
import { BuildingIcon, ResourceIcon, CharacterIcon } from "@/components/ui/icons";
import {
  RESOURCE_CHAINS,
  RESOURCE_LABELS,
  SOURCE_BUILDING_NAMES,
  getChainTierResource,
  getUnlockedTiers,
  getSourceBuildingTapYield,
  getSourceBuildingLevelUpCost,
  getConverterBuilding,
  isBuildingPrerequisiteMet,
  getBuildingById,
  type ChainId,
  type ManagerId,
  type ResourceType,
  type ResourceChain,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

type StoreState = ReturnType<typeof useGameStore>;

const CHAIN_ICONS: Record<ChainId, string> = {
  food: "🍎",
  construction: "🔨",
  energy: "⚡",
  culture: "📚",
};

const TAB_SHORT_NAMES: Record<ResourceType, string> = {
  berries: "Berries",
  croissants: "Croissants",
  tacos: "Tacos",
  "chocolate-cake": "Cake",
  "sushi-platter": "Sushi",
  "nectar-of-the-gods": "Nectar",
  "cool-sticks": "Sticks",
  "cardboard-boxes": "Boxes",
  "power-tools": "Tools",
  "3d-printers": "Printers",
  "autonomous-builders": "Builders",
  "nano-bots": "Nano",
  coal: "Coal",
  "aa-batteries": "Batteries",
  "caffeinated-beverage": "Caffeine",
  "radioactive-cores": "Radioactive",
  "lightning-in-a-bottle": "Lightning",
  "pocket-black-hole": "Black Hole",
  novels: "Novels",
  "classic-movies": "Movies",
  "dino-bones": "Dino",
  "video-games": "Games",
  "artificial-intelligence": "AI",
  "alien-tech": "Alien",
};

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export default function ResourcesPage() {
  const {
    inventory,
    addResource,
    slots,
    buildingSlots,
    managers,
    discoveredManagerIds,
    assignManagerToSlot,
    assignManagerToBuildingSlot,
    getEffectivePps,
    buildings,
    buildBuilding,
    convertResource,
    sourceBuildingLevels,
    levelUpSourceBuilding,
  } = useGameStore();

  const [activeTiers, setActiveTiers] = useState<Record<ChainId, number>>({
    food: 0,
    construction: 0,
    energy: 0,
    culture: 0,
  });

  const allAssignedManagerIds = useMemo(
    () => [
      ...slots.flatMap((s) => (s.managerId ? [s.managerId] : [])),
      ...buildingSlots.flatMap((s) => (s.managerId ? [s.managerId] : [])),
    ],
    [slots, buildingSlots],
  );

  const unlockedManagerIds = discoveredManagerIds.filter((id) => managers[id]?.unlocked);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Resources</h1>
        <p className="text-violet-200/80">Gather materials from 4 resource chains.</p>
      </header>

      <div className="space-y-4">
        {RESOURCE_CHAINS.map((chain) => (
          <ChainCard
            key={chain.id}
            chain={chain}
            activeTierIndex={activeTiers[chain.id]}
            onSelectTier={(i) => setActiveTiers((prev) => ({ ...prev, [chain.id]: i }))}
            inventory={inventory}
            buildings={buildings}
            slots={slots}
            buildingSlots={buildingSlots}
            managers={managers}
            unlockedManagerIds={unlockedManagerIds}
            allAssignedManagerIds={allAssignedManagerIds}
            sourceBuildingLevels={sourceBuildingLevels}
            addResource={addResource}
            buildBuilding={buildBuilding}
            convertResource={convertResource}
            levelUpSourceBuilding={levelUpSourceBuilding}
            assignManagerToSlot={assignManagerToSlot}
            assignManagerToBuildingSlot={assignManagerToBuildingSlot}
            getEffectivePps={getEffectivePps}
          />
        ))}
      </div>
    </main>
  );
}

function ChainCard({
  chain,
  activeTierIndex,
  onSelectTier,
  inventory,
  buildings,
  slots,
  buildingSlots,
  managers,
  unlockedManagerIds,
  allAssignedManagerIds,
  sourceBuildingLevels,
  addResource,
  buildBuilding,
  convertResource,
  levelUpSourceBuilding,
  assignManagerToSlot,
  assignManagerToBuildingSlot,
  getEffectivePps,
}: {
  chain: ResourceChain;
  activeTierIndex: number;
  onSelectTier: (i: number) => void;
  inventory: StoreState["inventory"];
  buildings: StoreState["buildings"];
  slots: StoreState["slots"];
  buildingSlots: StoreState["buildingSlots"];
  managers: StoreState["managers"];
  unlockedManagerIds: ManagerId[];
  allAssignedManagerIds: ManagerId[];
  sourceBuildingLevels: StoreState["sourceBuildingLevels"];
  addResource: StoreState["addResource"];
  buildBuilding: StoreState["buildBuilding"];
  convertResource: StoreState["convertResource"];
  levelUpSourceBuilding: StoreState["levelUpSourceBuilding"];
  assignManagerToSlot: StoreState["assignManagerToSlot"];
  assignManagerToBuildingSlot: StoreState["assignManagerToBuildingSlot"];
  getEffectivePps: StoreState["getEffectivePps"];
}) {
  const unlockedTierIndices = getUnlockedTiers(chain.id, buildings);
  const effectiveTierIndex = unlockedTierIndices.includes(activeTierIndex) ? activeTierIndex : 0;
  const activeResource = getChainTierResource(chain.id, effectiveTierIndex);
  const activeTier = chain.tiers[effectiveTierIndex];
  const isT1 = effectiveTierIndex === 0;

  // Source building
  const sourceBuildingLevel = sourceBuildingLevels[chain.id];
  const tapYield = getSourceBuildingTapYield(sourceBuildingLevel);
  const tier1ResourceId = getChainTierResource(chain.id, 0);
  const levelUpCost = getSourceBuildingLevelUpCost(sourceBuildingLevel, chain.id);
  const levelUpCostAmount = levelUpCost[tier1ResourceId] ?? 0;
  const canAffordLevelUp = inventory[tier1ResourceId] >= levelUpCostAmount;

  // Converter building (T2+)
  const converterBuilding = isT1 ? undefined : getConverterBuilding(activeResource);
  const isBuilt = converterBuilding ? !!buildings.builtBuildings[converterBuilding.id] : false;
  const prereqMet = converterBuilding ? isBuildingPrerequisiteMet(converterBuilding, buildings) : false;
  const canAffordBuild = converterBuilding
    ? Object.entries(converterBuilding.buildCost).every(([r, a]) => inventory[r as ResourceType] >= (a ?? 0))
    : false;

  // Manager slots
  const chainSlots = slots.filter((s) => s.chainId === chain.id);
  const convBuildingSlots = converterBuilding
    ? buildingSlots.filter((s) => s.buildingId === converterBuilding.id)
    : [];

  const chainTotalPps = chainSlots.reduce((sum, s) => sum + (s.managerId ? getEffectivePps(s.managerId) : 0), 0);
  const convTotalPps = convBuildingSlots.reduce((sum, s) => sum + (s.managerId ? getEffectivePps(s.managerId) : 0), 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200/20 bg-violet-900/30 shadow-lg shadow-violet-950/40">
      {/* Card header: chain label + tier tabs */}
      <div className="flex items-stretch border-b border-violet-200/15">
        <div className="flex shrink-0 items-center gap-2 border-r border-violet-200/15 px-4 py-3">
          <span className="text-base">{CHAIN_ICONS[chain.id]}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300">{chain.name}</span>
        </div>
        <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-2">
          {chain.tiers.map((tier, i) => {
            const unlocked = unlockedTierIndices.includes(i);
            const isActive = effectiveTierIndex === i;
            return (
              <button
                key={tier.id}
                type="button"
                disabled={!unlocked}
                onClick={() => onSelectTier(i)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-violet-800/50 text-violet-50"
                    : unlocked
                      ? "text-violet-300/70 hover:bg-violet-800/30 hover:text-violet-100"
                      : "cursor-not-allowed text-violet-500/25"
                }`}
              >
                {TAB_SHORT_NAMES[tier.id] ?? tier.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Card body */}
      <div className="space-y-3 p-4">
        {/* Hint */}
        <p className="text-xs text-violet-300/50">{isT1 ? "Tap to gather" : "Tap to convert"}</p>

        {/* Resource row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ResourceIcon resource={activeResource} />
            <span className="text-xl font-bold text-violet-100">{activeTier.name}</span>
          </div>
          <span className="text-3xl font-bold tabular-nums text-violet-50">
            {formatAmount(inventory[activeResource])}
          </span>
        </div>

        {/* Flavor text */}
        {activeTier.flavorText && (
          <p className="text-sm italic text-violet-300/55">{activeTier.flavorText}</p>
        )}

        {isT1 ? (
          <>
            {/* Source building card */}
            <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-200">{SOURCE_BUILDING_NAMES[chain.id]}</span>
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-300/80">
                    Lv. {sourceBuildingLevel}
                  </span>
                </div>
                <span className="text-xs text-emerald-300">Tap yields: +{tapYield.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-emerald-300/60">
                  Cost: {formatAmount(levelUpCostAmount)} {RESOURCE_LABELS[tier1ResourceId]}
                </span>
                <button
                  type="button"
                  disabled={!canAffordLevelUp}
                  onClick={() => {
                    const result = levelUpSourceBuilding(chain.id);
                    if (!result.ok) window.alert(result.reason);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    canAffordLevelUp
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "cursor-not-allowed bg-violet-900/50 text-violet-400"
                  }`}
                >
                  Level Up — {formatAmount(levelUpCostAmount)} {RESOURCE_LABELS[tier1ResourceId]}
                </button>
              </div>
            </div>

            {/* Tap button */}
            <button
              type="button"
              onClick={() => addResource(activeResource, tapYield)}
              className="w-full rounded-xl bg-violet-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-violet-500 active:scale-95"
            >
              Tap to Gather +{tapYield.toFixed(2)}
            </button>

            {/* Gathering managers */}
            <ManagerSlotsSection
              label="Auto-Gathering"
              emptyText="Assign managers to auto-gather"
              slots={chainSlots}
              totalPps={chainTotalPps}
              managers={managers}
              unlockedManagerIds={unlockedManagerIds}
              allAssignedManagerIds={allAssignedManagerIds}
              onAssign={(slotId, managerId) => {
                const result = assignManagerToSlot(slotId, managerId);
                if (!result.ok) window.alert(result.reason);
              }}
              getEffectivePps={getEffectivePps}
            />
          </>
        ) : (
          <>
            {/* Info pills row */}
            <div className="flex flex-wrap gap-3">
              {/* Source building pill */}
              <div className="rounded-xl border border-emerald-300/20 bg-emerald-950/25 px-3 py-2">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-emerald-200">{SOURCE_BUILDING_NAMES[chain.id]}</span>
                  <span className="rounded-full bg-emerald-900/50 px-1.5 py-0.5 text-[10px] text-emerald-300/80">
                    Lv. {sourceBuildingLevel}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={!canAffordLevelUp}
                  onClick={() => {
                    const result = levelUpSourceBuilding(chain.id);
                    if (!result.ok) window.alert(result.reason);
                  }}
                  className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                    canAffordLevelUp
                      ? "bg-violet-600 text-white hover:bg-violet-500"
                      : "cursor-not-allowed bg-violet-900/50 text-violet-400"
                  }`}
                >
                  Level Up · {formatAmount(levelUpCostAmount)} {RESOURCE_LABELS[tier1ResourceId]}
                </button>
              </div>

              {/* Converter building pill */}
              {converterBuilding && (
                <div
                  className={`rounded-xl border px-3 py-2 ${
                    isBuilt ? "border-violet-300/20 bg-violet-950/25" : "border-amber-300/25 bg-amber-950/25"
                  }`}
                >
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <BuildingIcon buildingId={converterBuilding.id} size={32} />
                    <span className={`text-xs font-semibold ${isBuilt ? "text-violet-200" : "text-amber-200"}`}>
                      {converterBuilding.name}
                    </span>
                    {isBuilt ? (
                      <span className="rounded-full bg-emerald-600/30 px-1.5 py-0.5 text-[10px] text-emerald-300">
                        Built ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-400/80">Not Built</span>
                    )}
                  </div>
                  {isBuilt ? (
                    <button
                      type="button"
                      disabled={inventory[converterBuilding.conversionInput!] < converterBuilding.conversionRatio}
                      onClick={() => {
                        const result = convertResource(converterBuilding.id);
                        if (!result.ok) window.alert(result.reason);
                      }}
                      className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                        inventory[converterBuilding.conversionInput!] >= converterBuilding.conversionRatio
                          ? "bg-violet-600 text-white hover:bg-violet-500"
                          : "cursor-not-allowed bg-violet-900/50 text-violet-400"
                      }`}
                    >
                      Convert Now
                    </button>
                  ) : !prereqMet && converterBuilding.prerequisite ? (
                    <p className="text-[10px] text-amber-400/60">
                      Needs: {getBuildingById(converterBuilding.prerequisite)?.name ?? converterBuilding.prerequisite}
                    </p>
                  ) : (
                    <>
                      <div className="mb-1.5 space-y-0.5">
                        {Object.entries(converterBuilding.buildCost).map(([res, amt]) => {
                          const have = inventory[res as ResourceType];
                          const need = amt ?? 0;
                          const met = have >= need;
                          return (
                            <p key={res} className={`text-[10px] ${met ? "text-emerald-400/80" : "text-amber-300/70"}`}>
                              {met ? "✓" : "✗"} {formatAmount(need)} {RESOURCE_LABELS[res as ResourceType]}
                              {!met && <span className="text-amber-400/50"> ({formatAmount(have)} have)</span>}
                            </p>
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        disabled={!canAffordBuild}
                        onClick={() => {
                          const result = buildBuilding(converterBuilding.id);
                          if (!result.ok) window.alert(result.reason);
                        }}
                        className={`rounded-md px-2 py-1 text-xs font-medium transition ${
                          canAffordBuild
                            ? "bg-amber-700 text-white hover:bg-amber-600"
                            : "cursor-not-allowed bg-amber-900/50 text-amber-400"
                        }`}
                      >
                        Build
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Conversion rate */}
              {converterBuilding && (
                <div className="flex flex-col justify-center">
                  <p className="mb-1 text-[10px] text-violet-300/50">Conversion Rate</p>
                  <p className="text-xs text-violet-200">
                    {formatAmount(converterBuilding.conversionRatio)}{" "}
                    {RESOURCE_LABELS[converterBuilding.conversionInput!]} → 1{" "}
                    {RESOURCE_LABELS[converterBuilding.conversionOutput!]}
                  </p>
                </div>
              )}
            </div>

            {/* Auto-convert managers (only when building is built) */}
            {converterBuilding && isBuilt && (
              <ManagerSlotsSection
                label="Auto-Convert"
                emptyText="Assign managers to auto-convert"
                slots={convBuildingSlots}
                totalPps={convTotalPps}
                managers={managers}
                unlockedManagerIds={unlockedManagerIds}
                allAssignedManagerIds={allAssignedManagerIds}
                onAssign={(slotId, managerId) => {
                  const result = assignManagerToBuildingSlot(slotId, managerId);
                  if (!result.ok) window.alert(result.reason);
                }}
                getEffectivePps={getEffectivePps}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ManagerSlotsSection({
  label,
  emptyText,
  slots,
  totalPps,
  managers,
  unlockedManagerIds,
  allAssignedManagerIds,
  onAssign,
  getEffectivePps,
}: {
  label: string;
  emptyText: string;
  slots: Array<{ id: string; managerId: ManagerId | null }>;
  totalPps: number;
  managers: Record<string, { id: ManagerId; name: string; unlocked: boolean }>;
  unlockedManagerIds: ManagerId[];
  allAssignedManagerIds: ManagerId[];
  onAssign: (slotId: string, managerId: ManagerId | null) => void;
  getEffectivePps: (managerId: ManagerId) => number;
}) {
  return (
    <div className="border-t border-violet-200/15 pt-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-300">{label}</p>
        {totalPps > 0 && (
          <span className="text-xs text-violet-200/70">Total: {totalPps.toFixed(2)}/s</span>
        )}
      </div>
      <div className="flex gap-3">
        {slots.map((slot) => (
          <ManagerSlotButton
            key={slot.id}
            slot={slot}
            managers={managers}
            unlockedManagerIds={unlockedManagerIds}
            assignedManagerIds={allAssignedManagerIds}
            onAssign={(managerId) => onAssign(slot.id, managerId)}
            getEffectivePps={getEffectivePps}
          />
        ))}
      </div>
      {totalPps === 0 && (
        <p className="mt-2 text-xs text-violet-200/50">{emptyText}</p>
      )}
    </div>
  );
}

function ManagerSlotButton({
  slot,
  managers,
  unlockedManagerIds,
  assignedManagerIds,
  onAssign,
  getEffectivePps,
}: {
  slot: { id: string; managerId: ManagerId | null };
  managers: Record<string, { id: ManagerId; name: string; unlocked: boolean }>;
  unlockedManagerIds: ManagerId[];
  assignedManagerIds: ManagerId[];
  onAssign: (managerId: ManagerId | null) => void;
  getEffectivePps: (managerId: ManagerId) => number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const assignedManager = slot.managerId ? managers[slot.managerId] : null;

  const availableManagerIds = useMemo(
    () => unlockedManagerIds.filter((id) => id === slot.managerId || !assignedManagerIds.includes(id)),
    [assignedManagerIds, unlockedManagerIds, slot.managerId],
  );

  const effectivePps = assignedManager ? getEffectivePps(assignedManager.id) : 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((c) => !c)}
        className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-violet-200/40 bg-violet-950/40"
        aria-label={assignedManager ? `Change ${assignedManager.name}` : "Assign manager"}
      >
        {assignedManager ? (
          <CharacterIcon managerId={assignedManager.id} />
        ) : (
          <span className="text-2xl text-violet-200">+</span>
        )}
      </button>
      {assignedManager && (
        <p className="mt-1 text-center text-[10px] text-violet-200/70">{effectivePps.toFixed(2)}/s</p>
      )}

      {menuOpen && (
        <div className="absolute left-0 top-16 z-10 min-w-48 rounded-xl border border-violet-200/25 bg-violet-950 p-2 shadow-2xl">
          {assignedManager && (
            <button
              type="button"
              onClick={() => { onAssign(null); setMenuOpen(false); }}
              className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-violet-200 hover:bg-violet-800/60"
            >
              Clear slot
            </button>
          )}
          {availableManagerIds.length === 0 ? (
            <p className="px-3 py-2 text-xs text-violet-300/80">No available managers</p>
          ) : (
            availableManagerIds.map((managerId) => (
              <button
                key={managerId}
                type="button"
                onClick={() => { onAssign(managerId); setMenuOpen(false); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-violet-100 hover:bg-violet-800/60"
              >
                <CharacterIcon managerId={managerId} />
                <span>{managers[managerId].name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
