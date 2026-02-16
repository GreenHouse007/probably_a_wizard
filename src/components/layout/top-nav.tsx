"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Resources" },
  { href: "/characters", label: "Characters" },
  { href: "/buildings", label: "Buildings" },
];

export function TopNav() {
  const pathname = usePathname();

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
    </nav>
  );
}
