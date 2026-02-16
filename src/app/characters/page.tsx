import { DiscoveryBoard } from "@/components/discovery/discovery-board";

export default function CharactersPage() {
  return (
    <main className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-violet-100">Characters</h1>
        <p className="text-violet-200/80">
          Drag discovered characters into the lab and combine them to discover new manager types.
        </p>
      </header>

      <DiscoveryBoard />
    </main>
  );
}
