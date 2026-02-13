import Link from "next/link";
import { saveOnboardingAction } from "@/app/actions";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

type OnboardingPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = (await searchParams) ?? {};
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const errorMessage =
    error === "rights"
      ? "Confirm rights/consent for uploaded references."
      : error === "identity"
        ? "Celebrity/public figure references are blocked."
        : "";

  return (
    <div className="space-y-6">
      <Surface title="Onboarding Wizard" subtitle="Quick setup first. Advanced options are optional.">
        {errorMessage ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <form action={saveOnboardingAction} encType="multipart/form-data" className="space-y-5">
          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Quick setup (required)</p>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="niche">Niche</label>
                <select id="niche" name="niche" defaultValue="fashion, travel, photography lifestyle">
                  <option value="fashion, travel, photography lifestyle">Fashion + Travel + Photography</option>
                  <option value="fashion and streetwear lifestyle">Fashion + Streetwear</option>
                  <option value="travel diary and city photography">Travel + City Photography</option>
                  <option value="fitness and lifestyle storytelling">Fitness + Lifestyle</option>
                </select>
              </div>
              <div>
                <label htmlFor="targetAudience">Target audience</label>
                <select id="targetAudience" name="targetAudience" defaultValue="Style-forward creators, 18-34">
                  <option>Style-forward creators, 18-34</option>
                  <option>Urban travel enthusiasts, 20-35</option>
                  <option>Photography learners, 18-30</option>
                  <option>Fashion and fitness audience, 21-36</option>
                </select>
              </div>
              <div>
                <label htmlFor="vibe">Visual vibe</label>
                <select id="vibe" name="vibe" defaultValue="minimal cinematic">
                  <option>minimal cinematic</option>
                  <option>editorial streetwear</option>
                  <option>warm travel diary</option>
                  <option>athletic luxury</option>
                </select>
              </div>
              <div>
                <label htmlFor="postingFrequency">Posting frequency</label>
                <select id="postingFrequency" name="postingFrequency" defaultValue="5 feed pieces per week + daily stories">
                  <option>5 feed pieces per week + daily stories</option>
                  <option>4 feed pieces + 5 story days/week</option>
                  <option>3 reels + 2 carousels + daily stories</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="growthGoal">Growth goal</label>
                <select id="growthGoal" name="growthGoal" defaultValue="Reach 10k followers in 6 months with consistent engagement">
                  <option>Reach 10k followers in 6 months with consistent engagement</option>
                  <option>Build strong niche authority and 8%+ engagement in 4 months</option>
                  <option>Prepare portfolio for paid brand partnerships in 9 months</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Safety and brand rules (required)</p>
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
                <Choice name="boundaries" value="No nudity" label="No nudity" defaultChecked />
                <Choice name="boundaries" value="No explicit content" label="No explicit content" defaultChecked />
                <Choice
                  name="boundaries"
                  value="No real celebrity/public figure references"
                  label="No real celebrity/public figure references"
                  defaultChecked
                />
                <Choice name="boundaries" value="No political impersonation" label="No political impersonation" defaultChecked />
              </fieldset>
            </div>
          </section>

          <details className="rounded-2xl border border-ink/10 bg-white/70 p-4" open>
            <summary className="cursor-pointer text-sm font-medium text-ink">Visual identity constants (recommended)</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
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
                <label htmlFor="recurringLocations">Recurring locations</label>
                <textarea
                  id="recurringLocations"
                  name="recurringLocations"
                  rows={3}
                  defaultValue="Berlin old town, modern cafe interiors, airport corridors, neon tunnel, premium gym"
                />
              </div>
            </div>
          </details>

          <details className="rounded-2xl border border-ink/10 bg-white/70 p-4">
            <summary className="cursor-pointer text-sm font-medium text-ink">Reference image inputs (optional)</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="referenceFaceImageId">Reference face image id</label>
                <input id="referenceFaceImageId" name="referenceFaceImageId" placeholder="asset_ref_identity_001" />
              </div>
              <div>
                <label htmlFor="referenceFaceFile">Identity reference image upload</label>
                <input id="referenceFaceFile" name="referenceFaceFile" type="file" accept="image/*" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="inspirationFiles">Additional inspiration images (multi-upload)</label>
                <input id="inspirationFiles" name="inspirationFiles" type="file" accept="image/*" multiple />
                <p className="mt-2 text-xs text-ink/60">
                  For best results, upload identity + outfit/mood references. You can manage this in{" "}
                  <Link href="/character-lab" className="underline">Character Lab</Link>.
                </p>
              </div>
            </div>
          </details>

          <label className="flex items-start gap-3 rounded-xl border border-ink/10 bg-white p-3 text-sm text-ink/80">
            <input type="checkbox" name="referenceRightsConfirmed" required className="mt-0.5 h-4 w-4" />
            <span>I confirm I have legal rights/consent for uploaded references and will not request celebrity cloning.</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit">Generate Influencer Bible</button>
            <Link href="/character-lab" className="muted-button inline-flex items-center px-4 py-2 text-sm">
              Open Character Lab
            </Link>
          </div>
        </form>
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
