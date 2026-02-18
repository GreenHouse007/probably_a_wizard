"use client";

import { useMemo, useState, type DragEvent } from "react";
import { CharacterIcon } from "@/components/ui/icons";
import { type ManagerId } from "@/lib/game-data";
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
  if (workspaceSize === undefined) return Math.max(0, value);
  return Math.min(Math.max(0, value), Math.max(0, workspaceSize - TILE_SIZE));
};

export function DiscoveryBoard() {
  const { managers, discoveredManagerIds, attemptCombine } = useGameStore();
  const [tiles, setTiles] = useState<WorkspaceTile[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const unlockedLibraryIds = useMemo(
    () => discoveredManagerIds.filter((id) => managers[id]?.unlocked),
    [discoveredManagerIds, managers],
  );

  const placeTile = (managerId: ManagerId, x: number, y: number, workspaceWidth?: number, workspaceHeight?: number) => {
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
    if (event.dataTransfer.getData(DRAG_SOURCE_KEY) === WORKSPACE_SOURCE) return;

    const managerId = event.dataTransfer.getData("manager-id") as ManagerId;
    if (!managerId) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    placeTile(managerId, event.clientX - bounds.left - TILE_SIZE / 2, event.clientY - bounds.top - TILE_SIZE / 2, bounds.width, bounds.height);
  };

  const combineAt = (movedTileId: string, x?: number, y?: number, workspaceWidth?: number, workspaceHeight?: number) => {
    setTiles((current) => {
      const moved = current.find((tile) => tile.id === movedTileId);
      if (!moved) return current;

      const clampedX = x === undefined ? undefined : clampToWorkspace(x, workspaceWidth);
      const clampedY = y === undefined ? undefined : clampToWorkspace(y, workspaceHeight);
      const movedTile = clampedX === undefined || clampedY === undefined ? moved : { ...moved, x: clampedX, y: clampedY };
      const movedCurrent = current.map((tile) => (tile.id === movedTileId ? movedTile : tile));

      const overlap = movedCurrent.find((tile) => {
        if (tile.id === movedTile.id) return false;
        return Math.abs(tile.x - movedTile.x) < TILE_SIZE * 0.55 && Math.abs(tile.y - movedTile.y) < TILE_SIZE * 0.55;
      });

      if (!overlap) return movedCurrent;

      const result = attemptCombine(movedTile.managerId, overlap.managerId);
      if (!result.ok || !result.discoveredId) return movedCurrent;

      const resultManager = managers[result.discoveredId];
      setToast(result.alreadyKnown ? `Already discovered: ${resultManager.name}` : `Discovered: ${resultManager.name}!`);
      window.setTimeout(() => setToast(null), 1800);

      const remaining = movedCurrent.filter((tile) => tile.id !== movedTile.id && tile.id !== overlap.id);
      return [
        ...remaining,
        ...(managers[result.discoveredId]?.unlocked
          ? [{
              id: `${result.discoveredId}-${Date.now()}`,
              managerId: result.discoveredId,
              x: clampToWorkspace((movedTile.x + overlap.x) / 2, workspaceWidth),
              y: clampToWorkspace((movedTile.y + overlap.y) / 2, workspaceHeight),
            }]
          : []),
      ];
    });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <aside className="rounded-2xl border border-violet-300/20 bg-violet-900/30 p-4">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-violet-100">Character Library</h2>
          <span className="text-xs text-violet-200/80">
            {discoveredManagerIds.length} / {Object.keys(managers).length} discovered
          </span>
        </div>
        <p className="mb-3 text-xs text-violet-200/90">
          Unlocked: <span className="font-semibold">{unlockedLibraryIds.length}</span>. Locked characters cannot be dragged.
        </p>
        <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {discoveredManagerIds.map((managerId) => {
            const manager = managers[managerId];
            const unlocked = manager.unlocked;
            return (
              <button
                key={managerId}
                draggable={unlocked}
                onDragStart={(event) => {
                  if (!unlocked) { event.preventDefault(); return; }
                  event.dataTransfer.setData(DRAG_SOURCE_KEY, LIBRARY_SOURCE);
                  event.dataTransfer.setData("manager-id", managerId);
                }}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm shadow ${
                  unlocked
                    ? "border-violet-200/20 bg-violet-800/55 text-violet-50"
                    : "cursor-not-allowed border-violet-200/10 bg-violet-900/35 text-violet-300/70"
                }`}
                type="button"
              >
                <CharacterIcon managerId={managerId} />
                <div>
                  <div className="font-medium">{manager.name}</div>
                  <div className="text-xs text-violet-200">{manager.pps} pps</div>
                </div>
                <span className={`ml-auto rounded-md px-2 py-1 text-[10px] font-semibold ${
                  unlocked ? "bg-emerald-300/20 text-emerald-100" : "bg-violet-200/10 text-violet-200/80"
                }`}>
                  {unlocked ? "Unlocked" : "Locked"}
                </span>
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
            Drag unlocked characters from the library and overlap tiles to discover new ones.
          </p>

          {tiles.map((tile) => {
            const unlocked = managers[tile.managerId]?.unlocked;
            return (
              <button
                key={tile.id}
                draggable={unlocked}
                onDragStart={(event) => {
                  if (!unlocked) { event.preventDefault(); return; }
                  event.dataTransfer.setData(DRAG_SOURCE_KEY, WORKSPACE_SOURCE);
                  event.dataTransfer.setData("manager-id", tile.managerId);
                }}
                onDragEnd={(event) => {
                  if (!unlocked) return;
                  const workspace = event.currentTarget.parentElement?.getBoundingClientRect();
                  if (!workspace) return;
                  combineAt(tile.id, event.clientX - workspace.left - TILE_SIZE / 2, event.clientY - workspace.top - TILE_SIZE / 2, workspace.width, workspace.height);
                }}
                style={{ left: `${tile.x}px`, top: `${tile.y}px`, width: `${TILE_SIZE}px`, height: `${TILE_SIZE}px` }}
                className={`absolute flex flex-col items-center justify-center gap-1 rounded-2xl border p-2 text-center text-[11px] font-medium shadow-lg transition-transform ${
                  unlocked
                    ? "border-violet-100/30 bg-violet-700/80 text-violet-50 hover:scale-105"
                    : "cursor-not-allowed border-violet-200/15 bg-violet-900/65 text-violet-200/70"
                }`}
                type="button"
              >
                <CharacterIcon managerId={tile.managerId} />
                <span>{managers[tile.managerId].name}</span>
              </button>
            );
          })}

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
