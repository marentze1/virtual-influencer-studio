import Link from "next/link";
import { updateProfileAction } from "@/app/actions";
import { PromptBuilderPanel } from "@/components/prompt-builder-panel";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser, getPrimaryProfile } from "@/lib/planner";

export const dynamic = "force-dynamic";

function toText(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.filter((item): item is string => typeof item === "string").join("\n");
}

export default async function ProfilePage() {
  const user = await ensureDemoUser();
  const profile = await getPrimaryProfile(user.id);

  if (!profile) {
    return (
      <Surface title="Influencer Bible" subtitle="No profile generated yet.">
        <p className="text-sm text-ink/80">Start onboarding to generate your first original influencer profile.</p>
        <Link href="/onboarding" className="mt-4 inline-flex rounded-xl bg-ink px-4 py-2 text-sm text-stone">
          Open onboarding
        </Link>
      </Surface>
    );
  }

  const trendCount = await prisma.trendInput.count({ where: { userId: user.id } });

  return (
    <div className="space-y-6">
      <Surface title="Influencer Bible" subtitle="Editable identity, voice, and brand rules.">
        <form action={updateProfileAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="profileId" value={profile.id} />

          <Field name="name" label="Influencer name" defaultValue={profile.name ?? ""} />
          <Field name="handle" label="Primary handle" defaultValue={profile.handle ?? ""} />
          <Field name="niche" label="Niche" defaultValue={profile.niche} />
          <Field name="targetAudience" label="Target audience" defaultValue={profile.targetAudience} />
          <Field name="vibe" label="Vibe" defaultValue={profile.vibe} />
          <Field name="values" label="Values" defaultValue={profile.values} />
          <Field name="boundaries" label="Boundaries" defaultValue={profile.boundaries} />
          <Field name="languages" label="Languages" defaultValue={profile.languages} />
          <Field name="postingFrequency" label="Posting frequency" defaultValue={profile.postingFrequency} />
          <Field name="growthGoal" label="Growth goal" defaultValue={profile.growthGoal} />
          <Field
            name="referenceFaceImageId"
            label="Reference image id"
            defaultValue={profile.referenceFaceImageId ?? ""}
          />

          <Area
            className="md:col-span-2"
            name="personaBio"
            label="Persona bio"
            defaultValue={profile.personaBio ?? ""}
          />
          <Area
            className="md:col-span-2"
            name="whyExists"
            label="Why she exists"
            defaultValue={profile.whyExists ?? ""}
          />
          <Area
            className="md:col-span-2"
            name="backstory"
            label="Backstory"
            defaultValue={profile.backstory ?? ""}
          />

          <Area
            name="bodyGuidelines"
            label="Body descriptors"
            defaultValue={toText(profile.bodyDescriptors)}
          />
          <Area
            name="styleRules"
            label="Style rules"
            defaultValue={toText(profile.styleRules)}
          />
          <Area
            name="cameraStyle"
            label="Camera style"
            defaultValue={toText(profile.cameraStyle)}
          />
          <Area
            name="recurringLocations"
            label="Recurring locations"
            defaultValue={toText(profile.recurringLocations)}
          />
          <Area
            name="toneRules"
            label="Tone rules"
            defaultValue={toText(profile.toneRules)}
          />
          <Area name="doRules" label="Do rules" defaultValue={toText(profile.doRules)} />
          <Area name="dontRules" label="Don't rules" defaultValue={toText(profile.dontRules)} />
          <Area name="brandColors" label="Brand colors" defaultValue={toText(profile.brandColors)} />
          <Field name="captionStyle" label="Caption style" defaultValue={profile.captionStyle ?? ""} />
          <Field name="emojiRules" label="Emoji rules" defaultValue={profile.emojiRules ?? ""} />
          <Field
            name="photographyStyle"
            label="Photography style"
            defaultValue={profile.photographyStyle ?? ""}
          />
          <Area
            name="recurringMotifs"
            label="Recurring motifs"
            defaultValue={toText(profile.recurringMotifs)}
          />
          <Area
            name="contentPillars"
            label="Content pillars"
            defaultValue={toText(profile.contentPillars)}
          />

          <div className="md:col-span-2">
            <button type="submit">Save Bible Changes</button>
          </div>
        </form>
      </Surface>

      <div className="grid gap-6 md:grid-cols-2">
        <Surface title="Name Ideas" subtitle="Original options only">
          <ul className="space-y-2 text-sm text-ink/80">
            {(profile.nameIdeas as string[] | null)?.map((name) => <li key={name}>{name}</li>) ?? (
              <li>No generated options</li>
            )}
          </ul>
        </Surface>

        <Surface title="Handle Suggestions" subtitle="Availability check optional in MVP">
          <ul className="space-y-2 text-sm text-ink/80">
            {(profile.handleSuggestions as string[] | null)?.map((name) => (
              <li key={name}>@{name}</li>
            )) ?? <li>No generated handles</li>}
          </ul>
        </Surface>
      </div>

      <Surface title="Readiness" subtitle="Planning inputs connected">
        <p className="text-sm text-ink/80">Trend briefs collected: {trendCount}</p>
      </Surface>

      <Surface
        title="Prompt Builder"
        subtitle="Generate preset-based JSON prompts with identity/body/style consistency locks."
      >
        <PromptBuilderPanel profileId={profile.id} />
      </Surface>
    </div>
  );
}

function Field({
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
      <input id={name} name={name} defaultValue={defaultValue} />
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  className
}: {
  name: string;
  label: string;
  defaultValue: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} rows={4} defaultValue={defaultValue} />
    </div>
  );
}
