"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/onboarding", label: "Onboarding" },
  { href: "/profile", label: "Profile" },
  { href: "/trends", label: "Trends" },
  { href: "/calendar", label: "Calendar" },
  { href: "/today", label: "Today" },
  { href: "/assets", label: "Assets" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={clsx(
            "rounded-full border px-4 py-2 text-sm transition",
            pathname.startsWith(link.href)
              ? "border-ink bg-ink text-stone"
              : "border-ink/15 bg-white/70 text-ink hover:border-ink/40"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
