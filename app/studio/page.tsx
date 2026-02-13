import Link from "next/link";
import { StudioDailyPlanner } from "@/components/studio-daily-planner";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { todayInTimezone } from "@/lib/time";

export const dynamic = "force-dynamic";

type StudioPageProps = {
  searchParams?: Promise<{
    profileId?: string | string[];
  }>;
};

type TrendSuggestion = {
  id: string;
  label: string;
  source: string;
  reason: string;
};

function readArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function buildTrendSuggestions(entries: Array<{
  id: string;
  title: string | null;
  themes: unknown;
  hooks: unknown;
  angles: unknown;
}>): TrendSuggestion[] {
  const suggestions: TrendSuggestion[] = [];

  for (const entry of entries) {
    const themes = readArray(entry.themes);
    const hooks = readArray(entry.hooks);
    const angles = readArray(entry.angles);

    const topTheme = themes[0];
    if (topTheme) {
      suggestions.push({
        id: `theme-${entry.id}`,
        label: topTheme,
        source: entry.title ?? "Trend brief",
        reason: hooks[0] ?? angles[0] ?? "Extracted from your latest trend notes"
      });
    }

    const topAngle = angles[0];
    if (topAngle) {
      suggestions.push({
        id: `angle-${entry.id}`,
        label: topAngle,
        source: entry.title ?? "Trend brief",
        reason: "Angle with practical storytelling potential"
      });
    }
  }

  const fallback: TrendSuggestion[] = [
    {
      id: "fallback-1",
      label: "city tunnel streetwear with sneaker focus",
      source: "Built-in",
      reason: "High visual consistency and repeatability for carousel"
    },
    {
      id: "fallback-2",
      label: "cafe workday lifestyle with laptop scene",
      source: "Built-in",
      reason: "Strong mix of personal brand and product-friendly context"
    },
    {
      id: "fallback-3",
      label: "airport travel diary with capsule outfit",
      source: "Built-in",
      reason: "Fits fashion + travel pillars with broad audience appeal"
    }
  ];

  return [...suggestions, ...fallback].slice(0, 6);
}

export default async function StudioPage({ searchParams }: StudioPageProps) {
  const user = await ensureDemoUser();
  const params = (await searchParams) ?? {};
  const requestedProfileId = Array.isArray(params.profileId) ? params.profileId[0] : params.profileId;

  const [profiles, trendInputs] = await Promise.all([
    prisma.influencerProfile.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.trendInput.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        themes: true,
        hooks: true,
        angles: true
      }
    })
  ]);

  if (profiles.length === 0) {
    return (
      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-semibold text-ink">No avatar ready for Studio</h2>
        <p className="mt-2 text-sm text-ink/70">Create and save an avatar first, then return to generate daily prompts.</p>
        <Link href="/create" className="mt-4 inline-flex rounded-xl bg-ink px-4 py-2 text-sm text-stone">
          Create avatar
        </Link>
      </section>
    );
  }

  const selectedProfile = profiles.find((profile) => profile.id === requestedProfileId) ?? profiles[0];

  const trendSuggestions = buildTrendSuggestions(trendInputs);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Execution Studio</p>
        <h2 className="mt-2 text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Plan today’s post system with production-ready JSON prompts.
        </h2>
        <p className="mt-3 max-w-[70ch] text-sm text-ink/70">
          Select trend direction, define 2-4 post images plus stories, control expression/camera/outfit per image, then export JSON for your external generator.
        </p>
      </section>

      <StudioDailyPlanner
        profiles={profiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
          handle: profile.handle,
          referenceFaceImageId: profile.referenceFaceImageId,
          vibe: profile.vibe
        }))}
        trends={trendSuggestions}
        selectedProfileId={selectedProfile.id}
        defaultDate={todayInTimezone(user.timezone)}
      />
    </div>
  );
}
