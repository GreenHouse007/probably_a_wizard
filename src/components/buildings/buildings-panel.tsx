"use client";

import { useState, useMemo } from "react";
import { BuildingIcon, CharacterIcon, ResourceIcon } from "@/components/ui/icons";
import {
  HOUSING_TIERS,
  RESOURCE_CHAINS,
  RESOURCE_LABELS,
  getBuildingsForChain,
  getBuildingById,
  getHousingBuildCost,
  getStandaloneBuildings,
  isBuildingPrerequisiteMet,
  type BuildingDefinition,
  type BuildingId,
  type BuildingManagerSlot,
  type ChainId,
  type Inventory,
  type ManagerId,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

const CHAIN_ICONS: Record<ChainId, string> = {
  food: "🍎",
  construction: "🔨",
  energy: "⚡",
  culture: "📚",
};

type ActiveTab = ChainId | "standalone";

function formatCosts(costs: Partial<Inventory>): string {
  return Object.entries(costs)
    .map(([resource, amount]) => `${amount} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`)
    .join(" + ");
}

function canAffordCost(inventory: Inventory, costs: Partial<Inventory>): boolean {
  return Object.entries(costs).every(
    ([resource, amount]) => inventory[resource as keyof Inventory] >= (amount ?? 0),
  );
}

export function BuildingsPanel() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("food");

  const {
    buildings,
    inventory,
    buildingSlots,
    assignManagerToBuildingSlot,
    buildBuilding,
    convertResource,
    buildHousing,
    managers,
    discoveredManagerIds,
    slots,
    housedPeople,
    housingCapacity,
  } = useGameStore();

  const unlockedManagerIds = discoveredManagerIds.filter((id) => managers[id]?.unlocked);

  const allAssignedManagerIds = useMemo(() => {
    const ids = new Set<ManagerId>();
    for (const slot of slots) {
      if (slot.managerId) ids.add(slot.managerId);
    }
    for (const bSlot of buildingSlots) {
      if (bSlot.managerId) ids.add(bSlot.managerId);
    }
    return ids;
  }, [slots, buildingSlots]);

  const displayBuildings =
    activeTab === "standalone"
      ? getStandaloneBuildings()
      : getBuildingsForChain(activeTab as ChainId);

  return (
    <div className="space-y-4">
      {/* Housing */}
      <HousingSection
        buildings={buildings}
        inventory={inventory}
        housedPeople={housedPeople}
        housingCapacity={housingCapacity}
        buildHousing={buildHousing}
      />

      {/* Chain tabs */}
      <div className="flex flex-wrap gap-2">
        {RESOURCE_CHAINS.map((chain) => (
          <button
            key={chain.id}
            type="button"
            onClick={() => setActiveTab(chain.id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === chain.id
                ? "bg-violet-300 text-violet-950"
                : "text-violet-100 hover:bg-violet-200/15"
            }`}
          >
            <span>{CHAIN_ICONS[chain.id]}</span>
            <span>{chain.name}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveTab("standalone")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeTab === "standalone"
              ? "bg-violet-300 text-violet-950"
              : "text-violet-100 hover:bg-violet-200/15"
          }`}
        >
          <span>🏛️</span>
          <span>Special</span>
        </button>
      </div>

      {/* Building list */}
      <div className="space-y-3">
        {displayBuildings.map((building) => {
          const built = !!buildings.builtBuildings[building.id];
          const prereqMet = isBuildingPrerequisiteMet(building, buildings);
          const affordable = canAffordCost(inventory, building.buildCost);
          const slotsForBuilding = buildingSlots.filter((s) => s.buildingId === building.id);

          if (building.isStandalone) {
            return (
              <StandaloneBuildingCard
                key={building.id}
                building={building}
                built={built}
                affordable={affordable}
                inventory={inventory}
                onBuild={() => {
                  const result = buildBuilding(building.id);
                  if (!result.ok) window.alert(result.reason);
                }}
              />
            );
          }

          return (
            <BuildingCard
              key={building.id}
              building={building}
              built={built}
              prereqMet={prereqMet}
              affordable={affordable}
              inventory={inventory}
              buildingSlots={slotsForBuilding}
              managers={managers}
              unlockedManagerIds={unlockedManagerIds}
              allAssignedManagerIds={allAssignedManagerIds}
              onBuild={() => {
                const result = buildBuilding(building.id);
                if (!result.ok) window.alert(result.reason);
              }}
              onConvert={() => convertResource(building.id)}
              onAssignManager={(slotId, managerId) => {
                const result = assignManagerToBuildingSlot(slotId, managerId);
                if (!result.ok) window.alert(result.reason);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Housing Section ──────────────────────────────────────────────────────────

function HousingSection({
  buildings,
  inventory,
  housedPeople,
  housingCapacity,
  buildHousing,
}: {
  buildings: { builtBuildings: Record<string, boolean>; housingCounts: number[] };
  inventory: Inventory;
  housedPeople: number;
  housingCapacity: number;
  buildHousing: (tierIndex: number) => { ok: boolean; reason?: string };
}) {
  return (
    <div className="rounded-2xl border border-violet-300/25 bg-violet-900/25 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-violet-100">Housing</h2>
        <span className="rounded-full bg-violet-800/60 px-3 py-0.5 text-xs text-violet-200">
          {housedPeople}/{housingCapacity} housed
        </span>
      </div>

      {/* 7-tier grid */}
      <div className="space-y-2">
        {HOUSING_TIERS.map((tier, i) => {
          const count = buildings.housingCounts[i] ?? 0;
          const isMax = count >= 4;
          const cost = getHousingBuildCost(i, count);
          const affordable = cost ? canAffordCost(inventory, cost) : false;

          return (
            <div
              key={tier.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-violet-200/15 bg-violet-950/30 px-4 py-2.5"
            >
              {/* Left: name + capacity */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-violet-100">{tier.name}</p>
                <p className="text-xs text-violet-300/60">{tier.capacity} slot{tier.capacity !== 1 ? "s" : ""}/building</p>
              </div>

              {/* Count badge */}
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  isMax ? "bg-emerald-900/60 text-emerald-300" : "bg-violet-800/50 text-violet-300"
                }`}
              >
                {count}/4
              </span>

              {/* Cost + button */}
              <div className="flex shrink-0 flex-col items-end gap-0.5">
                {!isMax && cost && (
                  <p className="text-xs text-violet-300/50">{formatCosts(cost)}</p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isMax) return;
                    const result = buildHousing(i);
                    if (!result.ok) window.alert(result.reason);
                  }}
                  disabled={isMax || !affordable}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isMax
                      ? "cursor-default bg-emerald-900/40 text-emerald-400"
                      : affordable
                        ? "bg-violet-600 text-white hover:bg-violet-500"
                        : "cursor-not-allowed bg-violet-900/50 text-violet-400"
                  }`}
                >
                  {isMax ? "Max" : "Build"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Building Card ────────────────────────────────────────────────────────────

function BuildingCard({
  building,
  built,
  prereqMet,
  affordable,
  inventory,
  buildingSlots,
  managers,
  unlockedManagerIds,
  allAssignedManagerIds,
  onBuild,
  onConvert,
  onAssignManager,
}: {
  building: BuildingDefinition;
  built: boolean;
  prereqMet: boolean;
  affordable: boolean;
  inventory: Inventory;
  buildingSlots: BuildingManagerSlot[];
  managers: Record<string, { id: ManagerId; name: string; unlocked: boolean }>;
  unlockedManagerIds: ManagerId[];
  allAssignedManagerIds: Set<ManagerId>;
  onBuild: () => void;
  onConvert: () => { ok: boolean; reason?: string };
  onAssignManager: (slotId: string, managerId: ManagerId | null) => void;
}) {
  const isConverter = building.conversionInput !== null && building.conversionOutput !== null;
  const inputAmt = building.conversionInput ? Math.floor(inventory[building.conversionInput]) : 0;
  const canConvert = isConverter && built && inputAmt >= building.conversionRatio;
  const numAssigned = buildingSlots.filter((s) => s.managerId).length;

  return (
    <div
      className={`rounded-xl border p-4 ${
        built ? "border-emerald-200/30 bg-emerald-950/20" : "border-violet-200/20 bg-violet-950/30"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BuildingIcon buildingId={building.id} size={40} />
            <h3 className="font-semibold text-violet-100">{building.name}</h3>
            {building.isInfrastructure && (
              <span className="rounded-full bg-blue-900/60 px-2 py-0.5 text-xs text-blue-300">
                Infrastructure
              </span>
            )}
            {isConverter && !building.isInfrastructure && (
              <span className="rounded-full bg-amber-900/60 px-2 py-0.5 text-xs text-amber-300">
                Converter
              </span>
            )}
            {built && (
              <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-300">
                ✓ Built
              </span>
            )}
          </div>

          {!built && (
            <>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
                {Object.entries(building.buildCost).map(([resource, amount]) => {
                  const has = inventory[resource as keyof Inventory] >= (amount ?? 0);
                  return (
                    <span
                      key={resource}
                      className={`flex items-center gap-1 text-sm ${has ? "text-violet-200" : "text-red-400"}`}
                    >
                      <ResourceIcon resource={resource as ResourceType} />
                      {amount} {RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}
                    </span>
                  );
                })}
              </div>
              {!prereqMet && building.prerequisite && (
                <p className="mt-1 text-xs text-amber-400/90">
                  Requires: {getBuildingById(building.prerequisite)?.name ?? building.prerequisite}
                </p>
              )}
            </>
          )}
        </div>

        {!built && (
          <button
            type="button"
            onClick={onBuild}
            disabled={!affordable || !prereqMet}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              affordable && prereqMet
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "cursor-not-allowed bg-violet-900/50 text-violet-400"
            }`}
          >
            Build
          </button>
        )}
      </div>

      {/* Converter section */}
      {built && isConverter && building.conversionInput && building.conversionOutput && (
        <div className="mt-3 space-y-3 border-t border-violet-200/15 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-violet-200">
                {building.conversionRatio} {RESOURCE_LABELS[building.conversionInput]} →{" "}
                1 {RESOURCE_LABELS[building.conversionOutput]}
              </p>
              <p className="text-xs text-violet-300/70">
                Have: {inputAmt} {RESOURCE_LABELS[building.conversionInput]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const result = onConvert();
                if (!result.ok) window.alert(result.reason);
              }}
              disabled={!canConvert}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                canConvert
                  ? "bg-amber-600 text-white hover:bg-amber-500"
                  : "cursor-not-allowed bg-violet-900/50 text-violet-400"
              }`}
            >
              Convert
            </button>
          </div>

          {/* Manager slots */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-violet-300">
              Auto-convert
            </p>
            <div className="flex gap-2">
              {buildingSlots.map((slot) => (
                <BuildingManagerSlotButton
                  key={slot.id}
                  slotId={slot.id}
                  managerId={slot.managerId}
                  managers={managers}
                  unlockedManagerIds={unlockedManagerIds}
                  allAssignedManagerIds={allAssignedManagerIds}
                  onAssign={(managerId) => onAssignManager(slot.id, managerId)}
                />
              ))}
            </div>
            {numAssigned > 0 && (
              <p className="mt-1 text-xs text-violet-200/60">
                {numAssigned} manager{numAssigned > 1 ? "s" : ""} auto-converting
              </p>
            )}
          </div>
        </div>
      )}

      {/* Infrastructure note */}
      {built && building.isInfrastructure && (
        <p className="mt-2 text-xs italic text-blue-300/70">
          Unlocks the next building in this chain.
        </p>
      )}
    </div>
  );
}

// ─── Building Manager Slot Button ─────────────────────────────────────────────

function BuildingManagerSlotButton({
  slotId,
  managerId,
  managers,
  unlockedManagerIds,
  allAssignedManagerIds,
  onAssign,
}: {
  slotId: string;
  managerId: ManagerId | null;
  managers: Record<string, { id: ManagerId; name: string; unlocked: boolean }>;
  unlockedManagerIds: ManagerId[];
  allAssignedManagerIds: Set<ManagerId>;
  onAssign: (managerId: ManagerId | null) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const assignedManager = managerId ? managers[managerId] : null;

  const availableManagerIds = useMemo(
    () => unlockedManagerIds.filter((id) => id === managerId || !allAssignedManagerIds.has(id)),
    [unlockedManagerIds, allAssignedManagerIds, managerId],
  );

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
        <p className="mt-1 text-center text-[10px] text-violet-200/70">
          {assignedManager.name.slice(0, 6)}
        </p>
      )}

      {menuOpen && (
        <div className="absolute left-0 top-16 z-20 min-w-48 rounded-xl border border-violet-200/25 bg-violet-950 p-2 shadow-2xl">
          {assignedManager && (
            <button
              type="button"
              onClick={() => {
                onAssign(null);
                setMenuOpen(false);
              }}
              className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-violet-200 hover:bg-violet-800/60"
            >
              Clear slot
            </button>
          )}
          {availableManagerIds.length === 0 ? (
            <p className="px-3 py-2 text-xs text-violet-300/80">No available managers</p>
          ) : (
            availableManagerIds.map((mId) => (
              <button
                key={mId}
                type="button"
                onClick={() => {
                  onAssign(mId);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-violet-100 hover:bg-violet-800/60"
              >
                <CharacterIcon managerId={mId} />
                <span>{managers[mId].name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Standalone Building Card ─────────────────────────────────────────────────

function StandaloneBuildingCard({
  building,
  built,
  affordable,
  inventory,
  onBuild,
}: {
  building: BuildingDefinition;
  built: boolean;
  affordable: boolean;
  inventory: Inventory;
  onBuild: () => void;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        built ? "border-emerald-200/30 bg-emerald-950/20" : "border-violet-200/20 bg-violet-950/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <BuildingIcon buildingId={building.id} size={40} />
            <h3 className="font-semibold text-violet-100">{building.name}</h3>
            {built && (
              <span className="rounded-full bg-emerald-900/60 px-2 py-0.5 text-xs text-emerald-300">
                ✓ Built
              </span>
            )}
          </div>
          {!built ? (
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
              {Object.entries(building.buildCost).map(([resource, amount]) => {
                const has = inventory[resource as keyof Inventory] >= (amount ?? 0);
                return (
                  <span
                    key={resource}
                    className={`flex items-center gap-1 text-sm ${has ? "text-violet-200" : "text-red-400"}`}
                  >
                    <ResourceIcon resource={resource as ResourceType} />
                    {amount} {RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-1 text-sm italic text-violet-200/60">Special features coming soon.</p>
          )}
        </div>

        {!built && (
          <button
            type="button"
            onClick={onBuild}
            disabled={!affordable}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition ${
              affordable
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "cursor-not-allowed bg-violet-900/50 text-violet-400"
            }`}
          >
            Build
          </button>
        )}
      </div>
    </div>
  );
}

// Local type alias needed for casting
type ResourceType = keyof Inventory;
