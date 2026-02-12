import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { Surface } from "@/components/surface";

export default async function HomePage() {
  const user = await ensureDemoUser();

  const [profiles, calendarItems, assets, metrics] = await Promise.all([
    prisma.influencerProfile.count({ where: { userId: user.id } }),
    prisma.contentCalendar.count({ where: { userId: user.id } }),
    prisma.asset.count({ where: { userId: user.id } }),
    prisma.metric.count({ where: { userId: user.id } })
  ]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Surface title="Studio Snapshot" subtitle="MVP planning stack (no auto-posting)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Influencer profiles" value={profiles} />
          <Stat label="Calendar items" value={calendarItems} />
          <Stat label="Assets saved" value={assets} />
          <Stat label="Metric entries" value={metrics} />
        </div>
      </Surface>

      <Surface title="Start Flow" subtitle="Recommended order">
        <ol className="space-y-3 text-sm text-ink/80">
          <li>1. Complete onboarding and generate the Influencer Bible.</li>
          <li>2. Add trend briefs and build your monthly plan.</li>
          <li>3. Open today’s brief, export prompts, and track outcomes.</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/onboarding" className="rounded-xl bg-ink px-4 py-2 text-sm text-stone">
            Run onboarding
          </Link>
          <Link
            href="/calendar"
            className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm text-ink"
          >
            Open calendar
          </Link>
        </div>
      </Surface>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}
