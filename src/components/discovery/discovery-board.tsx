"use client";

import { useMemo, useState, type DragEvent } from "react";
import { CharacterIcon, SparklesGraphic } from "@/components/ui/icons";
import {
  RESOURCE_LABELS,
  type ManagerId,
  UNLOCK_COSTS,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

type WorkspaceTile = {
  id: string;
  managerId: ManagerId;
  x: number;
  y: number;
};

const TILE_SIZE = 96;
const DRAG_SOURCE_KEY = "drag-source";
const LIBRARY_SOURCE = "library";
const WORKSPACE_SOURCE = "workspace";

const clampToWorkspace = (value: number, workspaceSize?: number) => {
  if (workspaceSize === undefined) {
    return Math.max(0, value);
  }

  return Math.min(Math.max(0, value), Math.max(0, workspaceSize - TILE_SIZE));
};

export function DiscoveryBoard() {
  const {
    managers,
    discoveredManagerIds,
    inventory,
    housedPeople,
    housingCapacity,
    unlockManager,
    attemptCombine,
  } = useGameStore();
  const [tiles, setTiles] = useState<WorkspaceTile[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const libraryIds = useMemo(
    () => discoveredManagerIds.filter((managerId) => managers[managerId]?.unlocked),
    [discoveredManagerIds, managers],
  );

  const placeTile = (
    managerId: ManagerId,
    x: number,
    y: number,
    workspaceWidth?: number,
    workspaceHeight?: number,
  ) => {
    setTiles((current) => [
      ...current,
      {
        id: `${managerId}-${Date.now()}-${Math.random()}`,
        managerId,
        x: clampToWorkspace(x, workspaceWidth),
        y: clampToWorkspace(y, workspaceHeight),
      },
    ]);
  };

  const handleDropOnWorkspace = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const dragSource = event.dataTransfer.getData(DRAG_SOURCE_KEY);
    if (dragSource === WORKSPACE_SOURCE) {
      return;
    }

    const managerId = event.dataTransfer.getData("manager-id") as ManagerId;
    if (!managerId) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    placeTile(
      managerId,
      event.clientX - bounds.left - TILE_SIZE / 2,
      event.clientY - bounds.top - TILE_SIZE / 2,
      bounds.width,
      bounds.height,
    );
  };

  const combineAt = (
    movedTileId: string,
    x?: number,
    y?: number,
    workspaceWidth?: number,
    workspaceHeight?: number,
  ) => {
    setTiles((current) => {
      const moved = current.find((tile) => tile.id === movedTileId);
      if (!moved) {
        return current;
      }

      const clampedX =
        x === undefined ? undefined : clampToWorkspace(x, workspaceWidth);
      const clampedY =
        y === undefined ? undefined : clampToWorkspace(y, workspaceHeight);

      const movedTile =
        clampedX === undefined || clampedY === undefined
          ? moved
          : { ...moved, x: clampedX, y: clampedY };

      const movedCurrent = current.map((tile) =>
        tile.id === movedTileId ? movedTile : tile,
      );

      const overlap = movedCurrent.find((tile) => {
        if (tile.id === movedTile.id) {
          return false;
        }

        const xOverlap = Math.abs(tile.x - movedTile.x) < TILE_SIZE * 0.55;
        const yOverlap = Math.abs(tile.y - movedTile.y) < TILE_SIZE * 0.55;
        return xOverlap && yOverlap;
      });

      if (!overlap) {
        return movedCurrent;
      }

      const result = attemptCombine(movedTile.managerId, overlap.managerId);
      if (!result.ok || !result.discoveredId) {
        return movedCurrent;
      }

      const resultManager = managers[result.discoveredId];
      setToast(
        result.alreadyKnown
          ? `Already discovered: ${resultManager.name}`
          : `Discovered: ${resultManager.name}!`,
      );
      window.setTimeout(() => setToast(null), 1800);

      const remaining = movedCurrent.filter(
        (tile) => tile.id !== movedTile.id && tile.id !== overlap.id,
      );

      return [
        ...remaining,
        {
          id: `${result.discoveredId}-${Date.now()}`,
          managerId: result.discoveredId,
          x: clampToWorkspace((movedTile.x + overlap.x) / 2, workspaceWidth),
          y: clampToWorkspace((movedTile.y + overlap.y) / 2, workspaceHeight),
        },
      ];
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <aside className="rounded-2xl border border-violet-300/20 bg-violet-900/30 p-4">
        <SparklesGraphic />
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-violet-100">Character Library</h2>
          <span className="text-xs text-violet-200/80">
            {libraryIds.length} / {Object.keys(managers).length} discovered
          </span>
        </div>

        <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {libraryIds.map((managerId) => (
            <button
              key={managerId}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_SOURCE_KEY, LIBRARY_SOURCE);
                event.dataTransfer.setData("manager-id", managerId);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-violet-200/20 bg-violet-800/55 px-3 py-2 text-left text-sm text-violet-50 shadow"
              type="button"
            >
              <CharacterIcon managerId={managerId} />
              <div>
                <div className="font-medium">{managers[managerId].name}</div>
                <div className="text-xs text-violet-200">{managers[managerId].pps} pps</div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-violet-200/90">
          Housing used: <span className="font-semibold">{housedPeople}</span> / {housingCapacity}. Unlocks fail when a role&apos;s housing requirement cannot fit (build huts in Buildings tab).
        </p>

        <div className="mt-4 space-y-2">
          {(["gatherer", "collector"] as ManagerId[]).map((managerId) => {
            const manager = managers[managerId];
            const costs = UNLOCK_COSTS[managerId];

            if (!costs || manager.unlocked) {
              return null;
            }

            return (
              <button
                key={managerId}
                type="button"
                onClick={() => {
                  const result = unlockManager(managerId);
                  if (!result.ok) {
                    window.alert(result.reason);
                  }
                }}
                className="w-full rounded-xl border border-amber-300/35 bg-amber-900/25 px-3 py-2 text-left text-amber-100"
              >
                <div className="font-medium">Unlock {manager.name}</div>
                <div className="text-xs">
                  Cost:{" "}
                  {Object.entries(costs)
                    .map(
                      ([resource, amount]) =>
                        `${amount} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`,
                    )
                    .join(" + ")}
                </div>
                <div className="text-xs text-amber-200/80">
                  Current:{" "}
                  {Object.entries(costs)
                    .map(
                      ([resource]) =>
                        `${Math.floor(inventory[resource as keyof typeof inventory])} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`,
                    )
                    .join(" | ")}
                </div>
                <div className="text-xs text-amber-200/80">
                  Housing required: {manager.housingCost === 0 ? "None (special entity)" : `${manager.housingCost}`}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section>
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropOnWorkspace}
          className="relative min-h-[480px] rounded-2xl border border-violet-300/20 bg-[radial-gradient(circle_at_20%_10%,rgba(167,139,250,0.16),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(96,165,250,0.14),transparent_40%),linear-gradient(180deg,rgba(30,27,75,0.8),rgba(17,24,39,0.9))] p-4"
        >
          <p className="mb-4 text-sm text-violet-200/90">
            Drag characters from the library and overlap tiles to discover new ones.
          </p>

          {tiles.map((tile) => (
            <button
              key={tile.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_SOURCE_KEY, WORKSPACE_SOURCE);
                event.dataTransfer.setData("manager-id", tile.managerId);
              }}
              onDragEnd={(event) => {
                const workspace = event.currentTarget.parentElement?.getBoundingClientRect();
                if (!workspace) {
                  return;
                }

                const nextX = event.clientX - workspace.left - TILE_SIZE / 2;
                const nextY = event.clientY - workspace.top - TILE_SIZE / 2;

                combineAt(tile.id, nextX, nextY, workspace.width, workspace.height);
              }}
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                width: `${TILE_SIZE}px`,
                height: `${TILE_SIZE}px`,
              }}
              className="absolute flex flex-col items-center justify-center gap-1 rounded-2xl border border-violet-100/30 bg-violet-700/80 p-2 text-center text-[11px] font-medium text-violet-50 shadow-lg transition-transform hover:scale-105"
              type="button"
            >
              <CharacterIcon managerId={tile.managerId} />
              <span>{managers[tile.managerId].name}</span>
            </button>
          ))}

          {toast && (
            <div className="absolute right-4 top-4 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-50 shadow-lg">
              {toast}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
