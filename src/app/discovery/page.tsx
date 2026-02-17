import { CityOverview } from "@/components/city/city-overview";
import { DiscoveryBoard } from "@/components/discovery/discovery-board";

export default function DiscoveryPage() {
  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Discover</h1>
        <p className="text-violet-200/80">
          Drag unlocked characters into the lab and combine them to discover new character types.
        </p>
      </header>

      <CityOverview />

      <DiscoveryBoard />
    </main>
  );
}
