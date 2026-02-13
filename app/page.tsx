import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await ensureDemoUser();

  const [profiles, trendInputs, calendarItems, assets, metrics] = await Promise.all([
    prisma.influencerProfile.count({ where: { userId: user.id } }),
    prisma.trendInput.count({ where: { userId: user.id } }),
    prisma.contentCalendar.count({ where: { userId: user.id } }),
    prisma.asset.count({ where: { userId: user.id } }),
    prisma.metric.count({ where: { userId: user.id } })
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Virtual Influencer Studio</p>
        <h2 className="mt-2 text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Simple flow. Powerful output.
        </h2>
        <p className="mt-3 max-w-[70ch] text-sm text-ink/70">
          Create an original avatar, shape the persona, and generate daily JSON prompts for consistent Instagram visuals.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <JourneyCard
            step="1"
            title="Create Avatar"
            description="Appearance options, name refresh, handle hints, first 4 prompts."
            href="/create"
          />
          <JourneyCard
            step="2"
            title="Define Persona"
            description="Backstory, brands, travel style, tone, and content pillars."
            href="/persona"
          />
          <JourneyCard
            step="3"
            title="Run Daily Studio"
            description="Trend-led post plan, captions, stories, and multi-image prompt JSON."
            href="/studio"
          />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Avatars" value={profiles} />
        <Metric label="Trend Briefs" value={trendInputs} />
        <Metric label="Calendar Items" value={calendarItems} />
        <Metric label="Assets" value={assets} />
        <Metric label="Metrics" value={metrics} />
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <h3 className="text-xl font-semibold text-ink">Additional tools</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tool href="/assets" label="Asset Library" />
          <Tool href="/trends" label="Trend Briefs" />
          <Tool href="/calendar" label="Monthly Calendar" />
          <Tool href="/today" label="Legacy Daily Brief" />
          <Tool href="/analytics" label="Analytics" />
          <Tool href="/settings" label="Settings" />
        </div>
      </section>
    </div>
  );
}

function JourneyCard({
  step,
  title,
  description,
  href
}: {
  step: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/50">Step {step}</p>
      <p className="mt-1 text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink/70">{description}</p>
      <Link href={href} className="mt-4 inline-flex rounded-xl bg-ink px-3 py-1.5 text-xs uppercase tracking-[0.08em] text-stone">
        Open
      </Link>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/50">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </article>
  );
}

function Tool({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink/80 hover:border-ink/30">
      {label}
    </Link>
  );
}
