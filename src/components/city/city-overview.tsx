"use client";

import { CharacterIcon } from "@/components/ui/icons";
import { RESOURCE_CHAINS } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

export function CityOverview() {
  const { buildings, managers, inventory } = useGameStore();

  const unlockedManagerIds = Object.values(managers)
    .filter((manager) => manager.unlocked)
    .map((manager) => manager.id);

  return (
    <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200">City Overview</h2>
        <span className="text-xs text-violet-300/80">
          Characters {unlockedManagerIds.length} · Buildings {Object.keys(buildings.builtBuildings).length}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-xs text-violet-200/80">
        {RESOURCE_CHAINS.map((chain) => (
          <span key={chain.id}>
            {chain.name}: {Math.floor(inventory[chain.tiers[0].id])} {chain.tiers[0].name}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {unlockedManagerIds.slice(0, 24).map((managerId) => (
          <div key={managerId} className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200/30 bg-violet-900/55">
            <CharacterIcon managerId={managerId} compact />
          </div>
        ))}
      </div>
    </section>
  );
}
