"use client";

import { CityOverview } from "@/components/city/city-overview";
import { CharacterIcon } from "@/components/ui/icons";
import { RESOURCE_LABELS, getManagerUnlockCost } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

export default function CharactersPage() {
  const { managers, discoveredManagerIds, inventory, unlockManager } = useGameStore();

  const unlockedIds = discoveredManagerIds.filter((managerId) => managers[managerId]?.unlocked);
  const lockedDiscoveredIds = discoveredManagerIds.filter((managerId) => !managers[managerId]?.unlocked);

  return (
    <main className="space-y-5">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Characters</h1>
        <p className="text-violet-200/80">
          Unlock and upgrade your discovered characters here. Go to <span className="font-semibold">Discover</span> to find more combinations.
        </p>
      </header>

      <CityOverview />

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <h2 className="text-lg font-semibold text-violet-100">Unlocked Characters</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {unlockedIds.map((managerId) => (
            <div
              key={managerId}
              className="flex items-center gap-3 rounded-xl border border-emerald-200/25 bg-emerald-900/15 px-3 py-2"
            >
              <CharacterIcon managerId={managerId} />
              <div>
                <div className="font-medium text-violet-50">{managers[managerId].name}</div>
                <div className="text-xs text-violet-200">{managers[managerId].pps} PPS</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-violet-300/20 bg-violet-950/30 p-4">
        <h2 className="text-lg font-semibold text-violet-100">Discovered - Ready to Unlock</h2>
        <p className="mt-1 text-xs text-violet-200/80">Discovered characters appear here after combining in Discover.</p>

        <div className="mt-3 space-y-2">
          {lockedDiscoveredIds.length === 0 ? (
            <p className="rounded-xl border border-violet-200/20 bg-violet-900/30 px-3 py-3 text-sm text-violet-200/85">
              No discovered locked characters yet. Visit Discover and combine characters to reveal new ones.
            </p>
          ) : (
            lockedDiscoveredIds.map((managerId) => {
              const manager = managers[managerId];
              const costs = getManagerUnlockCost(managerId);
              if (!costs) {
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
                  <div className="mb-1 flex items-center gap-2">
                    <CharacterIcon managerId={managerId} />
                    <span className="font-medium">Unlock {manager.name}</span>
                  </div>
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
                </button>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
