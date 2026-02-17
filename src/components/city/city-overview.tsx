"use client";

import { BuildingIcon, CharacterIcon } from "@/components/ui/icons";
import { useGameStore } from "@/store/game-store";

export function CityOverview() {
  const { buildings, managers } = useGameStore();

  const unlockedManagerIds = Object.values(managers)
    .filter((manager) => manager.unlocked)
    .map((manager) => manager.id);

  const buildingSummary = [
    `Housing ${buildings.houses}H/${buildings.apartments}A`,
    `Lumber Mill L${buildings.lumberMillLevel}`,
    `Quarry L${buildings.quarryLevel}`,
    `Mine L${buildings.mineLevel}`,
    `Library L${buildings.libraryLevel}`,
  ];

  return (
    <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200">City Overview</h2>
        <span className="text-xs text-violet-300/80">
          Buildings {buildingSummary.length} · Characters {unlockedManagerIds.length}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-violet-200/20 bg-violet-900/45 px-2 py-1 text-xs text-violet-200"><BuildingIcon buildingId="housing" compact />Housing</div>
        <div className="flex items-center gap-1 rounded-lg border border-violet-200/20 bg-violet-900/45 px-2 py-1 text-xs text-violet-200"><BuildingIcon buildingId="lumber-mill" compact />Lumber Mill</div>
        <div className="flex items-center gap-1 rounded-lg border border-violet-200/20 bg-violet-900/45 px-2 py-1 text-xs text-violet-200"><BuildingIcon buildingId="quarry" compact />Quarry</div>
        <div className="flex items-center gap-1 rounded-lg border border-violet-200/20 bg-violet-900/45 px-2 py-1 text-xs text-violet-200"><BuildingIcon buildingId="mine" compact />Mine</div>
        <div className="flex items-center gap-1 rounded-lg border border-violet-200/20 bg-violet-900/45 px-2 py-1 text-xs text-violet-200"><BuildingIcon buildingId="library" compact />Library</div>
      </div>

      <p className="mt-2 text-xs text-violet-300/80">{buildingSummary.join(" · ")}</p>

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
