"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useGameStore } from "@/store/game-store";

const links = [
  { href: "/", label: "Resources" },
  { href: "/characters", label: "Characters" },
  { href: "/buildings", label: "Buildings" },
];

export function TopNav() {
  const pathname = usePathname();
  const { resetGame } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-violet-300/20 bg-violet-950/40 p-2">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-violet-300 text-violet-950"
                : "text-violet-100 hover:bg-violet-200/15"
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      <div className="relative ml-auto">
        <button
          type="button"
          aria-label="Open settings"
          onClick={() => setMenuOpen((current) => !current)}
          className="rounded-xl border border-violet-200/30 p-2 text-violet-100 transition hover:bg-violet-200/15"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.33 2.5c.44-1.84 3.06-1.84 3.5 0 .26 1.1 1.53 1.66 2.52 1.13 1.64-.87 3.49.98 2.62 2.62-.53.99.03 2.26 1.13 2.52 1.84.44 1.84 3.06 0 3.5-1.1.26-1.66 1.53-1.13 2.52.87 1.64-.98 3.49-2.62 2.62-.99-.53-2.26.03-2.52 1.13-.44 1.84-3.06 1.84-3.5 0-.26-1.1-1.53-1.66-2.52-1.13-1.64.87-3.49-.98-2.62-2.62.53-.99-.03-2.26-1.13-2.52-1.84-.44-1.84-3.06 0-3.5 1.1-.26 1.66-1.53 1.13-2.52-.87-1.64.98-3.49 2.62-2.62.99.53 2.26-.03 2.52-1.13Z"
            />
            <circle cx="12" cy="12" r="3.25" />
          </svg>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-violet-200/30 bg-violet-950 p-2 shadow-2xl">
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 transition hover:bg-rose-300/15"
              onClick={async () => {
                if (!window.confirm("Reset all progress? This cannot be undone.")) {
                  return;
                }

                await resetGame();
                setMenuOpen(false);
              }}
            >
              Reset game
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
