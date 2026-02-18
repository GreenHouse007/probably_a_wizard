"use client";

import { useState } from "react";
import { CharacterIcon } from "@/components/ui/icons";
import {
  RESOURCE_LABELS,
  MANAGER_LEVEL_MAX,
  getLevelUpCost,
  getManagerLevelTierLabel,
  getManagerUnlockCost,
  getNextTierThreshold,
  type ManagerId,
  type ManagerTier,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

export default function CharactersPage() {
  const { managers, discoveredManagerIds, inventory, unlockManager, managerLevels, levelUpManager, getEffectivePps } =
    useGameStore();

  const unlockedIds = discoveredManagerIds.filter((id) => managers[id]?.unlocked);
  const lockedDiscoveredIds = discoveredManagerIds.filter((id) => !managers[id]?.unlocked);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Characters</h1>
        <p className="text-violet-200/80">
          Unlock and manage your discovered characters. Visit{" "}
          <span className="font-semibold">Discover</span> to find new combinations.
        </p>
      </header>

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <h2 className="text-lg font-semibold text-violet-100">Unlocked Characters</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {unlockedIds.map((managerId) => (
            <CharacterCard
              key={managerId}
              managerId={managerId}
              managers={managers}
              inventory={inventory}
              level={managerLevels[managerId] ?? 0}
              effectivePps={getEffectivePps(managerId)}
              onLevelUp={() => {
                const result = levelUpManager(managerId);
                if (!result.ok) window.alert(result.reason);
              }}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <h2 className="text-lg font-semibold text-violet-100">Discovered — Ready to Unlock</h2>
        <p className="mt-1 text-xs text-violet-200/80">
          Discovered characters appear here after combining in Discover.
        </p>

        <div className="mt-3 space-y-2">
          {lockedDiscoveredIds.length === 0 ? (
            <p className="rounded-xl border border-violet-200/20 bg-violet-900/30 px-3 py-3 text-sm text-violet-200/85">
              No discovered locked characters yet. Visit Discover and combine characters to reveal new ones.
            </p>
          ) : (
            lockedDiscoveredIds.map((managerId) => {
              const manager = managers[managerId];
              const costs = getManagerUnlockCost(managerId);

              return (
                <button
                  key={managerId}
                  type="button"
                  onClick={() => {
                    const result = unlockManager(managerId);
                    if (!result.ok) window.alert(result.reason);
                  }}
                  className="w-full rounded-xl border border-amber-300/35 bg-amber-900/25 px-3 py-2 text-left text-amber-100"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <CharacterIcon managerId={managerId} />
                    <span className="font-medium">Unlock {manager.name}</span>
                  </div>
                  {Object.keys(costs).length > 0 && (
                    <>
                      <div className="text-xs">
                        Cost:{" "}
                        {Object.entries(costs)
                          .map(
                            ([resource, amount]) =>
                              `${amount} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`,
                          )
                          .join(" + ")}
                      </div>
                      <div className="text-xs text-amber-200/80">
                        Current:{" "}
                        {Object.entries(costs)
                          .map(
                            ([resource]) =>
                              `${Math.floor(inventory[resource as keyof typeof inventory])} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`,
                          )
                          .join(" | ")}
                      </div>
                    </>
                  )}
                </button>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

function getTierBorderClass(level: number): string {
  if (level >= 100) return "border-violet-400/80 shadow-lg shadow-violet-500/40";
  if (level >= 75) return "border-yellow-400/60";
  if (level >= 50) return "border-slate-400/60";
  if (level >= 25) return "border-amber-400/60";
  return "border-emerald-200/25";
}

function CharacterCard({
  managerId,
  managers,
  inventory,
  level,
  effectivePps,
  onLevelUp,
}: {
  managerId: ManagerId;
  managers: Record<string, { id: ManagerId; name: string; pps: number; tier: ManagerTier; shortBio: string; fullBio: string }>;
  inventory: Record<string, number>;
  level: number;
  effectivePps: number;
  onLevelUp: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const manager = managers[managerId];
  const tierLabel = getManagerLevelTierLabel(level);
  const nextThreshold = getNextTierThreshold(level);
  const levelUpCost = level < MANAGER_LEVEL_MAX ? getLevelUpCost(level, manager.tier) : null;
  const canAffordLevelUp = levelUpCost
    ? Object.entries(levelUpCost).every(([r, amt]) => (inventory[r] ?? 0) >= (amt ?? 0))
    : false;
  // Progress within the current 25-level tier segment
  const segmentStart = level >= 75 ? 75 : level >= 50 ? 50 : level >= 25 ? 25 : 0;
  const segmentSize = 25;
  const progressPct = level >= 100 ? 1 : (level - segmentStart) / segmentSize;

  return (
    <div className={`flex w-full flex-col gap-1 rounded-xl border px-3 py-2 ${getTierBorderClass(level)}`}>
      {/* Top row */}
      <div className="flex items-center gap-3">
        <CharacterIcon managerId={managerId} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-violet-50">{manager.name}</span>
            <span className="rounded-full bg-violet-800/60 px-2 py-0.5 text-xs text-violet-200">
              Lv.{level}
            </span>
            {tierLabel && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  tierLabel === "Legendary"
                    ? "bg-violet-700/60 text-violet-200"
                    : tierLabel === "Gold"
                      ? "bg-yellow-800/60 text-yellow-300"
                      : tierLabel === "Silver"
                        ? "bg-slate-700/60 text-slate-300"
                        : "bg-amber-800/60 text-amber-300"
                }`}
              >
                {tierLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-violet-200">{effectivePps.toFixed(3)} PPS</div>
        </div>
      </div>

      {/* Progress bar */}
      {level < MANAGER_LEVEL_MAX && (
        <div className="mt-1">
          <div className="mb-0.5 flex justify-between text-[10px] text-violet-300/70">
            <span>Next tier at Lv.{nextThreshold}</span>
            <span>
              {level}/{nextThreshold}
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-violet-900/60">
            <div
              className="h-1 rounded-full bg-violet-400/70 transition-all"
              style={{ width: `${progressPct * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Bio */}
      <p className="text-xs text-violet-200/80">{manager.shortBio}</p>
      {expanded && <p className="mt-1 text-xs text-violet-100/90">{manager.fullBio}</p>}

      {/* Level-up button */}
      {levelUpCost ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onLevelUp();
          }}
          disabled={!canAffordLevelUp}
          className={`mt-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            canAffordLevelUp
              ? "bg-violet-600 text-white hover:bg-violet-500"
              : "cursor-not-allowed bg-violet-900/50 text-violet-400"
          }`}
        >
          Level Up —{" "}
          {Object.entries(levelUpCost)
            .map(([r, amt]) => `${amt} ${RESOURCE_LABELS[r as keyof typeof RESOURCE_LABELS]}`)
            .join(" + ")}
        </button>
      ) : (
        <p className="mt-1 text-xs font-semibold text-violet-300">Max Level!</p>
      )}

      <button
        type="button"
        onClick={() => setExpanded((c) => !c)}
        className="mt-0.5 text-left text-[10px] text-violet-400/70 hover:text-violet-300"
      >
        {expanded ? "▲ Less" : "▼ More"}
      </button>
    </div>
  );
}
