"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Dashboard", hint: "Studio overview" },
  { href: "/character-lab", label: "Character Lab", hint: "Build face + style DNA" },
  { href: "/onboarding", label: "Onboarding", hint: "Wizard setup" },
  { href: "/profile", label: "Influencer Bible", hint: "Identity rules" },
  { href: "/trends", label: "Trends", hint: "Research briefs" },
  { href: "/calendar", label: "Monthly Planner", hint: "30-day plan" },
  { href: "/today", label: "Today", hint: "Daily mission" },
  { href: "/assets", label: "Assets", hint: "Prompt + media library" },
  { href: "/analytics", label: "Analytics", hint: "Growth tracking" },
  { href: "/settings", label: "Settings", hint: "Workspace config" }
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
    <nav className="space-y-1">
      {links.map((link) => {
        const active = isActive(pathname, link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "block rounded-2xl border px-4 py-3 transition",
              active
                ? "border-ink/90 bg-ink text-stone shadow-soft"
                : "border-ink/10 bg-white/65 text-ink hover:border-ink/35 hover:bg-white"
            )}
          >
            <p className="text-sm font-medium">{link.label}</p>
            <p className={clsx("mt-1 text-xs", active ? "text-stone/80" : "text-ink/55")}>{link.hint}</p>
          </Link>
        );
      })}
    </nav>
  );
}
