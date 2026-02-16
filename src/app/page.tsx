"use client";

import { ManagerSlots } from "@/components/resources/manager-slots";
import { ResourceCard } from "@/components/resources/resource-card";
import { SparklesGraphic } from "@/components/ui/icons";
import { RESOURCE_LABELS, type ResourceType } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

const resources: ResourceType[] = ["food", "water", "sticks", "stone"];

export default function ResourcesPage() {
  const { inventory, addResource, housedPeople, housingCapacity } = useGameStore();

  return (
    <main className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Resources</h1>
        <p className="text-violet-200/80">
          Gather materials manually or automate with managers.
        </p>
      </header>

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <SparklesGraphic />
        <p className="text-sm text-violet-100">
          Housing status: <span className="font-semibold">{housedPeople}</span> / {housingCapacity} people housed.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource}
            resourceType={resource}
            name={RESOURCE_LABELS[resource]}
            amount={inventory[resource]}
            onCollect={addResource}
          />
        ))}
      </section>

      <ManagerSlots />
    </main>
  );
}
