import Image from "next/image";
import { type BuildingId, type ManagerId, type ResourceType } from "@/lib/game-data";

export function ResourceIcon({ resource }: { resource: ResourceType }) {
  const className = "h-10 w-10";

  // ─── Food Chain ─────────────────────────────────────────────
  if (resource === "berries") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="9" cy="13" r="4.5" fill="#e11d48" />
        <circle cx="15" cy="11" r="4.5" fill="#be123c" />
        <circle cx="12" cy="16" r="4" fill="#f43f5e" />
        <path d="M10 6c1-2 3-3 5-2" stroke="#22c55e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M11 7l-2-3" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (resource === "croissants") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 16c2-6 6-10 8-10s6 4 8 10c-3-1-6-1.5-8-1.5S7 15 4 16Z" fill="#f59e0b" />
        <path d="M6 15c2-4 4-7 6-7s4 3 6 7" stroke="#d97706" strokeWidth="1" fill="none" />
        <path d="M8 14c1.5-3 2.5-5 4-5s2.5 2 4 5" stroke="#b45309" strokeWidth=".8" fill="none" />
      </svg>
    );
  }
  if (resource === "tacos") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M3 16c0-5 4-10 9-10s9 5 9 10" fill="#fbbf24" />
        <path d="M6 14c0-3 3-6 6-6s6 3 6 6" fill="#92400e" />
        <circle cx="9" cy="13" r="1.2" fill="#ef4444" />
        <circle cx="12" cy="12" r="1" fill="#22c55e" />
        <circle cx="15" cy="13" r="1.1" fill="#fbbf24" />
      </svg>
    );
  }
  if (resource === "chocolate-cake") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="4" y="10" width="16" height="8" rx="2" fill="#7c2d12" />
        <rect x="4" y="13" width="16" height="5" rx="2" fill="#92400e" />
        <rect x="3" y="9" width="18" height="3" rx="1.5" fill="#dc2626" />
        <circle cx="8" cy="9" r="1" fill="#fbbf24" />
        <circle cx="12" cy="8" r="1" fill="#fbbf24" />
        <circle cx="16" cy="9" r="1" fill="#fbbf24" />
      </svg>
    );
  }
  if (resource === "sushi-platter") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <ellipse cx="12" cy="14" rx="9" ry="5" fill="#e2e8f0" />
        <rect x="5" y="10" width="4" height="6" rx="2" fill="#f97316" />
        <rect x="10" y="9" width="4" height="6" rx="2" fill="#ef4444" />
        <rect x="15" y="10" width="4" height="6" rx="2" fill="#f59e0b" />
        <rect x="5" y="9.5" width="4" height="2" rx="1" fill="#1f2937" />
        <rect x="15" y="9.5" width="4" height="2" rx="1" fill="#1f2937" />
      </svg>
    );
  }
  if (resource === "nectar-of-the-gods") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M8 6h8l-1 12H9L8 6Z" fill="#fbbf24" />
        <path d="M7 4h10v3H7z" fill="#f59e0b" />
        <path d="M10 8h4v2h-4z" fill="#fef3c7" opacity=".6" />
        <circle cx="12" cy="2.5" r="1.5" fill="#fde68a" />
        <line x1="9" y1="1" x2="9" y2="3" stroke="#fbbf24" strokeWidth=".8" />
        <line x1="15" y1="1" x2="15" y2="3" stroke="#fbbf24" strokeWidth=".8" />
      </svg>
    );
  }

  // ─── Construction Chain ─────────────────────────────────────
  if (resource === "cool-sticks") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="4" y="9" width="16" height="3" rx="1.5" fill="#d97706" transform="rotate(-22 12 10.5)" />
        <rect x="4" y="12.5" width="16" height="3" rx="1.5" fill="#b45309" transform="rotate(18 12 14)" />
        <circle cx="16" cy="8" r="2" fill="#38bdf8" opacity=".5" />
      </svg>
    );
  }
  if (resource === "cardboard-boxes") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="4" y="8" width="16" height="12" rx="1" fill="#d97706" />
        <path d="M4 8h16v3H4z" fill="#b45309" />
        <line x1="12" y1="8" x2="12" y2="20" stroke="#92400e" strokeWidth="1" />
        <line x1="8" y1="11" x2="16" y2="11" stroke="#92400e" strokeWidth=".8" />
      </svg>
    );
  }
  if (resource === "power-tools") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="9" y="3" width="6" height="12" rx="1" fill="#6b7280" />
        <rect x="7" y="14" width="10" height="5" rx="2" fill="#f59e0b" />
        <rect x="10" y="2" width="4" height="3" rx="1" fill="#9ca3af" />
        <circle cx="12" cy="8" r="1.5" fill="#d1d5db" />
      </svg>
    );
  }
  if (resource === "3d-printers") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="4" y="6" width="16" height="14" rx="2" fill="#6366f1" />
        <rect x="6" y="8" width="12" height="8" rx="1" fill="#312e81" />
        <rect x="9" y="11" width="6" height="4" rx=".5" fill="#a5b4fc" />
        <circle cx="7" cy="18" r="1" fill="#c4b5fd" />
        <circle cx="17" cy="18" r="1" fill="#c4b5fd" />
      </svg>
    );
  }
  if (resource === "autonomous-builders") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="7" y="6" width="10" height="10" rx="2" fill="#64748b" />
        <rect x="9" y="8" width="2.5" height="2.5" rx=".5" fill="#38bdf8" />
        <rect x="12.5" y="8" width="2.5" height="2.5" rx=".5" fill="#38bdf8" />
        <rect x="9" y="13" width="6" height="1.5" rx=".5" fill="#94a3b8" />
        <rect x="5" y="16" width="4" height="4" rx="1" fill="#475569" />
        <rect x="15" y="16" width="4" height="4" rx="1" fill="#475569" />
      </svg>
    );
  }
  if (resource === "nano-bots") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="8" cy="8" r="2" fill="#a5b4fc" />
        <circle cx="16" cy="8" r="2" fill="#a5b4fc" />
        <circle cx="12" cy="14" r="2.5" fill="#818cf8" />
        <circle cx="6" cy="16" r="1.5" fill="#c4b5fd" />
        <circle cx="18" cy="16" r="1.5" fill="#c4b5fd" />
        <circle cx="12" cy="20" r="1" fill="#e0e7ff" />
        <line x1="8" y1="8" x2="12" y2="14" stroke="#6366f1" strokeWidth=".6" />
        <line x1="16" y1="8" x2="12" y2="14" stroke="#6366f1" strokeWidth=".6" />
      </svg>
    );
  }

  // ─── Energy Chain ───────────────────────────────────────────
  if (resource === "coal") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 3 4 9l3 10h10l3-10-8-6Z" fill="#374151" />
        <path d="m9 10 3-2 3 2-1.5 5h-3L9 10Z" fill="#4b5563" />
        <circle cx="11" cy="12" r="1" fill="#f97316" opacity=".6" />
      </svg>
    );
  }
  if (resource === "aa-batteries") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="7" y="5" width="10" height="16" rx="1.5" fill="#fbbf24" />
        <rect x="7" y="5" width="10" height="6" rx="1" fill="#1f2937" />
        <rect x="10" y="3" width="4" height="3" rx="1" fill="#9ca3af" />
        <text x="12" y="10" textAnchor="middle" fontSize="5" fill="#fbbf24" fontWeight="700" fontFamily="ui-sans-serif">+</text>
      </svg>
    );
  }
  if (resource === "caffeinated-beverage") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="6" y="8" width="10" height="12" rx="2" fill="#e2e8f0" />
        <path d="M16 10h2a2 2 0 0 1 0 4h-2" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
        <rect x="7" y="9" width="8" height="4" rx="1" fill="#92400e" />
        <path d="M8 6c1-2 2-1 3-3" stroke="#94a3b8" strokeWidth=".8" fill="none" />
        <path d="M11 6c1-2 2-1 3-3" stroke="#94a3b8" strokeWidth=".8" fill="none" />
      </svg>
    );
  }
  if (resource === "radioactive-cores") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="12" cy="12" r="8" fill="#365314" />
        <circle cx="12" cy="12" r="5" fill="#84cc16" opacity=".6" />
        <circle cx="12" cy="12" r="2" fill="#ecfccb" />
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke="#a3e635" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (resource === "lightning-in-a-bottle") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M8 4h8l-1.5 7h3L10 22l1.5-8H8l0-10Z" fill="none" stroke="#e2e8f0" strokeWidth="1.2" />
        <rect x="9" y="5" width="6" height="14" rx="3" fill="#dbeafe" opacity=".3" />
        <path d="M13 8l-3 5h3l-1 4" fill="#fbbf24" stroke="#f59e0b" strokeWidth=".8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (resource === "pocket-black-hole") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="12" cy="12" r="9" fill="#1e1b4b" />
        <circle cx="12" cy="12" r="6" fill="#0f172a" />
        <circle cx="12" cy="12" r="3" fill="#020617" />
        <ellipse cx="12" cy="12" rx="10" ry="3" fill="none" stroke="#818cf8" strokeWidth=".8" opacity=".6" />
        <circle cx="17" cy="7" r="1" fill="#c4b5fd" opacity=".5" />
        <circle cx="7" cy="15" r=".8" fill="#a5b4fc" opacity=".4" />
      </svg>
    );
  }

  // ─── Culture Chain ──────────────────────────────────────────
  if (resource === "novels") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="5" y="4" width="14" height="17" rx="1.5" fill="#7c3aed" />
        <rect x="7" y="6" width="10" height="2" rx=".5" fill="#ddd6fe" />
        <rect x="7" y="10" width="8" height="1" rx=".5" fill="#c4b5fd" opacity=".5" />
        <rect x="7" y="12.5" width="9" height="1" rx=".5" fill="#c4b5fd" opacity=".5" />
        <rect x="7" y="15" width="6" height="1" rx=".5" fill="#c4b5fd" opacity=".5" />
        <rect x="4" y="4" width="2" height="17" rx=".5" fill="#5b21b6" />
      </svg>
    );
  }
  if (resource === "classic-movies") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" fill="#1f2937" />
        <rect x="5" y="7" width="14" height="10" rx="1" fill="#374151" />
        <circle cx="7" cy="5" r="1.5" fill="#9ca3af" />
        <circle cx="11" cy="5" r="1.5" fill="#9ca3af" />
        <circle cx="15" cy="5" r="1.5" fill="#9ca3af" />
        <polygon points="10,9 10,15 16,12" fill="#e5e7eb" />
      </svg>
    );
  }
  if (resource === "dino-bones") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M4 14c2-2 4-4 6-4h4c2 0 4 2 6 4" stroke="#e5e7eb" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="8" cy="9" r="3" fill="none" stroke="#d1d5db" strokeWidth="2" />
        <circle cx="8" cy="9" r="1" fill="#1f2937" />
        <path d="M16 10l2-3M18 10l2-2" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (resource === "video-games") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <rect x="2" y="8" width="20" height="10" rx="4" fill="#4b5563" />
        <circle cx="7.5" cy="13" r="2.5" fill="#374151" />
        <line x1="7.5" y1="11" x2="7.5" y2="15" stroke="#9ca3af" strokeWidth="1" />
        <line x1="5.5" y1="13" x2="9.5" y2="13" stroke="#9ca3af" strokeWidth="1" />
        <circle cx="15" cy="12" r="1.2" fill="#ef4444" />
        <circle cx="18" cy="13" r="1.2" fill="#3b82f6" />
        <circle cx="16.5" cy="15" r="1.2" fill="#22c55e" />
      </svg>
    );
  }
  if (resource === "artificial-intelligence") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <circle cx="12" cy="12" r="8" fill="#1e3a5f" />
        <circle cx="12" cy="12" r="3" fill="#38bdf8" opacity=".6" />
        <path d="M12 4v3M12 17v3M4 12h3M17 12h3" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" />
        <path d="M6.3 6.3l2 2M15.7 15.7l2 2M6.3 17.7l2-2M15.7 8.3l2-2" stroke="#0ea5e9" strokeWidth=".8" strokeLinecap="round" />
      </svg>
    );
  }
  if (resource === "alien-tech") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path d="M12 2L6 8l6 6 6-6-6-6Z" fill="#10b981" opacity=".7" />
        <path d="M12 10l-6 6 6 6 6-6-6-6Z" fill="#059669" opacity=".5" />
        <circle cx="12" cy="10" r="2" fill="#a7f3d0" />
        <circle cx="9" cy="7" r=".8" fill="#6ee7b7" />
        <circle cx="15" cy="7" r=".8" fill="#6ee7b7" />
      </svg>
    );
  }

  // Fallback
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#6366f1" />
      <text x="12" y="15" textAnchor="middle" fontSize="8" fill="#e0e7ff" fontWeight="700" fontFamily="ui-sans-serif">?</text>
    </svg>
  );
}

export function CharacterIcon({ managerId, compact = false }: { managerId: ManagerId; compact?: boolean }) {
  const size = compact ? 28 : 36;
  return (
    <Image
      src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${managerId}`}
      alt={managerId}
      width={size}
      height={size}
      unoptimized
      className="rounded-lg"
    />
  );
}

export function BuildingIcon({ buildingId, size = 48 }: { buildingId: BuildingId; size?: number }) {
  return (
    <Image
      src={`https://api.dicebear.com/9.x/shapes/svg?seed=${buildingId}`}
      alt={buildingId}
      width={size}
      height={size}
      unoptimized
      className="rounded-xl"
    />
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
