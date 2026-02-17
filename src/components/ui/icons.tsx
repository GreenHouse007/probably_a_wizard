import type { ManagerId, ResourceType } from "@/lib/game-data";

// Resource glyphs adapted from open-source Heroicons/Twemoji style references.
export function ResourceIcon({ resource }: { resource: ResourceType }) {
  if (resource === "food") {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <path d="M12.7 2.7c-1.6 0-3.3.8-4.5 2C6.2 6.8 5.7 9.9 7 12.4c1.7 3.2 6.3 7.4 6.3 7.4s4.4-5 4.8-8.6c.3-2.5-.7-4.7-2.3-6.2-1-1-2.1-1.5-3.1-1.5Z" fill="#fb7185"/>
        <path d="M9.2 5.1c.8-.7 1.8-1.2 2.8-1.3-.8-.9-1.9-1.5-3.1-1.5-1.9 0-3.4 1.4-3.7 3.3 1.2.1 2.7-.1 4-.5Z" fill="#22c55e"/>
        <circle cx="14.7" cy="9.5" r="1.1" fill="#fecdd3" />
      </svg>
    );
  }

  if (resource === "water") {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <path d="M12 2.5s6 7.4 6 11.4A6 6 0 1 1 6 14c0-4 6-11.5 6-11.5Z" fill="#38bdf8" />
        <path d="M9.5 14.8a2.7 2.7 0 0 0 2.5 2.5" stroke="#e0f2fe" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (resource === "sticks") {
    return (
      <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
        <rect x="4" y="9" width="16" height="3" rx="1.5" fill="#d97706" transform="rotate(-22 12 10.5)" />
        <rect x="4" y="12.5" width="16" height="3" rx="1.5" fill="#b45309" transform="rotate(18 12 14)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden>
      <path d="M12 2.8 4.6 8.6l2.4 10 10 2.6 2.4-10L12 2.8Z" fill="#94a3b8" />
      <path d="m8.3 10.2 3.7-2.8 3.7 2.8-1.4 5.4H9.7l-1.4-5.4Z" fill="#e2e8f0" />
    </svg>
  );
}

const PALETTE: string[] = [
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#f87171",
  "#22d3ee",
];

function hashColor(id: string) {
  const sum = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

export function CharacterIcon({ managerId, compact = false }: { managerId: ManagerId; compact?: boolean }) {
  const fill = hashColor(managerId);
  const initials = managerId
    .split("-")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <svg viewBox="0 0 56 56" className={compact ? "h-7 w-7" : "h-9 w-9"} aria-hidden>
      <rect x="4" y="4" width="48" height="48" rx="14" fill={fill} />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fontSize="16"
        fill="#120f24"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui"
      >
        {initials}
      </text>
    </svg>
  );
}

export function HutIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={compact ? "h-7 w-7" : "h-16 w-16"} aria-hidden>
      <path d="M8 31L32 12l24 19" fill="#7c3aed" />
      <rect x="14" y="30" width="36" height="24" rx="3" fill="#a78bfa" />
      <rect x="28" y="38" width="8" height="16" fill="#312e81" />
      <circle cx="44" cy="41" r="3" fill="#fef3c7" />
    </svg>
  );
}

export function WorkshopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <rect x="3" y="10" width="18" height="10" rx="2" fill="#67e8f9" />
      <rect x="6" y="5" width="4" height="5" rx="1" fill="#22d3ee" />
      <rect x="14" y="6" width="4" height="4" rx="1" fill="#0891b2" />
      <path d="M7 14h3v4H7zm5 0h5v2h-5z" fill="#0e7490" />
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
