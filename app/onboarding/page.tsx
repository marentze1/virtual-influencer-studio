import Link from "next/link";
import { saveOnboardingAction } from "@/app/actions";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

const AUDIENCE_OPTIONS = [
  "Style-forward creators, 18-34",
  "Urban travel enthusiasts, 20-35",
  "Photography learners, 18-30",
  "Fashion and fitness lifestyle audience, 21-36"
];

const VIBE_OPTIONS = [
  "minimal cinematic",
  "editorial streetwear",
  "warm travel diary",
  "athletic luxury",
  "clean monochrome"
];

const POSTING_OPTIONS = [
  "5 feed pieces per week + daily stories",
  "4 feed pieces + 5 story days per week",
  "3 reels + 2 carousels + daily stories"
];

const GROWTH_OPTIONS = [
  "Reach 10k followers in 6 months with consistent engagement",
  "Build a high-quality niche audience and 8%+ engagement in 4 months",
  "Establish brand-ready portfolio and 30 sponsored inquiries in 9 months"
];

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage =
    error === "rights"
      ? "You must confirm you have rights/consent for uploaded reference images."
      : error === "identity"
        ? "Celebrity/public figure references are blocked. Use only original private inspiration."
        : "";

  return (
    <div className="space-y-6">
      <Surface
        title="Onboarding Wizard"
        subtitle="Step-based setup with controlled choices for a safer, more consistent influencer profile."
      >
        {errorMessage ? (
          <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mb-5 grid gap-2 sm:grid-cols-5">
          <StepChip step="1" label="Strategy" />
          <StepChip step="2" label="Identity" />
          <StepChip step="3" label="Visual System" />
          <StepChip step="4" label="References" />
          <StepChip step="5" label="Safety" />
        </div>

        <form action={saveOnboardingAction} encType="multipart/form-data" className="space-y-6">
          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step 1 - Strategy</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="niche">Primary niche</label>
                <select id="niche" name="niche" defaultValue="fashion, travel, photography lifestyle">
                  <option value="fashion, travel, photography lifestyle">
                    Fashion + Travel + Photography Lifestyle
                  </option>
                  <option value="fashion and streetwear lifestyle">Fashion + Streetwear Lifestyle</option>
                  <option value="travel diary and city photography">Travel Diary + City Photography</option>
                  <option value="fitness and lifestyle storytelling">Fitness + Lifestyle Storytelling</option>
                </select>
              </div>
              <div>
                <label htmlFor="targetAudience">Target audience</label>
                <select id="targetAudience" name="targetAudience" defaultValue={AUDIENCE_OPTIONS[0]}>
                  {AUDIENCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="vibe">Desired vibe</label>
                <select id="vibe" name="vibe" defaultValue={VIBE_OPTIONS[0]}>
                  {VIBE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="postingFrequency">Posting frequency</label>
                <select id="postingFrequency" name="postingFrequency" defaultValue={POSTING_OPTIONS[0]}>
                  {POSTING_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="growthGoal">Growth goal</label>
                <select id="growthGoal" name="growthGoal" defaultValue={GROWTH_OPTIONS[0]}>
                  {GROWTH_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step 2 - Identity Rules</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <fieldset className="rounded-xl border border-ink/10 bg-white p-3">
                <legend className="px-1 text-xs uppercase tracking-[0.12em] text-ink/55">Values</legend>
                <Choice name="values" value="creativity" label="Creativity" defaultChecked />
                <Choice name="values" value="consistency" label="Consistency" defaultChecked />
                <Choice name="values" value="originality" label="Originality" defaultChecked />
                <Choice name="values" value="discipline" label="Discipline" />
              </fieldset>
              <fieldset className="rounded-xl border border-ink/10 bg-white p-3">
                <legend className="px-1 text-xs uppercase tracking-[0.12em] text-ink/55">Languages</legend>
                <Choice name="languages" value="English" label="English" defaultChecked />
                <Choice name="languages" value="German" label="German" defaultChecked />
                <Choice name="languages" value="Spanish" label="Spanish" />
              </fieldset>
              <fieldset className="md:col-span-2 rounded-xl border border-ink/10 bg-white p-3">
                <legend className="px-1 text-xs uppercase tracking-[0.12em] text-ink/55">Boundaries</legend>
                <Choice
                  name="boundaries"
                  value="No nudity"
                  label="No nudity"
                  defaultChecked
                />
                <Choice
                  name="boundaries"
                  value="No explicit content"
                  label="No explicit content"
                  defaultChecked
                />
                <Choice
                  name="boundaries"
                  value="No real celebrity/public figure references"
                  label="No real celebrity/public figure references"
                  defaultChecked
                />
                <Choice
                  name="boundaries"
                  value="No political impersonation"
                  label="No political impersonation"
                  defaultChecked
                />
              </fieldset>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step 3 - Visual System</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="bodyGuidelines">Body type/shape guidelines</label>
                <textarea
                  id="bodyGuidelines"
                  name="bodyGuidelines"
                  rows={3}
                  defaultValue="balanced proportions, confident posture, long-line silhouette, consistent natural body geometry"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="wardrobePalette">Style rules / wardrobe palette</label>
                <textarea
                  id="wardrobePalette"
                  name="wardrobePalette"
                  rows={3}
                  defaultValue="black, cream, charcoal, muted olive, denim, silver jewelry accents, premium sneakers"
                />
              </div>

              <div>
                <label htmlFor="cameraStyle">Camera style</label>
                <textarea
                  id="cameraStyle"
                  name="cameraStyle"
                  rows={3}
                  defaultValue="85mm editorial portrait look, shallow depth, cinematic highlights, realistic skin texture"
                />
              </div>
              <div>
                <label htmlFor="recurringLocations">Recurring backgrounds/locations</label>
                <textarea
                  id="recurringLocations"
                  name="recurringLocations"
                  rows={3}
                  defaultValue="Berlin old town, modern cafe interiors, airport corridors, neon tunnel, premium gym"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step 4 - References</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="referenceFaceImageId">Reference face image id (optional)</label>
                <input
                  id="referenceFaceImageId"
                  name="referenceFaceImageId"
                  placeholder="asset_ref_001"
                />
              </div>
              <div>
                <label htmlFor="referenceFaceFile">Reference face image upload (optional)</label>
                <input id="referenceFaceFile" name="referenceFaceFile" type="file" accept="image/*" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="inspirationFiles">Inspiration images (optional, multiple)</label>
                <input id="inspirationFiles" name="inspirationFiles" type="file" accept="image/*" multiple />
                <p className="mt-2 text-xs text-ink/60">
                  Tip: You can also use <Link href="/character-lab" className="underline">Character Lab</Link> to upload references and generate candidate starter looks first.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step 5 - Safety & Consent</p>
            <label className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-3 text-sm text-ink/80">
              <input
                type="checkbox"
                name="referenceRightsConfirmed"
                className="mt-0.5 h-4 w-4"
                required
              />
              <span>
                I confirm I have rights and consent to use uploaded reference images. I will not request celebrity/public figure identity cloning.
              </span>
            </label>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="submit">Generate Influencer Bible</button>
            <Link href="/character-lab" className="muted-button inline-flex items-center px-4 py-2 text-sm">
              Open Character Lab
            </Link>
          </div>
        </form>
      </Surface>

      <Surface title="MVP guardrails" subtitle="Built-in safety defaults">
        <ul className="space-y-2 text-sm text-ink/80">
          <li>Original character only. No celebrity/public figure identity references.</li>
          <li>Brand-safe domains only: fashion, travel, photography, lifestyle, fitness.</li>
          <li>No automatic Instagram posting. Planning + exports + tracking only.</li>
          <li>Timezone defaults to Europe/Berlin for planning and daily briefs.</li>
        </ul>
      </Surface>
    </div>
  );
}

function Choice({
  name,
  value,
  label,
  defaultChecked
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm normal-case tracking-normal text-ink/80">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

function StepChip({ step, label }: { step: string; label: string }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white/75 px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink/55">Step {step}</p>
      <p className="text-sm font-medium text-ink">{label}</p>
    </div>
  );
}
