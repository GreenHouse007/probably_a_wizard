import { MANAGER_DEFINITIONS, type BuildingId, type ManagerId, type ResourceType } from "@/lib/game-data";

export function ResourceIcon({ resource }: { resource: ResourceType }) {
  const className = "h-10 w-10";

  if (resource === "food") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12.7 2.7c-1.6 0-3.3.8-4.5 2C6.2 6.8 5.7 9.9 7 12.4c1.7 3.2 6.3 7.4 6.3 7.4s4.4-5 4.8-8.6c.3-2.5-.7-4.7-2.3-6.2-1-1-2.1-1.5-3.1-1.5Z" fill="#fb7185" />
        <path d="M9.2 5.1c.8-.7 1.8-1.2 2.8-1.3-.8-.9-1.9-1.5-3.1-1.5-1.9 0-3.4 1.4-3.7 3.3 1.2.1 2.7-.1 4-.5Z" fill="#22c55e" />
        <circle cx="14.7" cy="9.5" r="1.1" fill="#fecdd3" />
      </svg>
    );
  }

  if (resource === "water") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 2.5s6 7.4 6 11.4A6 6 0 1 1 6 14c0-4 6-11.5 6-11.5Z" fill="#38bdf8" />
        <path d="M9.5 14.8a2.7 2.7 0 0 0 2.5 2.5" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (resource === "sticks") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="4" y="9" width="16" height="3" rx="1.5" fill="#d97706" transform="rotate(-22 12 10.5)" />
        <rect x="4" y="12.5" width="16" height="3" rx="1.5" fill="#b45309" transform="rotate(18 12 14)" />
      </svg>
    );
  }

  if (resource === "stone") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 2.8 4.6 8.6l2.4 10 10 2.6 2.4-10L12 2.8Z" fill="#94a3b8" />
        <path d="m8.3 10.2 3.7-2.8 3.7 2.8-1.4 5.4H9.7l-1.4-5.4Z" fill="#e2e8f0" />
      </svg>
    );
  }

  if (resource === "logs") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="3" y="6" width="18" height="5" rx="2.5" fill="#92400e" />
        <rect x="3" y="13" width="18" height="5" rx="2.5" fill="#b45309" />
        <circle cx="5.5" cy="8.5" r="1.2" fill="#fbbf24" opacity=".4" />
      </svg>
    );
  }

  if (resource === "ore") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 3 4 9l3 10h10l3-10-8-6Z" fill="#64748b" />
        <circle cx="10" cy="11.5" r="1.5" fill="#cbd5e1" />
        <circle cx="14" cy="13.5" r="1.2" fill="#e2e8f0" />
      </svg>
    );
  }

  if (resource === "gold") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 9h16l-2 9H6L4 9Z" fill="#fbbf24" />
        <path d="M7 6h10l3 3H4l3-3Z" fill="#f59e0b" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#6366f1" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="#e0e7ff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BuildingIcon({ buildingId, compact = false }: { buildingId: BuildingId; compact?: boolean }) {
  const size = compact ? "h-7 w-7" : "h-9 w-9";

  if (buildingId === "housing") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <path d="M4 11 12 5l8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8Z" fill="#c4b5fd" />
        <path d="M9 20v-5h6v5" fill="#5b21b6" />
      </svg>
    );
  }

  if (buildingId === "lumber-mill") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <rect x="3" y="12" width="18" height="8" rx="1.5" fill="#166534" />
        <path d="M12 4v8M8 8h8" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (buildingId === "quarry") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <path d="m3 14 6-6 5 4 7-5v12H3Z" fill="#64748b" />
        <circle cx="10" cy="14" r="1.5" fill="#cbd5e1" />
      </svg>
    );
  }

  if (buildingId === "mine") {
    return (
      <svg viewBox="0 0 24 24" className={size} aria-hidden>
        <path d="M2.5 18.5 9.5 7h5L21.5 18.5Z" fill="#475569" />
        <path d="M9.5 7 12 10l2.5-3" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={size} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#4338ca" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="#e0e7ff" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const TIER_COLORS = ["#d8b4fe", "#93c5fd", "#86efac", "#fcd34d", "#f9a8d4", "#fdba74", "#67e8f9", "#a5b4fc", "#fca5a5", "#fde68a"];

export function CharacterIcon({ managerId, compact = false }: { managerId: ManagerId; compact?: boolean }) {
  const manager = MANAGER_DEFINITIONS[managerId];
  const tier = Math.max(1, Math.min(10, manager?.tier ?? 1));
  const fill = TIER_COLORS[tier - 1];
  const className = compact ? "h-7 w-7" : "h-9 w-9";

  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden>
      <rect x="4" y="4" width="48" height="48" rx="14" fill={fill} />
      <circle cx="28" cy="22" r="8" fill="#1f2937" opacity=".75" />
      <path d="M15 44c2-8 7-12 13-12s11 4 13 12" fill="#1f2937" opacity=".75" />
      <text x="28" y="18" textAnchor="middle" fontSize="9" fill="#111827" fontWeight="700" fontFamily="ui-sans-serif, system-ui">T{tier}</text>
    </svg>
  );
}

export function SparklesGraphic() {
  return (
    <svg viewBox="0 0 240 80" className="h-16 w-full" aria-hidden>
      <defs>
        <linearGradient id="spark" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="38" r="5" fill="url(#spark)" />
      <circle cx="82" cy="20" r="3" fill="#fde68a" />
      <circle cx="140" cy="50" r="4" fill="#a5b4fc" />
      <circle cx="204" cy="22" r="5" fill="#f9a8d4" />
      <path d="M8 58c38-22 66 11 100-10s70-14 124-4" stroke="url(#spark)" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}
