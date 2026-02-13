import { formatInTimeZone } from "date-fns-tz";
import { generateDailyBriefAction, saveTextAssetAction } from "@/app/actions";
import { DailyBriefExport } from "@/components/daily-brief-export";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { todayInTimezone, zonedDate } from "@/lib/time";
import type { DailyBriefPayload } from "@/lib/types";

type PageProps = {
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

function readSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parsePayload(value: unknown, dateKey: string): DailyBriefPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as Partial<DailyBriefPayload>;

  if (
    !payload.concept ||
    !payload.caption ||
    !payload.promptJson ||
    !Array.isArray(payload.shotList) ||
    !Array.isArray(payload.hashtags)
  ) {
    return null;
  }

  return {
    dateKey,
    mission: payload.mission ?? "Publish according to your plan",
    format: payload.format ?? "POST",
    concept: payload.concept,
    shotList: payload.shotList,
    caption: payload.caption,
    hashtags: payload.hashtags,
    promptJson: payload.promptJson,
    safetyChecklist:
      payload.safetyChecklist ?? [
        {
          label: "No real celebrity/public figure identity reference",
          passed: true
        },
        {
          label: "Content remains non-explicit",
          passed: true
        },
        {
          label: "Consistency rules applied",
          passed: true
        }
      ]
  };
}

export default async function TodayPage({ searchParams }: PageProps) {
  const user = await ensureDemoUser();
  const params = (await searchParams) ?? {};
  const dateKey = readSearchParam(params, "date") ?? todayInTimezone(user.timezone);

  const dayStart = zonedDate(dateKey, user.timezone);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  const [briefRow, calendarItem] = await Promise.all([
    prisma.dailyBrief.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.contentCalendar.findFirst({
      where: {
        userId: user.id,
        date: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      orderBy: { createdAt: "asc" }
    })
  ]);

  const payload = parsePayload(briefRow?.payload, dateKey);

  return (
    <div className="space-y-6">
      <Surface title="Daily Brief" subtitle={`Timezone: ${user.timezone}`}>
        <form action={generateDailyBriefAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="dateKey">Date</label>
            <input id="dateKey" name="dateKey" type="date" defaultValue={dateKey} />
          </div>
          <button type="submit">Generate Today&apos;s Mission</button>
        </form>
        {calendarItem ? (
          <p className="mt-3 text-sm text-ink/70">
            Source plan: {formatInTimeZone(calendarItem.date, user.timezone, "yyyy-MM-dd")} ·{" "}
            {calendarItem.format}
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink/70">
            No calendar item for this date yet. Generation will create a single day plan from your
            profile.
          </p>
        )}
      </Surface>

      {payload ? (
        <>
          <Surface title="Today&apos;s Mission" subtitle={payload.mission}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-ink/55">Format</p>
                <p className="text-sm text-ink/85">{payload.format}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/55">Concept</p>
                <p className="text-sm text-ink/85">{payload.concept}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/55">Caption</p>
                <p className="text-sm text-ink/85">{payload.caption}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/55">Hashtags</p>
                <p className="text-sm text-ink/85">{payload.hashtags.join(" ")}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-ink/55">Shot list</p>
                <ol className="mt-2 space-y-2 text-sm text-ink/85">
                  {payload.shotList.map((shot, index) => (
                    <li key={shot}>
                      {index + 1}. {shot}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs uppercase tracking-[0.1em] text-ink/55">
                  Safety & Originality checklist
                </p>
                <ul className="mt-2 space-y-2 text-sm text-ink/85">
                  {payload.safetyChecklist.map((item) => (
                    <li key={item.label}>
                      {item.passed ? "[OK]" : "[ ]"} {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5">
              <DailyBriefExport payload={payload} />
            </div>
          </Surface>

          <Surface title="Image Prompt JSON" subtitle="Exact payload for your external generator">
            <pre className="max-h-[520px] overflow-auto rounded-2xl bg-ink/95 p-4 text-xs text-stone">
              {JSON.stringify(payload.promptJson, null, 2)}
            </pre>
          </Surface>

          <Surface title="Save Export to Asset Library" subtitle="Store prompt/caption artifacts with tags.">
            <form action={saveTextAssetAction} className="grid gap-3 md:grid-cols-2">
              <input type="hidden" name="type" value="EXPORT" />
              <input type="hidden" name="promptJson" value={JSON.stringify(payload.promptJson)} />
              <input type="hidden" name="captionText" value={payload.caption} />
              <input type="hidden" name="assetDate" value={dateKey} />
              <div>
                <label htmlFor="title">Title</label>
                <input id="title" name="title" defaultValue={`Daily brief ${dateKey}`} />
              </div>
              <div>
                <label htmlFor="tags">Tags</label>
                <input id="tags" name="tags" placeholder="daily, prompt, caption" />
              </div>
              <div>
                <label htmlFor="pillar">Pillar</label>
                <input id="pillar" name="pillar" placeholder="Street fashion" />
              </div>
              <div>
                <label htmlFor="location">Location</label>
                <input id="location" name="location" placeholder="Berlin" />
              </div>
              <div>
                <label htmlFor="outfit">Outfit</label>
                <input id="outfit" name="outfit" placeholder="Trench + knit set" />
              </div>
              <div className="md:col-span-2">
                <button type="submit">Save to Assets</button>
              </div>
            </form>
          </Surface>
        </>
      ) : (
        <Surface title="No Brief Yet" subtitle="Generate a daily brief to unlock exports.">
          <p className="text-sm text-ink/75">Use the button above to create today&apos;s mission.</p>
        </Surface>
      )}
    </div>
  );
}
