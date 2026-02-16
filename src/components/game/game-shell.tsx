"use client";

import { GameRuntime } from "@/components/game/game-runtime";
import { TopNav } from "@/components/layout/top-nav";
import { GameStoreProvider, useGameStore } from "@/store/game-store";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { hydrated } = useGameStore();

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
