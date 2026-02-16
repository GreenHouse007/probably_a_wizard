export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a2e] text-white">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-purple-300">
          Probably A Wizard
        </h1>
        <p className="max-w-md text-lg text-purple-200/70">
          A magical adventure awaits...
        </p>
        <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-900/20 px-8 py-4 text-purple-300/80">
          Game coming soon
        </div>
      </main>
    </div>
  );
}
