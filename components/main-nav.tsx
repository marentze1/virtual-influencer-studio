"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const primaryLinks = [
  { href: "/", label: "Studio" },
  { href: "/character-lab", label: "Create" },
  { href: "/calendar", label: "Plan" },
  { href: "/today", label: "Execute" },
  { href: "/assets", label: "Library" },
  { href: "/analytics", label: "Insights" }
];

const secondaryLinks = [
  { href: "/onboarding", label: "Onboarding" },
  { href: "/profile", label: "Bible" },
  { href: "/trends", label: "Trends" },
  { href: "/settings", label: "Settings" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {primaryLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-xl border px-3 py-2 text-center text-sm transition",
                active
                  ? "border-ink bg-ink text-stone"
                  : "border-ink/20 bg-white/70 text-ink hover:border-ink/45"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {secondaryLinks.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.08em] transition",
                active
                  ? "border-ink/90 bg-ink/90 text-stone"
                  : "border-ink/15 bg-white/60 text-ink/80 hover:border-ink/40"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
