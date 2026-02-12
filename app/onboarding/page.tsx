import { saveOnboardingAction } from "@/app/actions";
import { Surface } from "@/components/surface";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <Surface
        title="Onboarding Wizard"
        subtitle="Define niche, persona constraints, visual identity rules, and growth goals."
      >
        <form action={saveOnboardingAction} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2">
          <Field name="niche" label="Niche" placeholder="fashion / travel / photography" defaultValue="fashion, travel, photography lifestyle" />
          <Field name="targetAudience" label="Target audience" placeholder="Urban creators 18-34" defaultValue="Style-forward creators, 18-34" />
          <Field name="vibe" label="Desired vibe" placeholder="minimal cinematic" defaultValue="minimal cinematic" />
          <Field name="values" label="Values" placeholder="creativity, consistency" defaultValue="creativity, consistency, originality" />
          <Field
            name="boundaries"
            label="Boundaries"
            placeholder="No nudity, no explicit content"
            defaultValue="No nudity, no explicit content, no real celebrity/public figure references"
          />
          <Field name="languages" label="Languages" placeholder="English, German" defaultValue="English, German" />
          <Field
            name="postingFrequency"
            label="Posting frequency"
            placeholder="4 posts/week + stories"
            defaultValue="5 feed pieces per week + daily stories"
          />
          <Field
            name="growthGoal"
            label="Growth goal"
            placeholder="10k followers in 6 months"
            defaultValue="Reach 10k followers in 6 months with consistent engagement"
          />
          <Field
            name="referenceFaceImageId"
            label="Reference face image id (optional)"
            placeholder="asset_ref_001"
            required={false}
          />
          <div>
            <label htmlFor="referenceFaceFile">Reference face image upload (optional)</label>
            <input id="referenceFaceFile" name="referenceFaceFile" type="file" accept="image/*" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="bodyGuidelines">Body type/shape guidelines</label>
            <textarea
              id="bodyGuidelines"
              name="bodyGuidelines"
              rows={3}
              defaultValue="balanced proportions, confident posture, long-line silhouette"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="wardrobePalette">Style rules / wardrobe palette</label>
            <textarea
              id="wardrobePalette"
              name="wardrobePalette"
              rows={3}
              defaultValue="black, cream, charcoal, muted olive, denim, silver jewelry accents"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="cameraStyle">Camera style (lens look, framing)</label>
            <textarea
              id="cameraStyle"
              name="cameraStyle"
              rows={3}
              defaultValue="85mm editorial portrait look, shallow depth, cinematic highlights"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="recurringLocations">Recurring backgrounds/locations</label>
            <textarea
              id="recurringLocations"
              name="recurringLocations"
              rows={3}
              defaultValue="Berlin old town, modern cafe interiors, airport corridors, museum halls"
            />
          </div>

          <div className="md:col-span-2">
            <button type="submit">Generate Influencer Bible</button>
          </div>
        </form>
      </Surface>

      <Surface title="MVP guardrails" subtitle="Built-in safety defaults">
        <ul className="space-y-2 text-sm text-ink/80">
          <li>Original character only. No celebrity/public figure identity references.</li>
          <li>Brand-safe domains only: fashion, travel, photography, lifestyle.</li>
          <li>No automatic Instagram posting. Planning + exports + tracking only.</li>
          <li>Timezone defaults to Europe/Berlin for planning and daily briefs.</li>
        </ul>
      </Surface>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue
  required = true
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}
