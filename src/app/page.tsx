"use client";

import { ResourceCard } from "@/components/resources/resource-card";
import { CityOverview } from "@/components/city/city-overview";
import { RESOURCE_LABELS } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

export default function ResourcesPage() {
  const {
    inventory,
    addResource,
    housedPeople,
    housingCapacity,
    slots,
    managers,
    discoveredManagerIds,
    assignManagerToSlot,
    getEffectivePps,
    unlockedResources,
  } = useGameStore();

  const assignedManagerIds = slots.flatMap((slot) => (slot.managerId ? [slot.managerId] : []));
  const unlockedManagerIds = discoveredManagerIds.filter((managerId) => managers[managerId]?.unlocked);

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Resources</h1>
        <p className="text-violet-200/80">Gather materials manually or automate with managers.</p>
      </header>

      <CityOverview />

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <p className="text-sm text-violet-100">
          Housing status: <span className="font-semibold">{housedPeople}</span> / {housingCapacity} people housed.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {unlockedResources.map((resource) => {
          const slot = slots.find((currentSlot) => currentSlot.resourceType === resource);
          if (!slot) return null;
          return (
            <ResourceCard
              key={resource}
              resourceType={resource}
              name={RESOURCE_LABELS[resource]}
              amount={inventory[resource]}
              onCollect={addResource}
              slot={slot}
              managers={managers}
              discoveredManagerIds={unlockedManagerIds}
              assignedManagerIds={assignedManagerIds}
              onAssign={(slotId, managerId) => {
                const result = assignManagerToSlot(slotId, managerId);
                if (!result.ok) window.alert(result.reason);
              }}
              getEffectivePps={getEffectivePps}
            />
          );
        })}
      </section>
    </main>
  );
}
