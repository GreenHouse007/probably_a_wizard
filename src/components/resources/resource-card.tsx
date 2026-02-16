"use client";

import type { ResourceType } from "@/lib/game-data";
import { ResourceIcon } from "@/components/ui/icons";

type Props = {
  name: string;
  amount: number;
  resourceType: ResourceType;
  onCollect: (resource: ResourceType) => void;
};

export function ResourceCard({ name, amount, resourceType, onCollect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onCollect(resourceType)}
      className="flex min-h-36 flex-col justify-between rounded-2xl border border-violet-200/25 bg-violet-900/30 p-5 text-left shadow-lg shadow-violet-950/40 transition hover:-translate-y-0.5 hover:bg-violet-800/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xl font-semibold text-violet-100">{name}</span>
        <ResourceIcon resource={resourceType} />
      </div>
      <span className="text-sm text-violet-200/90">Tap to gather +1</span>
      <span className="text-3xl font-bold text-violet-50">{Math.floor(amount)}</span>
    </button>
  );
}
