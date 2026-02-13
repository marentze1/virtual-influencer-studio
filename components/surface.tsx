import type { ReactNode } from "react";

export function Surface({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-ink/10 bg-white/85 p-6 shadow-soft backdrop-blur">
      <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#3f7cff]/10 blur-2xl" />
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink/65">{subtitle}</p> : null}
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
