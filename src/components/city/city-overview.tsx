"use client";

import { CharacterIcon, HutIcon, WorkshopIcon } from "@/components/ui/icons";
import { useGameStore } from "@/store/game-store";

function EmptySlot() {
  return <div className="h-10 w-10 rounded-lg border border-dashed border-violet-200/35 bg-violet-950/45" aria-hidden />;
}

function BuildingSlot({ type }: { type: "hut" | "workshop" }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200/30 bg-violet-900/55">
      {type === "hut" ? <HutIcon compact /> : <WorkshopIcon />}
    </div>
  );
}

export function CityOverview() {
  const { buildings, managers } = useGameStore();

  const buildingTypes: Array<"hut" | "workshop"> = [
    ...Array.from({ length: buildings.huts }, () => "hut" as const),
    ...Array.from({ length: buildings.workshops }, () => "workshop" as const),
  ];

  const unlockedManagerIds = Object.values(managers)
    .filter((manager) => manager.unlocked)
    .map((manager) => manager.id);

  const buildingSlots = Math.max(8, buildingTypes.length + 2);
  const characterSlots = Math.max(8, unlockedManagerIds.length + 2);

  return (
    <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-200">City Overview</h2>
        <span className="text-xs text-violet-300/80">
          Buildings {buildingTypes.length} · Characters {unlockedManagerIds.length}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="mb-1 text-xs text-violet-300/80">Buildings</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: buildingSlots }).map((_, index) => {
              const type = buildingTypes[index];
              return type ? <BuildingSlot key={`building-${index}`} type={type} /> : <EmptySlot key={`building-${index}`} />;
            })}
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-violet-300/80">Characters</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: characterSlots }).map((_, index) => {
              const managerId = unlockedManagerIds[index];
              return managerId ? (
                <div
                  key={`character-${managerId}-${index}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-200/30 bg-violet-900/55"
                >
                  <CharacterIcon managerId={managerId} compact />
                </div>
              ) : (
                <EmptySlot key={`character-empty-${index}`} />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
