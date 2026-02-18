"use client";

import { useState, useMemo } from "react";
import { ResourceIcon, CharacterIcon } from "@/components/ui/icons";
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
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

const CHAIN_ICONS: Record<ChainId, string> = {
  food: "🍎",
  construction: "🔨",
  energy: "⚡",
  culture: "📚",
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

  const [activeChain, setActiveChain] = useState<ChainId>("food");
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const chain = RESOURCE_CHAINS.find((c) => c.id === activeChain)!;
  const unlockedTierIndices = getUnlockedTiers(activeChain, buildings);
  const effectiveTierIndex = unlockedTierIndices.includes(activeTierIndex) ? activeTierIndex : 0;
  const activeResource = getChainTierResource(activeChain, effectiveTierIndex);
  const activeTier = chain.tiers[effectiveTierIndex];
  const isT1 = effectiveTierIndex === 0;

  // Source building (Tier 1)
  const sourceBuildingLevel = sourceBuildingLevels[activeChain];
  const tapYield = getSourceBuildingTapYield(sourceBuildingLevel);
  const tier1ResourceId = getChainTierResource(activeChain, 0);
  const levelUpCost = getSourceBuildingLevelUpCost(sourceBuildingLevel, activeChain);
  const levelUpCostAmount = levelUpCost[tier1ResourceId] ?? 0;
  const canAffordLevelUp = inventory[tier1ResourceId] >= levelUpCostAmount;

  // Converter building (Tier 2+)
  const converterBuilding = isT1 ? undefined : getConverterBuilding(activeResource);
  const isBuilt = converterBuilding ? !!buildings.builtBuildings[converterBuilding.id] : false;
  const prereqMet = converterBuilding ? isBuildingPrerequisiteMet(converterBuilding, buildings) : false;
  const canAffordBuild = converterBuilding
    ? Object.entries(converterBuilding.buildCost).every(([r, a]) => inventory[r as ResourceType] >= (a ?? 0))
    : false;

  // Slots
  const chainSlots = slots.filter((s) => s.chainId === activeChain);
  const convBuildingSlots = converterBuilding
    ? buildingSlots.filter((s) => s.buildingId === converterBuilding.id)
    : [];

  // Combined assigned IDs across all slot types for the dropdown available-list
  const allAssignedManagerIds = useMemo(
    () => [
      ...slots.flatMap((s) => (s.managerId ? [s.managerId] : [])),
      ...buildingSlots.flatMap((s) => (s.managerId ? [s.managerId] : [])),
    ],
    [slots, buildingSlots],
  );

  const unlockedManagerIds = discoveredManagerIds.filter((id) => managers[id]?.unlocked);

  const chainTotalPps = useMemo(
    () => chainSlots.reduce((sum, s) => sum + (s.managerId ? getEffectivePps(s.managerId) : 0), 0),
    [chainSlots, getEffectivePps],
  );

  const convTotalPps = useMemo(
    () => convBuildingSlots.reduce((sum, s) => sum + (s.managerId ? getEffectivePps(s.managerId) : 0), 0),
    [convBuildingSlots, getEffectivePps],
  );

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Resources</h1>
        <p className="text-violet-200/80">Gather materials from 4 resource chains.</p>
      </header>

      {/* Chain tabs */}
      <div className="flex gap-2">
        {RESOURCE_CHAINS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setActiveChain(c.id); setActiveTierIndex(0); }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeChain === c.id
                ? "bg-violet-300 text-violet-950"
                : "text-violet-100 hover:bg-violet-200/15"
            }`}
          >
            <span>{CHAIN_ICONS[c.id]}</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Tier sub-tabs */}
      <div className="flex gap-1.5">
        {chain.tiers.map((tier, i) => {
          const unlocked = unlockedTierIndices.includes(i);
          return (
            <button
              key={tier.id}
              type="button"
              disabled={!unlocked}
              onClick={() => setActiveTierIndex(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                effectiveTierIndex === i
                  ? "bg-violet-500/40 text-violet-50"
                  : unlocked
                    ? "text-violet-200 hover:bg-violet-200/10"
                    : "cursor-not-allowed text-violet-400/30"
              }`}
            >
              T{tier.tier} {tier.name}
            </button>
          );
        })}
      </div>

      {/* Main card */}
      <div className="rounded-2xl border border-violet-200/25 bg-violet-900/30 p-5 shadow-lg shadow-violet-950/40">
        {/* Resource header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ResourceIcon resource={activeResource} />
            <span className="text-xl font-semibold text-violet-100">{activeTier.name}</span>
          </div>
          <span className="text-4xl font-bold text-violet-50">{formatAmount(inventory[activeResource])}</span>
        </div>
        {activeTier.flavorText && (
          <p className="mb-4 text-sm text-violet-300/70">{activeTier.flavorText}</p>
        )}

        {isT1 ? (
          <>
            {/* Source building card */}
            <div className="mb-4 rounded-xl border border-emerald-300/25 bg-emerald-950/30 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-emerald-200">{SOURCE_BUILDING_NAMES[activeChain]}</span>
                  <span className="rounded-full bg-emerald-900/50 px-2 py-0.5 text-xs text-emerald-300/80">Lv. {sourceBuildingLevel}</span>
                </div>
                <span className="text-xs text-emerald-300">Tap yields: +{tapYield.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-emerald-300/60">
                  Cost: {formatAmount(levelUpCostAmount)} {RESOURCE_LABELS[tier1ResourceId]}
                </span>
                <button
                  type="button"
                  disabled={!canAffordLevelUp}
                  onClick={() => {
                    const result = levelUpSourceBuilding(activeChain);
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
              className="mb-5 w-full rounded-xl bg-violet-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-violet-500 active:scale-95"
            >
              Tap to Gather +{tapYield.toFixed(2)}
            </button>

            {/* Gathering managers */}
            <div className="border-t border-violet-200/15 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Auto-Gathering</p>
                {chainTotalPps > 0 && (
                  <span className="text-xs text-violet-200/70">Total: {chainTotalPps.toFixed(2)}/s</span>
                )}
              </div>
              <div className="flex gap-3">
                {chainSlots.map((slot) => (
                  <ManagerSlotButton
                    key={slot.id}
                    slot={slot}
                    managers={managers}
                    unlockedManagerIds={unlockedManagerIds}
                    assignedManagerIds={allAssignedManagerIds}
                    onAssign={(managerId) => {
                      const result = assignManagerToSlot(slot.id, managerId);
                      if (!result.ok) window.alert(result.reason);
                    }}
                    getEffectivePps={getEffectivePps}
                  />
                ))}
              </div>
              {chainTotalPps === 0 && (
                <p className="mt-2 text-xs text-violet-200/50">Assign managers to auto-gather</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Converter building card */}
            {converterBuilding ? (
              isBuilt ? (
                <div className="mb-4 rounded-xl border border-violet-300/25 bg-violet-950/30 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-violet-200">{converterBuilding.name}</span>
                    <span className="rounded-full bg-emerald-600/30 px-2 py-0.5 text-xs text-emerald-300">Built</span>
                  </div>
                  <p className="mb-1 text-xs text-violet-300/70">
                    {formatAmount(converterBuilding.conversionRatio)} {RESOURCE_LABELS[converterBuilding.conversionInput!]} → 1 {RESOURCE_LABELS[converterBuilding.conversionOutput!]}
                  </p>
                  <p className="mb-3 text-xs text-violet-300/50">
                    Available: {formatAmount(inventory[converterBuilding.conversionInput!])} {RESOURCE_LABELS[converterBuilding.conversionInput!]}
                  </p>
                  <button
                    type="button"
                    disabled={inventory[converterBuilding.conversionInput!] < converterBuilding.conversionRatio}
                    onClick={() => {
                      const result = convertResource(converterBuilding.id);
                      if (!result.ok) window.alert(result.reason);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                      inventory[converterBuilding.conversionInput!] >= converterBuilding.conversionRatio
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "cursor-not-allowed bg-violet-900/50 text-violet-400"
                    }`}
                  >
                    Convert Now
                  </button>
                </div>
              ) : (
                <div className="mb-4 rounded-xl border border-amber-300/25 bg-amber-950/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-200">{converterBuilding.name}</span>
                    <span className="text-xs text-amber-400/80">Not Built</span>
                  </div>
                  <div className="mb-3 space-y-0.5">
                    {Object.entries(converterBuilding.buildCost).map(([res, amt]) => (
                      <p
                        key={res}
                        className={`text-xs ${inventory[res as ResourceType] >= (amt ?? 0) ? "text-emerald-300" : "text-amber-200/70"}`}
                      >
                        {formatAmount(amt ?? 0)} {RESOURCE_LABELS[res as ResourceType]}
                        {inventory[res as ResourceType] < (amt ?? 0) && (
                          <span className="text-amber-400/60"> (have {formatAmount(inventory[res as ResourceType])})</span>
                        )}
                      </p>
                    ))}
                  </div>
                  {!prereqMet && converterBuilding.prerequisite ? (
                    <p className="text-xs text-amber-400/60">
                      Requires: {getBuildingById(converterBuilding.prerequisite)?.name ?? converterBuilding.prerequisite}
                    </p>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAffordBuild}
                      onClick={() => {
                        const result = buildBuilding(converterBuilding.id);
                        if (!result.ok) window.alert(result.reason);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                        canAffordBuild
                          ? "bg-amber-700 text-white hover:bg-amber-600"
                          : "cursor-not-allowed bg-amber-900/50 text-amber-400"
                      }`}
                    >
                      Build
                    </button>
                  )}
                </div>
              )
            ) : (
              <p className="mb-4 text-sm text-violet-300/50">No converter building for this resource.</p>
            )}

            {/* Auto-convert managers (only shown when building is built) */}
            {converterBuilding && isBuilt && (
              <div className="border-t border-violet-200/15 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-violet-300">Auto-Convert</p>
                  {convTotalPps > 0 && (
                    <span className="text-xs text-violet-200/70">~{convTotalPps.toFixed(2)} conv/s</span>
                  )}
                </div>
                <div className="flex gap-3">
                  {convBuildingSlots.map((slot) => (
                    <ManagerSlotButton
                      key={slot.id}
                      slot={slot}
                      managers={managers}
                      unlockedManagerIds={unlockedManagerIds}
                      assignedManagerIds={allAssignedManagerIds}
                      onAssign={(managerId) => {
                        const result = assignManagerToBuildingSlot(slot.id, managerId);
                        if (!result.ok) window.alert(result.reason);
                      }}
                      getEffectivePps={getEffectivePps}
                    />
                  ))}
                </div>
                {convTotalPps === 0 && (
                  <p className="mt-2 text-xs text-violet-200/50">Assign managers to auto-convert</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
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
