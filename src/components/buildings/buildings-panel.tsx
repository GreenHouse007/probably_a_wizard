"use client";

import {
  HUT_CAPACITY,
  HUT_COST,
  RESOURCE_LABELS,
  WORKSHOP_UNLOCK_HUTS,
  getWorkshopCost,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";
import { HutIcon, SparklesGraphic } from "@/components/ui/icons";

export function BuildingsPanel() {
  const {
    inventory,
    buildings,
    housedPeople,
    housingCapacity,
    buildHut,
    buildWorkshop,
    resourceMultipliers,
  } = useGameStore();
  const workshopCost = getWorkshopCost(buildings.workshops);

  return (
    <section className="space-y-4 rounded-2xl border border-violet-300/25 bg-violet-900/25 p-5">
      <SparklesGraphic />
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-300/20 bg-violet-950/30 p-4">
        <div>
          <h2 className="text-xl font-semibold text-violet-100">Housing</h2>
          <p className="text-sm text-violet-200/80">
            People require homes. Build huts to unlock Gatherers and Collectors.
          </p>
          <p className="mt-2 text-sm font-medium text-violet-100">
            Capacity: {housedPeople} / {housingCapacity}
          </p>
        </div>
        <HutIcon />
      </div>

      <div className="rounded-xl border border-amber-300/30 bg-amber-900/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-amber-100">Hut</h3>
          <span className="text-xs text-amber-200">+{HUT_CAPACITY} housing</span>
        </div>
        <p className="text-sm text-amber-100/90">Built: {buildings.huts}</p>
        <p className="mt-1 text-sm text-amber-100/90">
          Cost: {HUT_COST.sticks} {RESOURCE_LABELS.sticks} + {HUT_COST.stone} {RESOURCE_LABELS.stone}
        </p>
        <p className="mb-3 mt-1 text-xs text-amber-200/80">
          You have: {Math.floor(inventory.sticks)} {RESOURCE_LABELS.sticks} / {Math.floor(inventory.stone)}{" "}
          {RESOURCE_LABELS.stone}
        </p>
        <button
          type="button"
          onClick={() => {
            const result = buildHut();
            if (!result.ok) {
              window.alert(result.reason);
            }
          }}
          className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-200"
        >
          Build Hut
        </button>
      </div>

      <div className="rounded-xl border border-emerald-300/30 bg-emerald-900/20 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-100">Workshop</h3>
          <span className="text-xs text-emerald-200">+12% Sticks PPS (compounding)</span>
        </div>
        <p className="text-sm text-emerald-100/90">Built: {buildings.workshops}</p>
        <p className="text-sm text-emerald-100/90">
          Current multiplier: x{resourceMultipliers.sticks.toFixed(2)} to all stick production.
        </p>
        <p className="mt-1 text-sm text-emerald-100/90">
          Next cost: {workshopCost.sticks} {RESOURCE_LABELS.sticks} + {workshopCost.stone} {RESOURCE_LABELS.stone}
        </p>
        <p className="mb-3 mt-1 text-xs text-emerald-200/80">
          Unlock requirement: {WORKSHOP_UNLOCK_HUTS} hut built.
        </p>
        <button
          type="button"
          onClick={() => {
            const result = buildWorkshop();
            if (!result.ok) {
              window.alert(result.reason);
            }
          }}
          className="rounded-lg bg-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
        >
          Build Workshop
        </button>
      </div>
    </section>
  );
}
