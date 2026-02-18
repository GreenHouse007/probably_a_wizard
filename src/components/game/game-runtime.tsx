"use client";

import { useEffect, useRef } from "react";
import { getChainTierResource, type BuildingId } from "@/lib/game-data";
import { useGameStore } from "@/store/game-store";

// Each assigned manager contributes 1 conversion per 20 seconds
const CONVERSION_RATE_PER_MANAGER = 1 / 20;

export function GameRuntime() {
  const { slots, buildingSlots, addResource, getEffectivePps, hydrated, buildings, convertResource } =
    useGameStore();
  const fractionalRef = useRef<Record<string, number>>({});
  const conversionProgressRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!hydrated) return;

    const interval = window.setInterval(() => {
      const deltaSeconds = 0.25;

      // ── Gathering loop ───────────────────────────────────────────────────
      for (const slot of slots) {
        if (!slot.managerId) continue;

        const effectivePps = getEffectivePps(slot.managerId);
        if (effectivePps <= 0) continue;

        const currentProgress = fractionalRef.current[slot.id] ?? 0;
        const total = currentProgress + effectivePps * deltaSeconds;
        const whole = Math.floor(total);
        fractionalRef.current[slot.id] = total - whole;

        if (whole > 0) {
          const resourceType = getChainTierResource(slot.chainId, 0);
          addResource(resourceType, whole);
        }
      }

      // ── Auto-conversion loop ─────────────────────────────────────────────
      // Count assigned managers per building
      const managersPerBuilding: Record<string, number> = {};
      for (const bSlot of buildingSlots) {
        if (!bSlot.managerId) continue;
        if (!buildings.builtBuildings[bSlot.buildingId]) continue;
        managersPerBuilding[bSlot.buildingId] = (managersPerBuilding[bSlot.buildingId] ?? 0) + 1;
      }

      for (const [buildingId, numManagers] of Object.entries(managersPerBuilding)) {
        const current = conversionProgressRef.current[buildingId] ?? 0;
        const next = current + numManagers * CONVERSION_RATE_PER_MANAGER * deltaSeconds;

        if (next >= 1) {
          const result = convertResource(buildingId as BuildingId);
          conversionProgressRef.current[buildingId] = result.ok ? next - 1 : 0;
        } else {
          conversionProgressRef.current[buildingId] = next;
        }
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [slots, buildingSlots, addResource, getEffectivePps, hydrated, buildings, convertResource]);

  return null;
}
