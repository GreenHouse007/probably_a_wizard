"use client";

import { useState, useMemo } from "react";
import { ResourceIcon, CharacterIcon } from "@/components/ui/icons";
import { RESOURCE_CHAINS, RESOURCE_LABELS, getChainTierResource, getUnlockedTiers, type ChainId, type ManagerId } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

const CHAIN_ICONS: Record<ChainId, string> = {
  food: "🍎",
  construction: "🔨",
  energy: "⚡",
  culture: "📚",
};

export default function ResourcesPage() {
  const {
    inventory,
    addResource,
    slots,
    managers,
    discoveredManagerIds,
    assignManagerToSlot,
    getEffectivePps,
    buildings,
  } = useGameStore();

  const [activeChain, setActiveChain] = useState<ChainId>("food");
  const [activeTierIndex, setActiveTierIndex] = useState(0);

  const chain = RESOURCE_CHAINS.find((c) => c.id === activeChain)!;
  const unlockedTierIndices = getUnlockedTiers(activeChain, buildings);
  const effectiveTierIndex = unlockedTierIndices.includes(activeTierIndex) ? activeTierIndex : 0;
  const activeResource = getChainTierResource(activeChain, effectiveTierIndex);
  const activeTier = chain.tiers[effectiveTierIndex];

  const chainSlots = slots.filter((s) => s.chainId === activeChain);
  const assignedManagerIds = slots.flatMap((s) => (s.managerId ? [s.managerId] : []));
  const unlockedManagerIds = discoveredManagerIds.filter((id) => managers[id]?.unlocked);

  const chainTotalPps = useMemo(() => {
    return chainSlots.reduce((total, slot) => {
      if (!slot.managerId) return total;
      return total + getEffectivePps(slot.managerId);
    }, 0);
  }, [chainSlots, getEffectivePps]);

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

      {/* Main gather area */}
      <div className="rounded-2xl border border-violet-200/25 bg-violet-900/30 p-6 shadow-lg shadow-violet-950/40">
        <button
          type="button"
          onClick={() => addResource(activeResource)}
          className="flex w-full flex-col items-center gap-3 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <ResourceIcon resource={activeResource} />
            <span className="text-2xl font-semibold text-violet-100">{activeTier.name}</span>
          </div>
          <span className="text-sm text-violet-200/80">Tap to gather +1</span>
          <span className="text-5xl font-bold text-violet-50">{Math.floor(inventory[activeResource])}</span>
        </button>

        {/* Manager slots */}
        <div className="mt-6 border-t border-violet-200/15 pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-violet-300">Managers</p>
          <div className="flex gap-3">
            {chainSlots.map((slot) => (
              <ManagerSlotButton
                key={slot.id}
                slot={slot}
                managers={managers}
                unlockedManagerIds={unlockedManagerIds}
                assignedManagerIds={assignedManagerIds}
                onAssign={(managerId) => {
                  const result = assignManagerToSlot(slot.id, managerId);
                  if (!result.ok) window.alert(result.reason);
                }}
                getEffectivePps={getEffectivePps}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-violet-200/70">
            {chainTotalPps > 0
              ? `Auto-gathering: ${chainTotalPps.toFixed(2)} ${activeTier.name}/sec`
              : "Assign managers to auto-gather"}
          </p>
        </div>
      </div>

      {/* Chain inventory summary */}
      <div className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <h3 className="mb-2 text-sm font-semibold text-violet-200">All {chain.name} Resources</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {chain.tiers.map((tier, i) => {
            const unlocked = unlockedTierIndices.includes(i);
            return (
              <div
                key={tier.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  unlocked
                    ? "border border-violet-200/20 bg-violet-900/40 text-violet-100"
                    : "text-violet-400/40"
                }`}
              >
                {unlocked ? <ResourceIcon resource={tier.id} /> : <span className="h-10 w-10" />}
                <div>
                  <div className={unlocked ? "font-medium" : ""}>{unlocked ? tier.name : `Tier ${tier.tier} - Locked`}</div>
                  {unlocked && <div className="text-xs text-violet-200/70">{Math.floor(inventory[tier.id])}</div>}
                </div>
              </div>
            );
          })}
        </div>
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
