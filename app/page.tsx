import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await ensureDemoUser();

  const [profiles, calendarItems, assets, metrics] = await Promise.all([
    prisma.influencerProfile.count({ where: { userId: user.id } }),
    prisma.contentCalendar.count({ where: { userId: user.id } }),
    prisma.asset.count({ where: { userId: user.id } }),
    prisma.metric.count({ where: { userId: user.id } })
  ]);

  return (
    <div className="space-y-6">
      <Surface title="Studio Snapshot" subtitle="MVP planning stack (no auto-posting)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="Influencer profiles" value={profiles} />
          <Stat label="Calendar items" value={calendarItems} />
          <Stat label="Assets saved" value={assets} />
          <Stat label="Metric entries" value={metrics} />
        </div>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Start Flow" subtitle="Recommended order">
          <ol className="space-y-3 text-sm text-ink/80">
            <li>1. Open Character Lab and generate 6 identity candidates.</li>
            <li>2. Run onboarding wizard and lock your Influencer Bible.</li>
            <li>3. Build monthly calendar and execute today&apos;s brief.</li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/character-lab" className="rounded-xl bg-ink px-4 py-2 text-sm text-stone">
              Open Character Lab
            </Link>
            <Link
              href="/onboarding"
              className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm text-ink"
            >
              Run onboarding
            </Link>
          </div>
        </Surface>

        <Surface title="Safety & Originality" subtitle="Always-on guardrails for every generated plan">
          <ul className="space-y-3 text-sm text-ink/80">
            <li>[OK] No real celebrity/public figure identity references.</li>
            <li>[OK] Brand-safe lifestyle domains only (fashion, travel, photography, fitness).</li>
            <li>[OK] No nudity or explicit content prompts.</li>
            <li>[OK] Identity-lock instructions injected into prompt JSON outputs.</li>
          </ul>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-ink/55">Timezone: {user.timezone}</p>
        </Surface>
      </div>
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
