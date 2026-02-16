# Probably A Wizard (MVP)

A deploy-ready MVP of an idle + alchemy discovery game built with Next.js App Router + TypeScript + Tailwind.

## Features

- **Resources page (`/`)**
  - Click-to-gather: Food, Water, Sticks, Stone.
  - Visual SVG resource icons and fantasy UI styling.
  - Live inventory counters and housing summary.
  - 4 fixed manager slots (one per resource).
  - Assign discovered managers to slots for passive generation (pps).
  - Each manager can only be assigned to one slot at a time.

- **Characters page (`/characters`)**
  - Alchemy-style manager library with placeholder character icons.
  - Library acts as a palette: drag discovered characters into workspace as instances.
  - Workspace tiles merge by overlap and consume both inputs to spawn a result.
  - Discovery toast feedback for new and already-known combinations.

- **Buildings page (`/buildings`)**
  - Build **Huts** to increase housing capacity.
  - Each hut provides +2 housing.
  - Hut cost: 12 Sticks + 8 Stone.
  - Gatherer/Collector unlocks are blocked if housing is full.

## Character Recipe Chain (MVP set)

- Builder = Gatherer + Collector
- Explorer = Gatherer + Gatherer
- Miner = Collector + Collector
- Engineer = Builder + Explorer
- Foreman = Builder + Builder
- Scout = Explorer + Explorer
- Prospector = Miner + Explorer
- Smith = Miner + Builder
- Architect = Engineer + Builder
- Cartographer = Engineer + Explorer
- Driller = Engineer + Miner
- Supply Chief = Foreman + Collector
- Trailblazer = Scout + Gatherer
- Excavator = Driller + Foreman

## Persistence

- Local persistence adapter currently backed by `localStorage`.
- Structured with a persistence interface to swap in Dexie/IndexedDB cleanly.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Framework preset: **Next.js**.
4. Build command: `npm run build` (default).
5. Output: default Next.js output.

No environment variables are required for this MVP.
