import { CharacterLabPanel } from "@/components/character-lab-panel";
import { Surface } from "@/components/surface";

export const dynamic = "force-dynamic";

export default function CharacterLabPage() {
  return (
    <div className="space-y-6">
      <Surface
        title="Character Lab"
        subtitle="Upload inspiration references, generate original identity candidates, and lock a starter look."
      >
        <div className="grid gap-3 text-sm text-ink/80 md:grid-cols-3">
          <Step number="1" title="Reference Inputs" description="Upload mood and style images you have rights to use." />
          <Step number="2" title="Candidate Generation" description="Generate original identities with no celebrity references." />
          <Step number="3" title="Starter Prompt JSON" description="Copy a Nano Banana-compatible JSON payload and begin image generation." />
        </div>
      </Surface>

      <Surface
        title="Identity Candidate Builder"
        subtitle="Designed for first-time face generation and consistent cross-scene expansion."
      >
        <CharacterLabPanel />
      </Surface>
    </div>
  );
}

function Step({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-ink/10 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Step {number}</p>
      <p className="mt-1 font-medium text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink/70">{description}</p>
    </article>
  );
}
