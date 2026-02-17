"use client";

import { useMemo, useState } from "react";
import { CharacterIcon, ResourceIcon } from "@/components/ui/icons";
import { type ManagerDefinition, type ManagerId, type ManagerSlot, type ResourceType } from "@/lib/game-data";

type Props = {
  name: string;
  amount: number;
  resourceType: ResourceType;
  onCollect: (resource: ResourceType) => void;
  slot: ManagerSlot;
  managers: Record<ManagerId, ManagerDefinition>;
  discoveredManagerIds: ManagerId[];
  assignedManagerIds: ManagerId[];
  onAssign: (slotId: string, managerId: ManagerId | null) => void;
  getEffectivePps: (managerId: ManagerId, resourceType: ResourceType) => number;
};

export function ResourceCard({
  name,
  amount,
  resourceType,
  onCollect,
  slot,
  managers,
  discoveredManagerIds,
  assignedManagerIds,
  onAssign,
  getEffectivePps,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const assignedManager = slot.managerId ? managers[slot.managerId] : null;
  const availableManagerIds = useMemo(
    () =>
      discoveredManagerIds.filter(
        (managerId) => managerId === slot.managerId || !assignedManagerIds.includes(managerId),
      ),
    [assignedManagerIds, discoveredManagerIds, slot.managerId],
  );
  const effectivePps = assignedManager ? getEffectivePps(assignedManager.id, resourceType) : 0;

  return (
    <div className="rounded-2xl border border-violet-200/25 bg-violet-900/30 p-5 shadow-lg shadow-violet-950/40">
      <button
        type="button"
        onClick={() => onCollect(resourceType)}
        className="flex min-h-36 w-full flex-col justify-between text-left transition hover:-translate-y-0.5"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xl font-semibold text-violet-100">{name}</span>
          <ResourceIcon resource={resourceType} />
        </div>
        <span className="text-sm text-violet-200/90">Tap to gather +1</span>
        <span className="text-3xl font-bold text-violet-50">{Math.floor(amount)}</span>
      </button>

      <div className="mt-3 border-t border-violet-200/15 pt-3">
        <div className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-violet-200/40 bg-violet-950/40"
            aria-label={assignedManager ? `Change ${assignedManager.name}` : `Assign manager to ${name}`}
          >
            {assignedManager ? (
              <CharacterIcon managerId={assignedManager.id} />
            ) : (
              <span className="text-2xl text-violet-200">+</span>
            )}
          </button>

          {menuOpen ? (
            <div className="absolute left-0 top-16 z-10 min-w-48 rounded-xl border border-violet-200/25 bg-violet-950 p-2 shadow-2xl">
              {assignedManager ? (
                <button
                  type="button"
                  onClick={() => {
                    onAssign(slot.id, null);
                    setMenuOpen(false);
                  }}
                  className="mb-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-violet-200 hover:bg-violet-800/60"
                >
                  Clear slot
                </button>
              ) : null}
              {availableManagerIds.length === 0 ? (
                <p className="px-3 py-2 text-xs text-violet-300/80">No available managers</p>
              ) : (
                availableManagerIds.map((managerId) => (
                  <button
                    key={managerId}
                    type="button"
                    onClick={() => {
                      onAssign(slot.id, managerId);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-violet-100 hover:bg-violet-800/60"
                  >
                    <CharacterIcon managerId={managerId} />
                    <span>{managers[managerId].name}</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-violet-200/90">
          {assignedManager ? `${effectivePps.toFixed(2)} PPS` : "No manager assigned"}
        </p>
      </div>
    </div>
  );
}
