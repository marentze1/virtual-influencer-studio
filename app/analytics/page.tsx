import { formatInTimeZone } from "date-fns-tz";
import { saveMetricAction } from "@/app/actions";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { todayInTimezone } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await ensureDemoUser();
  const metrics = await prisma.metric.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" }
  });

  const followerStart = metrics[0]?.followers ?? 0;
  const followerEnd = metrics[metrics.length - 1]?.followers ?? 0;
  const followerGrowth = followerEnd - followerStart;

  const best = metrics.reduce(
    (acc, metric) =>
      (metric.engagementRate ?? 0) > (acc?.engagementRate ?? 0) ? metric : acc,
    metrics[0]
  );

  const avgEngagement =
    metrics.length === 0
      ? 0
      : metrics.reduce((sum, metric) => sum + (metric.engagementRate ?? 0), 0) / metrics.length;

  const maxReach = Math.max(...metrics.map((metric) => metric.reach), 1);

  return (
    <div className="space-y-6">
      <Surface title="Growth Tracker" subtitle="Manual input fields for key Instagram metrics.">
        <form action={saveMetricAction} className="grid gap-3 md:grid-cols-3 lg:grid-cols-7">
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" defaultValue={todayInTimezone(user.timezone)} />
          </div>
          <MetricField name="followers" label="Followers" defaultValue="0" />
          <MetricField name="reach" label="Reach" defaultValue="0" />
          <MetricField name="likes" label="Likes" defaultValue="0" />
          <MetricField name="comments" label="Comments" defaultValue="0" />
          <MetricField name="saves" label="Saves" defaultValue="0" />
          <div className="flex items-end">
            <button type="submit" className="w-full">
              Save
            </button>
          </div>
        </form>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Performance Snapshot" subtitle="What worked this period">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Follower growth" value={`${followerGrowth >= 0 ? "+" : ""}${followerGrowth}`} />
            <Stat label="Avg engagement" value={`${avgEngagement.toFixed(2)}%`} />
            <Stat
              label="Best day"
              value={best ? formatInTimeZone(best.date, user.timezone, "yyyy-MM-dd") : "n/a"}
            />
            <Stat
              label="Best engagement"
              value={best ? `${(best.engagementRate ?? 0).toFixed(2)}%` : "n/a"}
            />
          </div>

          <div className="mt-4 text-sm text-ink/80">
            <p className="font-medium text-ink">What worked</p>
            <ul className="mt-2 space-y-1">
              <li>• Keep CTA prompts short and question-based when engagement spikes.</li>
              <li>• Preserve visual consistency; high-performing days usually align with established style rules.</li>
              <li>• Prioritize save-friendly posts (tips, outfit formulas, location guides).</li>
            </ul>

            <p className="mt-4 font-medium text-ink">Next-month adjustments</p>
            <ul className="mt-2 space-y-1">
              <li>• Increase carousel/photo-tip content if saves trend upward.</li>
              <li>• Test one new recurring location while keeping identity and camera constants fixed.</li>
              <li>• Use daily story sequences to warm up reach before feed uploads.</li>
            </ul>
          </div>
        </Surface>

        <Surface title="Reach Trend" subtitle="Basic chart from manual entries">
          <div className="space-y-2">
            {metrics.length === 0 ? <p className="text-sm text-ink/70">No metrics yet.</p> : null}
            {metrics.map((metric) => (
              <div key={metric.id} className="grid grid-cols-[92px_1fr_auto] items-center gap-3">
                <p className="text-xs text-ink/60">{formatInTimeZone(metric.date, user.timezone, "MM-dd")}</p>
                <div className="h-3 rounded-full bg-ink/8">
                  <div
                    className="h-3 rounded-full bg-aqua"
                    style={{ width: `${Math.max(4, (metric.reach / maxReach) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-ink/65">{metric.reach}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <Surface title="Raw Metrics" subtitle="Followers, reach, likes, comments, saves">
        <div className="overflow-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-[0.1em] text-ink/55">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Followers</th>
                <th className="py-2 pr-3">Reach</th>
                <th className="py-2 pr-3">Likes</th>
                <th className="py-2 pr-3">Comments</th>
                <th className="py-2 pr-3">Saves</th>
                <th className="py-2 pr-3">Engagement %</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => (
                <tr key={metric.id} className="border-b border-ink/5 text-ink/80">
                  <td className="py-2 pr-3">{formatInTimeZone(metric.date, user.timezone, "yyyy-MM-dd")}</td>
                  <td className="py-2 pr-3">{metric.followers}</td>
                  <td className="py-2 pr-3">{metric.reach}</td>
                  <td className="py-2 pr-3">{metric.likes}</td>
                  <td className="py-2 pr-3">{metric.comments}</td>
                  <td className="py-2 pr-3">{metric.saves}</td>
                  <td className="py-2 pr-3">{(metric.engagementRate ?? 0).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
  );
}

function MetricField({
  name,
  label,
  defaultValue
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type="number" min={0} defaultValue={defaultValue} required />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-3">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/55">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
