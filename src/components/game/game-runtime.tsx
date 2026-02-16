"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/game-store";

export function GameRuntime() {
  const { slots, addResource, getEffectivePps, hydrated } = useGameStore();
  const fractionalRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const interval = window.setInterval(() => {
      const deltaSeconds = 0.25;

      for (const slot of slots) {
        if (!slot.managerId) {
          continue;
        }

        const effectivePps = getEffectivePps(slot.managerId, slot.resourceType);
        if (effectivePps <= 0) {
          continue;
        }

        const currentProgress = fractionalRef.current[slot.id] ?? 0;
        const total = currentProgress + effectivePps * deltaSeconds;
        const whole = Math.floor(total);
        fractionalRef.current[slot.id] = total - whole;

        if (whole > 0) {
          addResource(slot.resourceType, whole);
        }
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [slots, addResource, getEffectivePps, hydrated]);

  return null;
}
