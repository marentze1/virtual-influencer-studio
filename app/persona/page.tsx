import Link from "next/link";
import { PersonaEditor } from "@/components/persona-editor";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";

export const dynamic = "force-dynamic";

type PersonaPageProps = {
  searchParams?: Promise<{
    profileId?: string | string[];
  }>;
};

function readArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export default async function PersonaPage({ searchParams }: PersonaPageProps) {
  const user = await ensureDemoUser();
  const params = (await searchParams) ?? {};
  const requestedProfileId = Array.isArray(params.profileId) ? params.profileId[0] : params.profileId;

  const profiles = await prisma.influencerProfile.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" }
  });

  if (profiles.length === 0) {
    return (
      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-semibold text-ink">No avatar yet</h2>
        <p className="mt-2 text-sm text-ink/70">Create your first avatar before defining persona and strategy.</p>
        <Link href="/create" className="mt-4 inline-flex rounded-xl bg-ink px-4 py-2 text-sm text-stone">
          Open Create Avatar
        </Link>
      </section>
    );
  }

  const selected =
    profiles.find((profile) => profile.id === requestedProfileId) ?? profiles[0];

  const editorProfiles = profiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    handle: profile.handle,
    vibe: profile.vibe,
    niche: profile.niche,
    personaBio: profile.personaBio,
    backstory: profile.backstory,
    whyExists: profile.whyExists,
    personalityTraits: readArray(profile.personalityTraits),
    styleRules: readArray(profile.styleRules),
    recurringLocations: readArray(profile.recurringLocations),
    toneRules: readArray(profile.toneRules),
    contentPillars: readArray(profile.contentPillars),
    captionStyle: profile.captionStyle,
    emojiRules: profile.emojiRules
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.18em] text-ink/45">Persona Builder</p>
        <h2 className="mt-2 text-4xl font-semibold leading-tight text-ink md:text-5xl">
          Turn {selected.name ?? "your avatar"} into a believable creator persona.
        </h2>
        <p className="mt-3 max-w-[65ch] text-sm text-ink/70">
          Define backstory, tone, favorite brands, travel style, and content pillars. This persona powers daily post planning and prompt outputs.
        </p>
      </section>

      <PersonaEditor profiles={editorProfiles} selectedProfileId={selected.id} />
    </div>
  );
}
