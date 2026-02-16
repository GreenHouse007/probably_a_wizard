"use client";

import { RESOURCE_LABELS, type ManagerId } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

export function ManagerSlots() {
  const { slots, managers, discoveredManagerIds, assignManagerToSlot } = useGameStore();

  return (
    <section className="rounded-2xl border border-violet-300/25 bg-violet-900/25 p-5">
      <h2 className="mb-4 text-xl font-semibold text-violet-100">Manager Slots</h2>
      <div className="space-y-3">
        {slots.map((slot) => {
          const assigned = slot.managerId ? managers[slot.managerId] : null;
          return (
            <div
              key={slot.id}
              className="grid gap-2 rounded-xl border border-violet-100/15 bg-violet-950/35 p-3 md:grid-cols-[1fr,1fr,auto] md:items-center"
            >
              <span className="text-sm font-medium text-violet-200">
                {RESOURCE_LABELS[slot.resourceType]}
              </span>
              <select
                value={slot.managerId ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  const managerId = (value === "" ? null : value) as ManagerId | null;
                  const result = assignManagerToSlot(slot.id, managerId);
                  if (!result.ok) {
                    window.alert(result.reason);
                  }
                }}
                className="rounded-lg border border-violet-200/25 bg-violet-900/60 px-3 py-2 text-sm text-violet-100"
              >
                <option value="">None</option>
                {discoveredManagerIds.map((managerId) => (
                  <option key={managerId} value={managerId}>
                    {managers[managerId].name}
                  </option>
                ))}
              </select>
              <span className="text-right text-sm text-violet-300">
                {assigned ? `${assigned.pps} pps` : "No automation"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
