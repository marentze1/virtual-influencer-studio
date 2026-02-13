import { CharacterLabPanel } from "@/components/character-lab-panel";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

export default function CharacterLabPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <Surface
          title="Character Lab"
          subtitle="Create the face once, then generate endless consistent scenes."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <StepCard
              step="01"
              title="Upload references"
              text="Identity image + optional outfit/mood images."
            />
            <StepCard
              step="02"
              title="Generate candidates"
              text="Receive original personas with starter prompt JSON."
            />
            <StepCard
              step="03"
              title="Lock and iterate"
              text="Use selected face with daily scene variations."
            />
          </div>
        </Surface>

        <Surface title="Input Strategy" subtitle="How to use 2+ images effectively">
          <ul className="space-y-2 text-sm text-ink/80">
            <li>Image 1: `identity_primary` for strict face/hair/skin lock.</li>
            <li>Image 2: `style_outfit` for clothing transfer only.</li>
            <li>Image 3: `environment_mood` optional color/location mood.</li>
            <li>Result: one JSON prompt with role-specific image instructions.</li>
          </ul>
        </Surface>
      </section>

      <Surface
        title="Candidate Generator"
        subtitle="Optimized for first-generation look creation and scene expansion."
      >
        <CharacterLabPanel />
      </Surface>
    </div>
  );
}

function StepCard({
  step,
  title,
  text
}: {
  step: string;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-ink/55">{step}</p>
      <p className="mt-1 font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink/70">{text}</p>
    </article>
  );
}
