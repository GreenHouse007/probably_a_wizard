"use client";

import type { ReactNode } from "react";
import {
  RESOURCE_LABELS,
  getApartmentUpgradeCost,
  getHouseCost,
  getLibraryBuildCost,
  getLibraryUpgradeCost,
  getLumberMillBuildCost,
  getLumberMillUpgradeCost,
  getMineBuildCost,
  getMineUpgradeCost,
  getQuarryBuildCost,
  getQuarryUpgradeCost,
} from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";
import { CityOverview } from "@/components/city/city-overview";
import { BuildingIcon } from "@/components/ui/icons";

const formatCost = (cost: Record<string, number> | Partial<Record<string, number>> | null) =>
  cost
    ? Object.entries(cost)
        .map(([resource, amount]) => `${amount} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`)
        .join(" + ")
    : "Max level reached";

export function BuildingsPanel() {
  const {
    inventory,
    buildings,
    housedPeople,
    housingCapacity,
    buildHouseOrApartment,
    buildOrUpgradeLumberMill,
    buildOrUpgradeQuarry,
    buildOrUpgradeMine,
    buildOrUpgradeLibrary,
  } = useGameStore();

  const housingCost = getHouseCost(buildings.houses) ?? getApartmentUpgradeCost();
  const lumberCost = buildings.lumberMillLevel === 0 ? getLumberMillBuildCost() : getLumberMillUpgradeCost(buildings.lumberMillLevel);
  const quarryCost = buildings.quarryLevel === 0 ? getQuarryBuildCost() : getQuarryUpgradeCost(buildings.quarryLevel);
  const mineCost = buildings.mineLevel === 0 ? getMineBuildCost() : getMineUpgradeCost(buildings.mineLevel);
  const libraryCost = buildings.libraryLevel === 0 ? getLibraryBuildCost() : getLibraryUpgradeCost(buildings.libraryLevel);

  return (
    <section className="space-y-4 rounded-2xl border border-violet-300/25 bg-violet-900/25 p-5">
      <CityOverview />
      <div className="rounded-xl border border-violet-300/20 bg-violet-950/30 p-4 text-sm text-violet-100">
        Capacity: {housedPeople} / {housingCapacity}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <BuildingCard
          icon={<BuildingIcon buildingId="housing" />}
          title={buildings.houses < 4 ? `Housing (House ${buildings.houses + 1}/4)` : "Housing (Apartment Upgrade)"}
          subtitle={buildings.houses < 4 ? "Build up to 4 houses, then upgrade apartments (+4 capacity)." : "Apartment upgrades are unlimited and add +4 capacity."}
          status={`Houses: ${buildings.houses} · Apartments: ${buildings.apartments}`}
          costLabel={formatCost(housingCost)}
          buttonLabel={buildings.houses < 4 ? "Build House" : "Upgrade Apartment"}
          onClick={buildHouseOrApartment}
        />
        <BuildingCard
          icon={<BuildingIcon buildingId="lumber-mill" />}
          title="Lumber Mill"
          subtitle="Unlocks Logs resource. Upgrades improve log production speed."
          status={`Level: ${buildings.lumberMillLevel}/4`}
          costLabel={formatCost(lumberCost)}
          buttonLabel={buildings.lumberMillLevel === 0 ? "Build Lumber Mill" : "Upgrade Lumber Mill"}
          onClick={buildOrUpgradeLumberMill}
        />
        <BuildingCard
          icon={<BuildingIcon buildingId="quarry" />}
          title="Quarry"
          subtitle="Unlocks Ore resource."
          status={`Level: ${buildings.quarryLevel}/4`}
          costLabel={formatCost(quarryCost)}
          buttonLabel={buildings.quarryLevel === 0 ? "Build Quarry" : "Upgrade Quarry"}
          onClick={buildOrUpgradeQuarry}
        />
        <BuildingCard
          icon={<BuildingIcon buildingId="mine" />}
          title="Mine"
          subtitle="Unlocks Gold resource."
          status={`Level: ${buildings.mineLevel}/3`}
          costLabel={formatCost(mineCost)}
          buttonLabel={buildings.mineLevel === 0 ? "Build Mine" : "Upgrade Mine"}
          onClick={buildOrUpgradeMine}
        />
        <BuildingCard
          icon={<BuildingIcon buildingId="library" />}
          title="Library"
          subtitle="Unlocks Knowledge resource and advanced characters."
          status={`Level: ${buildings.libraryLevel}/3`}
          costLabel={formatCost(libraryCost)}
          buttonLabel={buildings.libraryLevel === 0 ? "Build Library" : "Upgrade Library"}
          onClick={buildOrUpgradeLibrary}
        />
      </div>

      <p className="text-xs text-violet-200/80">
        Inventory snapshot: {Object.entries(inventory).map(([resource, amount]) => `${Math.floor(amount)} ${RESOURCE_LABELS[resource as keyof typeof RESOURCE_LABELS]}`).join(" · ")}
      </p>
    </section>
  );
}

function BuildingCard({
  icon,
  title,
  subtitle,
  status,
  costLabel,
  buttonLabel,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  status: string;
  costLabel: string;
  buttonLabel: string;
  onClick: () => { ok: boolean; reason?: string };
}) {
  return (
    <div className="rounded-xl border border-violet-200/20 bg-violet-950/35 p-4">
      <div className="flex items-center gap-2"><span>{icon}</span><h3 className="text-lg font-semibold text-violet-100">{title}</h3></div>
      <p className="text-sm text-violet-200/90">{subtitle}</p>
      <p className="mt-2 text-sm text-violet-100">{status}</p>
      <p className="mt-1 text-xs text-violet-300">Next cost: {costLabel}</p>
      <button
        type="button"
        onClick={() => {
          const result = onClick();
          if (!result.ok) window.alert(result.reason);
        }}
        className="mt-3 rounded-lg bg-violet-300 px-4 py-2 text-sm font-semibold text-violet-950 transition hover:bg-violet-200"
      >
        {buttonLabel}
      </button>
    </div>
  );
}
