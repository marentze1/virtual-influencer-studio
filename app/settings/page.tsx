import { saveSettingsAction } from "@/app/actions";
import { Surface } from "@/components/surface";
import { ensureDemoUser } from "@/lib/planner";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await ensureDemoUser();

  return (
    <div className="space-y-6">
      <Surface title="Settings" subtitle="Workspace defaults and provider stubs.">
        <form action={saveSettingsAction} className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="displayName">Display name</label>
            <input id="displayName" name="displayName" defaultValue={user.displayName ?? "Studio Creator"} />
          </div>
          <div>
            <label htmlFor="timezone">Timezone</label>
            <input id="timezone" name="timezone" defaultValue={user.timezone} />
          </div>
          <div className="md:col-span-2">
            <button type="submit">Save settings</button>
          </div>
        </form>
      </Surface>

      <Surface title="LLM Wiring" subtitle="Environment variables">
        <ul className="space-y-2 text-sm text-ink/80">
          <li>• `LLM_API_URL` and `LLM_API_KEY` power `generateTextPlan()` + `generatePromptJSON()`.</li>
          <li>• Without these variables, deterministic mock outputs are used for local development.</li>
          <li>• `DEMO_USER_EMAIL` controls the local demo workspace identity.</li>
        </ul>
      </Surface>

      <Surface title="Compliance Notice" subtitle="Instagram operations">
        <p className="text-sm text-ink/80">
          This MVP does not automate Instagram posting. If you later integrate publishing, keep it compliant
          and use official approved methods only.
        </p>
      </Surface>
    </div>
  );
}
