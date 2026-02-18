"use client";

import { useEffect } from "react";
import { GameRuntime } from "@/components/game/game-runtime";
import { TopNav } from "@/components/layout/top-nav";
import { RESOURCE_LABELS } from "@/lib/game-data";
import { GameStoreProvider, useGameStore } from "@/store/game-store";

function ShellInner({ children }: { children: React.ReactNode }) {
  const {
    hydrated,
    offlineProgressSummary,
    dismissOfflineProgressSummary,
    newResourceUnlocked,
    dismissNewResourceUnlocked,
  } = useGameStore();

  const offlineGainRows = offlineProgressSummary
    ? (Object.entries(offlineProgressSummary.gains) as [keyof typeof RESOURCE_LABELS, number][])
        .filter(([, amount]) => amount > 0)
    : [];

  // Auto-dismiss the unlock toast after 4 seconds
  useEffect(() => {
    if (!newResourceUnlocked) return;
    const timer = setTimeout(dismissNewResourceUnlocked, 4000);
    return () => clearTimeout(timer);
  }, [newResourceUnlocked, dismissNewResourceUnlocked]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 text-violet-50 md:px-6">
      <TopNav />
      <GameRuntime />
      {!hydrated ? (
        <div className="rounded-2xl border border-violet-200/20 bg-violet-900/30 p-8 text-center text-violet-100">
          Loading save data...
        </div>
      ) : (
        children
      )}

      {/* Offline progress popup */}
      {offlineProgressSummary && offlineGainRows.length > 0 ? (
        <div className="fixed inset-x-0 top-5 z-50 mx-auto w-full max-w-lg px-4">
          <div className="rounded-xl border border-emerald-200/35 bg-emerald-900/95 p-4 text-emerald-50 shadow-2xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Welcome back!</h2>
              <button
                type="button"
                onClick={dismissOfflineProgressSummary}
                className="rounded-md border border-emerald-100/40 px-2 py-1 text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
            <p className="mb-2 text-sm text-emerald-100/90">
              While you were away for about {Math.floor(offlineProgressSummary.elapsedSeconds)} seconds,
              your managers produced:
            </p>
            <ul className="space-y-1 text-sm">
              {offlineGainRows.map(([resource, amount]) => (
                <li key={resource}>
                  {RESOURCE_LABELS[resource]}: +{amount.toFixed(1)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {/* New resource unlock toast */}
      {newResourceUnlocked ? (
        <div className="fixed inset-x-0 bottom-6 z-50 mx-auto w-full max-w-sm px-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/40 bg-amber-900/95 px-4 py-3 text-amber-50 shadow-2xl">
            <div>
              <p className="text-sm font-semibold">New resource unlocked!</p>
              <p className="text-sm text-amber-200">{newResourceUnlocked}</p>
            </div>
            <button
              type="button"
              onClick={dismissNewResourceUnlocked}
              className="shrink-0 rounded-md border border-amber-200/40 px-2 py-1 text-xs font-semibold text-amber-100"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GameShell({ children }: { children: React.ReactNode }) {
  return (
    <GameStoreProvider>
      <ShellInner>{children}</ShellInner>
    </GameStoreProvider>
  );
}
