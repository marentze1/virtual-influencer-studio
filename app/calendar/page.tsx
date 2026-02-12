import { formatInTimeZone } from "date-fns-tz";
import { regenerateMonthPlanAction, updateCalendarItemAction } from "@/app/actions";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser, getPrimaryProfile } from "@/lib/planner";
import { monthWindow, todayInTimezone, zonedDate } from "@/lib/time";


function readArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function readChecklist(value: unknown): Array<{ label: string; passed: boolean }> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const typed = entry as { label?: unknown; passed?: unknown };
      if (typeof typed.label !== "string") {
        return null;
      }

      return { label: typed.label, passed: typed.passed !== false };
    })
    .filter((entry): entry is { label: string; passed: boolean } => Boolean(entry));
}

type SearchParams = {
  [key: string]: string | string[] | undefined;
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

function readSearchParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const user = await ensureDemoUser();
  const profile = await getPrimaryProfile(user.id);
  const params = (await searchParams) ?? {};

  const monthParam = readSearchParam(params, "month") ?? todayInTimezone(user.timezone).slice(0, 7);
  const [year, month] = monthParam.split("-").map((part) => Number(part));
  const baseDate = new Date(Date.UTC(year, (month || 1) - 1, 1, 8, 0, 0));

  const { keys } = monthWindow(baseDate, user.timezone);
  const start = zonedDate(keys[0], user.timezone);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + keys.length);

  const items = await prisma.contentCalendar.findMany({
    where: {
      userId: user.id,
      date: {
        gte: start,
        lt: end
      }
    },
    orderBy: { date: "asc" }
  });

  const byDate = new Map(
    items.map((item) => [formatInTimeZone(item.date, user.timezone, "yyyy-MM-dd"), item])
  );

  return (
    <div className="space-y-6">
      <Surface title="Monthly Planner" subtitle="Generate a 30-day content map with prompt JSON templates.">
        <form action={regenerateMonthPlanAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="month">Month</label>
            <input id="month" name="month" type="month" defaultValue={monthParam} />
          </div>
          <button type="submit" disabled={!profile}>
            {items.length > 0 ? "Regenerate month plan" : "Generate month plan"}
          </button>
        </form>
        {!profile ? (
          <p className="mt-3 text-sm text-ink/70">Complete onboarding first to generate plans.</p>
        ) : null}
      </Surface>

      <Surface title="Month View" subtitle="One primary content action per day.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {keys.map((dateKey) => {
            const item = byDate.get(dateKey);

            return (
              <div key={dateKey} className="rounded-2xl border border-ink/10 bg-white p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-ink/55">{dateKey}</p>
                {item ? (
                  <>
                    <p className="mt-2 text-xs font-semibold text-ink">{item.format}</p>
                    <p className="mt-1 text-sm text-ink/80">{item.concept}</p>
                    <p className="mt-2 text-xs text-ink/60">{item.status}</p>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-ink/55">No item</p>
                )}
              </div>
            );
          })}
        </div>
      </Surface>

      <Surface title="Edit Calendar Items" subtitle="Update concepts, captions, hashtags, and status.">
        <div className="space-y-4">
          {items.length === 0 ? <p className="text-sm text-ink/70">No entries for this month yet.</p> : null}
          {items.map((item) => (
            <form key={item.id} action={updateCalendarItemAction} className="rounded-2xl border border-ink/10 bg-white p-4">
              <input type="hidden" name="itemId" value={item.id} />
              <p className="text-xs uppercase tracking-[0.1em] text-ink/55">
                {formatInTimeZone(item.date, user.timezone, "yyyy-MM-dd")} · {item.format}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label htmlFor={`concept-${item.id}`}>Concept</label>
                  <textarea id={`concept-${item.id}`} name="concept" rows={2} defaultValue={item.concept} />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`caption-${item.id}`}>Caption draft</label>
                  <textarea id={`caption-${item.id}`} name="caption" rows={3} defaultValue={item.caption} />
                </div>
                <div>
                  <label htmlFor={`cta-${item.id}`}>CTA</label>
                  <input id={`cta-${item.id}`} name="cta" defaultValue={item.cta} />
                </div>
                <div>
                  <label htmlFor={`status-${item.id}`}>Status</label>
                  <select id={`status-${item.id}`} name="status" defaultValue={item.status}>
                    <option value="PLANNED">PLANNED</option>
                    <option value="DRAFTED">DRAFTED</option>
                    <option value="READY">READY</option>
                    <option value="POSTED">POSTED</option>
                    <option value="SKIPPED">SKIPPED</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor={`hashtags-${item.id}`}>Hashtags (comma or newline separated)</label>
                  <textarea
                    id={`hashtags-${item.id}`}
                    name="hashtags"
                    rows={2}
                    defaultValue={readArray(item.hashtags).join(", ")}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button type="submit">Save Item</button>
                <details>
                  <summary className="cursor-pointer text-sm text-ink/70">Prompt JSON</summary>
                  <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-ink/95 p-3 text-xs text-stone">
                    {JSON.stringify(item.promptJson, null, 2)}
                  </pre>
                </details>
                <details>
                  <summary className="cursor-pointer text-sm text-ink/70">Safety & Originality</summary>
                  <ul className="mt-2 space-y-1 text-xs text-ink/80">
                    {readChecklist(item.safetyChecklist).map((check) => (
                      <li key={check.label}>{check.passed ? "[OK]" : "[ ]"} {check.label}</li>
                    ))}
                  </ul>
                </details>
              </div>
            </form>
          ))}
        </div>
      </Surface>
    </div>
  );
}
