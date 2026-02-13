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
    <section className="rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-ink/65">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
