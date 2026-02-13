"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const primaryLinks = [
  { href: "/create", label: "Create" },
  { href: "/persona", label: "Persona" },
  { href: "/studio", label: "Studio" }
];

const utilityLinks = [
  { href: "/", label: "Home" },
  { href: "/assets", label: "Assets" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {primaryLinks.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm transition",
                active
                  ? "border-ink bg-ink text-stone"
                  : "border-ink/20 bg-white text-ink hover:border-ink/40"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {utilityLinks.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition",
                active
                  ? "border-ink/25 bg-ink/10 text-ink"
                  : "border-ink/10 bg-white text-ink/60 hover:border-ink/30"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
