"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CharacterIcon } from "@/components/ui/icons";
import { type ManagerId } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";
import { playKiss, playSigh, playEw } from "@/lib/sounds";

// ─── Constants ────────────────────────────────────────────────────────────────

const TILE_SIZE = 88;
const MAX_TILES = 30;
const DRAG_MOVE_THRESHOLD = 5;

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkspaceTile = { id: string; managerId: ManagerId; x: number; y: number };

type HeartParticle = { id: string; x: number; y: number; dx: number; delay: number };

type DragState = {
  managerId: ManagerId;
  sourceTileId: string | null; // null = dragged from library
  ghostX: number;
  ghostY: number;
  offsetX: number;
  offsetY: number;
  hasMoved: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clampX(value: number, workspaceWidth: number) {
  return Math.min(Math.max(0, value), Math.max(0, workspaceWidth - TILE_SIZE));
}

function clampY(value: number, workspaceHeight: number) {
  return Math.min(Math.max(0, value), Math.max(0, workspaceHeight - TILE_SIZE));
}

function makeTileId(managerId: ManagerId) {
  return `${managerId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DiscoveryBoard() {
  const { managers, discoveredManagerIds, attemptCombine } = useGameStore();

  const [tiles, setTiles] = useState<WorkspaceTile[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [jitterIds, setJitterIds] = useState<Set<string>>(new Set());
  const [showFull, setShowFull] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  // Keep latest tiles in a ref so pointer handlers don't close over stale state
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;
  const dragRef = useRef(drag);
  dragRef.current = drag;

  // ── Heart particles ──────────────────────────────────────────────────────

  const spawnHearts = useCallback((x: number, y: number, count: number) => {
    const newHearts: HeartParticle[] = Array.from({ length: count }, (_, i) => ({
      id: `h-${Date.now()}-${i}`,
      x,
      y,
      dx: (Math.random() - 0.5) * 60,
      delay: i * 0.05,
    }));
    setHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.some((n) => n.id === h.id)));
    }, 900);
  }, []);

  // ── Tile placement ───────────────────────────────────────────────────────

  const addTileAt = useCallback(
    (managerId: ManagerId, x: number, y: number) => {
      const bounds = workspaceRef.current?.getBoundingClientRect();
      const w = bounds?.width ?? 600;
      const h = bounds?.height ?? 480;
      setTiles((prev) => [
        ...prev,
        { id: makeTileId(managerId), managerId, x: clampX(x, w), y: clampY(y, h) },
      ]);
    },
    [],
  );

  // ── Combination resolution ───────────────────────────────────────────────

  const resolveCombination = useCallback(
    (
      movedManagerId: ManagerId,
      targetTile: WorkspaceTile,
      droppedX: number,
      droppedY: number,
    ) => {
      const result = attemptCombine(movedManagerId, targetTile.managerId);
      const bounds = workspaceRef.current?.getBoundingClientRect();
      const w = bounds?.width ?? 600;
      const h = bounds?.height ?? 480;
      const midX = (droppedX + targetTile.x) / 2;
      const midY = (droppedY + targetTile.y) / 2;

      if (!result.ok) {
        // Invalid — push apart + jitter
        playEw();
        const pushedTargetId = targetTile.id;
        const pushedMovedId = makeTileId(movedManagerId);
        setTiles((prev) => [
          ...prev.map((t) =>
            t.id === pushedTargetId ? { ...t, x: clampX(t.x + 30, w) } : t,
          ),
          {
            id: pushedMovedId,
            managerId: movedManagerId,
            x: clampX(droppedX - 30, w),
            y: clampY(droppedY, h),
          },
        ]);
        setJitterIds(new Set([pushedTargetId, pushedMovedId]));
        setTimeout(() => setJitterIds(new Set()), 500);
        return;
      }

      const resultUnlocked = result.discoveredId && managers[result.discoveredId]?.unlocked;

      if (resultUnlocked && result.discoveredId) {
        // Success
        playKiss();
        spawnHearts(midX + (bounds?.left ?? 0), midY + (bounds?.top ?? 0), 6);
        setTiles((prev) => [
          ...prev.filter((t) => t.id !== targetTile.id),
          {
            id: makeTileId(result.discoveredId!),
            managerId: result.discoveredId!,
            x: clampX(midX, w),
            y: clampY(midY, h),
          },
        ]);
      } else {
        // Valid but locked
        playSigh();
        spawnHearts(midX + (bounds?.left ?? 0), midY + (bounds?.top ?? 0), 1);
        // Both tiles remain — put moved tile back
        setTiles((prev) => [
          ...prev,
          {
            id: makeTileId(movedManagerId),
            managerId: movedManagerId,
            x: clampX(droppedX, w),
            y: clampY(droppedY, h),
          },
        ]);
      }
    },
    [attemptCombine, managers, spawnHearts],
  );

  // ── Drop finalization ────────────────────────────────────────────────────

  const finalizeDrop = useCallback(
    (clientX: number, clientY: number) => {
      const d = dragRef.current;
      if (!d) return;

      const bounds = workspaceRef.current?.getBoundingClientRect();
      if (!bounds) {
        // Just discard
        if (d.sourceTileId) {
          // tile was removed from tiles when drag started — add it back
          setTiles((prev) => [
            ...prev,
            { id: d.sourceTileId!, managerId: d.managerId, x: 0, y: 0 },
          ]);
        }
        return;
      }

      const tileX = clientX - bounds.left - d.offsetX;
      const tileY = clientY - bounds.top - d.offsetY;
      const tileCenterX = tileX + TILE_SIZE / 2;
      const tileCenterY = tileY + TILE_SIZE / 2;

      // Delete check: center outside workspace bounds
      if (
        tileCenterX < 0 ||
        tileCenterX > bounds.width ||
        tileCenterY < 0 ||
        tileCenterY > bounds.height
      ) {
        // Discard tile — nothing to re-add (for library drags just don't place)
        return;
      }

      const currentTiles = tilesRef.current;

      // Overlap check
      const overlap = currentTiles.find(
        (t) =>
          Math.abs(t.x - tileX) < TILE_SIZE * 0.55 &&
          Math.abs(t.y - tileY) < TILE_SIZE * 0.55,
      );

      if (overlap) {
        resolveCombination(d.managerId, overlap, tileX, tileY);
      } else {
        addTileAt(d.managerId, tileX, tileY);
      }
    },
    [resolveCombination, addTileAt],
  );

  // ── Global pointer event listeners (active while dragging) ───────────────

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => {
      setDrag((prev) => {
        if (!prev) return prev;
        const dx = e.clientX - (prev.ghostX + prev.offsetX);
        const dy = e.clientY - (prev.ghostY + prev.offsetY);
        const moved = prev.hasMoved || Math.hypot(dx, dy) > DRAG_MOVE_THRESHOLD;
        return {
          ...prev,
          ghostX: e.clientX - prev.offsetX,
          ghostY: e.clientY - prev.offsetY,
          hasMoved: moved,
        };
      });
    };

    const onUp = (e: PointerEvent) => {
      finalizeDrop(e.clientX, e.clientY);
      setDrag(null);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    };
  }, [drag, finalizeDrop]);

  // ── Library drag start ───────────────────────────────────────────────────

  const handleLibraryPointerDown = (e: React.PointerEvent, managerId: ManagerId) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      managerId,
      sourceTileId: null,
      ghostX: e.clientX - TILE_SIZE / 2,
      ghostY: e.clientY - TILE_SIZE / 2,
      offsetX: TILE_SIZE / 2,
      offsetY: TILE_SIZE / 2,
      hasMoved: false,
    });
  };

  const handleLibraryClick = (managerId: ManagerId) => {
    // Only fires when hasMoved is false (tap, not drag-then-release)
    if (dragRef.current?.hasMoved) return;
    if (tiles.length >= MAX_TILES) {
      setShowFull(true);
      setTimeout(() => setShowFull(false), 2000);
      return;
    }
    const bounds = workspaceRef.current?.getBoundingClientRect();
    const w = (bounds?.width ?? 600) - TILE_SIZE;
    const h = (bounds?.height ?? 480) - TILE_SIZE;
    addTileAt(managerId, Math.random() * w, Math.random() * h);
  };

  // ── Workspace tile drag start ────────────────────────────────────────────

  const handleTilePointerDown = (e: React.PointerEvent, tile: WorkspaceTile) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const bounds = workspaceRef.current?.getBoundingClientRect();
    if (!bounds) return;
    // Offset = where within the tile the pointer landed
    const offsetX = e.clientX - (bounds.left + tile.x);
    const offsetY = e.clientY - (bounds.top + tile.y);
    // Remove tile from workspace immediately (ghost represents it while dragging)
    setTiles((prev) => prev.filter((t) => t.id !== tile.id));
    setDrag({
      managerId: tile.managerId,
      sourceTileId: tile.id,
      ghostX: e.clientX - offsetX,
      ghostY: e.clientY - offsetY,
      offsetX,
      offsetY,
      hasMoved: false,
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────

  const totalManagers = Object.keys(managers).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
      {/* ── Library sidebar ── */}
      <aside className="rounded-2xl border border-violet-300/20 bg-violet-900/30 p-4">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold text-violet-100">Character Library</h2>
          <span className="text-xs text-violet-200/80">
            {discoveredManagerIds.length} / {totalManagers} discovered
          </span>
        </div>
        <p className="mb-3 text-xs text-violet-200/70">
          Drag or tap to place characters on the workspace.
        </p>
        <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
          {discoveredManagerIds.map((managerId) => {
            const manager = managers[managerId];
            const unlocked = manager?.unlocked ?? false;
            return (
              <button
                key={managerId}
                type="button"
                style={{ touchAction: "none" }}
                onPointerDown={
                  unlocked ? (e) => handleLibraryPointerDown(e, managerId) : undefined
                }
                onClick={unlocked ? () => handleLibraryClick(managerId) : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm shadow select-none ${
                  unlocked
                    ? "cursor-grab border-violet-200/20 bg-violet-800/55 text-violet-50 active:cursor-grabbing"
                    : "cursor-not-allowed border-violet-200/10 bg-violet-900/35 text-violet-300/60"
                }`}
              >
                <CharacterIcon managerId={managerId} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{manager?.name}</div>
                  <div className="text-xs text-violet-200/70">{manager?.pps} pps</div>
                </div>
                <span
                  className={`ml-auto shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${
                    unlocked
                      ? "bg-emerald-300/20 text-emerald-100"
                      : "bg-violet-200/10 text-violet-200/70"
                  }`}
                >
                  {unlocked ? "Unlocked" : "🔒 Locked"}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ── Workspace ── */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-violet-200/80">
            Overlap two characters to attempt a combination.
            {tiles.length > 0 && (
              <span className="ml-2 text-violet-300/60">
                {tiles.length} / {MAX_TILES} tiles
              </span>
            )}
          </p>
          <div className="flex items-center gap-2">
            {showFull && (
              <span className="text-xs text-amber-300">Workspace full — clear some tiles</span>
            )}
            {tiles.length > 0 && (
              <button
                type="button"
                onClick={() => setTiles([])}
                className="rounded-lg border border-violet-300/20 bg-violet-800/40 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-700/50"
              >
                Clear Workspace
              </button>
            )}
          </div>
        </div>

        <div
          ref={workspaceRef}
          className="relative min-h-[480px] rounded-2xl border border-violet-300/20 bg-[radial-gradient(circle_at_20%_10%,rgba(167,139,250,0.16),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(96,165,250,0.14),transparent_40%),linear-gradient(180deg,rgba(30,27,75,0.8),rgba(17,24,39,0.9))] overflow-hidden"
        >
          {/* Workspace tiles */}
          {tiles.map((tile) => {
            const isJittering = jitterIds.has(tile.id);
            return (
              <button
                key={tile.id}
                type="button"
                style={{
                  left: `${tile.x}px`,
                  top: `${tile.y}px`,
                  width: `${TILE_SIZE}px`,
                  height: `${TILE_SIZE}px`,
                  touchAction: "none",
                  animation: isJittering ? "tileJitter 0.45s ease-in-out" : undefined,
                }}
                onPointerDown={(e) => handleTilePointerDown(e, tile)}
                className="absolute flex cursor-grab flex-col items-center justify-center gap-1 rounded-2xl border border-violet-100/30 bg-violet-700/80 p-2 text-center text-[11px] font-medium text-violet-50 shadow-lg select-none active:cursor-grabbing"
              >
                <CharacterIcon managerId={tile.managerId} />
                <span className="leading-tight">{managers[tile.managerId]?.name}</span>
              </button>
            );
          })}

          {/* Heart particles */}
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="pointer-events-none fixed z-50 text-lg"
              style={{
                left: `${heart.x + heart.dx}px`,
                top: `${heart.y}px`,
                animation: `heartFloat 0.7s ease-out forwards`,
                animationDelay: `${heart.delay}s`,
              }}
            >
              ❤️
            </div>
          ))}

          {/* Empty state */}
          {tiles.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-violet-200/40">
                Drag or tap characters from the library to get started
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Floating drag ghost */}
      {drag && (
        <div
          className="pointer-events-none fixed z-50 flex flex-col items-center justify-center gap-1 rounded-2xl border border-violet-100/30 bg-violet-700/90 p-2 text-center text-[11px] font-medium text-violet-50 shadow-2xl opacity-80"
          style={{
            left: `${drag.ghostX}px`,
            top: `${drag.ghostY}px`,
            width: `${TILE_SIZE}px`,
            height: `${TILE_SIZE}px`,
          }}
        >
          <CharacterIcon managerId={drag.managerId} />
          <span className="leading-tight">{managers[drag.managerId]?.name}</span>
        </div>
      )}
    </div>
  );
}
