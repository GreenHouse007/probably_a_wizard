import type { ManagerId, ResourceType } from "@/lib/game-data";

export function ResourceIcon({ resource }: { resource: ResourceType }) {
  if (resource === "food") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
        <circle cx="24" cy="24" r="14" fill="#f97316" />
        <path d="M24 8c5 0 9 4 9 9" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  if (resource === "water") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
        <path d="M24 6s10 12 10 19a10 10 0 11-20 0c0-7 10-19 10-19z" fill="#38bdf8" />
      </svg>
    );
  }

  if (resource === "sticks") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
        <rect x="11" y="18" width="26" height="5" rx="2.5" fill="#d97706" transform="rotate(-15 24 20)" />
        <rect x="11" y="24" width="26" height="5" rx="2.5" fill="#b45309" transform="rotate(18 24 26)" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
      <polygon points="24,6 39,17 33,39 15,39 9,17" fill="#9ca3af" />
      <polygon points="24,13 33,20 29,33 19,33 15,20" fill="#d1d5db" />
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

export function CharacterIcon({ managerId }: { managerId: ManagerId }) {
  const fill = hashColor(managerId);
  const initials = managerId
    .split("-")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <svg viewBox="0 0 56 56" className="h-9 w-9" aria-hidden>
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

export function HutIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
      <path d="M8 31L32 12l24 19" fill="#7c3aed" />
      <rect x="14" y="30" width="36" height="24" rx="3" fill="#a78bfa" />
      <rect x="28" y="38" width="8" height="16" fill="#312e81" />
      <circle cx="44" cy="41" r="3" fill="#fef3c7" />
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
