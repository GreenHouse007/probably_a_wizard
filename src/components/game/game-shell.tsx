"use client";

import { GameRuntime } from "@/components/game/game-runtime";
import { TopNav } from "@/components/layout/top-nav";
import { RESOURCE_LABELS } from "@/lib/game-data";
import { GameStoreProvider, useGameStore } from "@/store/game-store";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { hydrated, offlineProgressSummary, dismissOfflineProgressSummary } = useGameStore();

  const offlineGainRows = offlineProgressSummary
    ? (Object.entries(offlineProgressSummary.gains) as [keyof typeof RESOURCE_LABELS, number][])
        .filter(([, amount]) => amount > 0)
    : [];

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
