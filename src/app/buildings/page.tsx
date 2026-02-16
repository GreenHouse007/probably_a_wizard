import { BuildingsPanel } from "@/components/buildings/buildings-panel";

export default function BuildingsPage() {
  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Buildings</h1>
        <p className="text-violet-200/80">
          Expand your settlement to house more people and unlock growth.
        </p>
      </header>
      <BuildingsPanel />
    </main>
  );
}
