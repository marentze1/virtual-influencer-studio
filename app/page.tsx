import Link from "next/link";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await ensureDemoUser();

  const [profiles, trends, calendarItems, briefs, assets, metrics] = await Promise.all([
    prisma.influencerProfile.count({ where: { userId: user.id } }),
    prisma.trendInput.count({ where: { userId: user.id } }),
    prisma.contentCalendar.count({ where: { userId: user.id } }),
    prisma.dailyBrief.count({ where: { userId: user.id } }),
    prisma.asset.count({ where: { userId: user.id } }),
    prisma.metric.count({ where: { userId: user.id } })
  ]);

  const steps = [
    {
      id: 1,
      title: "Create Character",
      status: profiles > 0 ? "Done" : "Start",
      detail: profiles > 0 ? "Identity profile is saved." : "Generate and select original identity candidates.",
      href: "/character-lab"
    },
    {
      id: 2,
      title: "Lock Influencer Bible",
      status: profiles > 0 ? "Done" : "Pending",
      detail: "Set voice, boundaries, visual constants, body/face rules.",
      href: "/onboarding"
    },
    {
      id: 3,
      title: "Plan the Month",
      status: calendarItems > 0 ? "Done" : profiles > 0 ? "Start" : "Pending",
      detail: "Generate your 30-day calendar with captions and prompt JSON.",
      href: "/calendar"
    },
    {
      id: 4,
      title: "Execute Daily",
      status: briefs > 0 ? "In Progress" : calendarItems > 0 ? "Start" : "Pending",
      detail: "Get today's mission, produce visuals, export JSON, save assets, track metrics.",
      href: "/today"
    }
  ] as const;

  return (
    <div className="space-y-6">
      <Surface title="Studio Journey" subtitle="One flow from setup to daily optimization.">
        <div className="grid gap-3 md:grid-cols-2">
          {steps.map((step) => (
            <article key={step.id} className="rounded-2xl border border-ink/10 bg-white/75 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step {step.id}</p>
                  <p className="mt-1 text-lg font-semibold text-ink">{step.title}</p>
                </div>
                <span className="rounded-full border border-ink/15 bg-white px-2.5 py-1 text-xs text-ink/70">
                  {step.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/75">{step.detail}</p>
              <Link href={step.href} className="mt-4 inline-flex rounded-xl bg-ink px-3 py-2 text-sm text-stone">
                Open
              </Link>
            </article>
          ))}
        </div>
      </Surface>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Surface title="Command Center" subtitle="Current workspace coverage">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Profiles" value={profiles} hint="Core identity sets" />
            <MetricCard label="Trend Briefs" value={trends} hint="Idea fuel" />
            <MetricCard label="Calendar Items" value={calendarItems} hint="Planned content" />
            <MetricCard label="Daily Briefs" value={briefs} hint="Execution briefs" />
            <MetricCard label="Assets" value={assets} hint="Prompts and visuals" />
            <MetricCard label="Metric Entries" value={metrics} hint="Performance logs" />
          </div>
        </Surface>

        <Surface title="Power Actions" subtitle="Most used tools">
          <div className="space-y-2">
            <ActionLink href="/character-lab" label="Generate identity candidates" />
            <ActionLink href="/onboarding" label="Run onboarding wizard" />
            <ActionLink href="/profile" label="Edit influencer Bible" />
            <ActionLink href="/calendar" label="Generate month plan" />
            <ActionLink href="/today" label="Generate today's brief" />
            <ActionLink href="/assets" label="Upload and tag visual assets" />
            <ActionLink href="/analytics" label="Review what worked" />
          </div>
        </Surface>
      </div>

      <Surface title="Reference Image Workflow" subtitle="Using two or more input images in prompt JSON">
        <ol className="space-y-2 text-sm text-ink/80">
          <li>1. Upload identity face image in Character Lab or Assets.</li>
          <li>2. Upload outfit/style image (second reference) for clothing transfer.</li>
          <li>3. In Prompt Builder, set `Identity image id` + `Outfit image id`.</li>
          <li>4. Generate JSON and send to external generator (Nano Banana-compatible structure).</li>
        </ol>
      </Surface>
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{hint}</p>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink transition hover:border-ink/35"
    >
      <span>{label}</span>
      <span aria-hidden>→</span>
    </Link>
  );
}
