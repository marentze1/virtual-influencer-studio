import type { ContentFormat } from "@prisma/client";
import { buildPromptJSON } from "@/lib/prompt-builder";
import type { InfluencerPromptJSON, PromptTemplateInput, TextPlanInput, TextPlanOutput } from "@/lib/types";

type PromptGenerationInput = {
  template: PromptTemplateInput;
  format: ContentFormat | string;
};

export async function generateTextPlan(payload: TextPlanInput): Promise<TextPlanOutput> {
  const endpoint = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;

  if (endpoint && apiKey) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          task: "generateTextPlan",
          payload
        }),
        cache: "no-store"
      });

      if (response.ok) {
        const data = (await response.json()) as Partial<TextPlanOutput>;

        if (data.summary && data.bullets) {
          return {
            summary: data.summary,
            bullets: data.bullets,
            hooks: data.hooks,
            angles: data.angles
          };
        }
      }
    } catch {
      // Fall through to deterministic mock.
    }
  }

  return buildMockText(payload);
}

export async function generatePromptJSON(
  payload: PromptGenerationInput
): Promise<InfluencerPromptJSON> {
  const endpoint = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;

  if (endpoint && apiKey) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          task: "generatePromptJSON",
          payload
        }),
        cache: "no-store"
      });

      if (response.ok) {
        const data = (await response.json()) as InfluencerPromptJSON;
        if (data?.task?.instructions && data?.identity_lock) {
          return data;
        }
      }
    } catch {
      // Fall through to template builder.
    }
  }

  return buildPromptJSON(payload.template, payload.format);
}

function buildMockText(payload: TextPlanInput): TextPlanOutput {
  if (payload.purpose === "trend_summary") {
    return {
      summary:
        "Short-form audiences currently respond to practical lifestyle moments, cinematic transitions, and personality-led captions.",
      bullets: [
        "Mix polished visuals with candid in-between moments.",
        "Use location context as part of the narrative.",
        "Close captions with a low-friction question CTA."
      ],
      hooks: [
        "One look, three locations",
        "POV: you arrived 45 minutes early and made it aesthetic",
        "A week of repeat outfits, styled three ways"
      ],
      angles: [
        "Style efficiency for travelers",
        "Camera tips while walking through the city",
        "Capsule wardrobe storytelling"
      ]
    };
  }

  if (payload.purpose === "caption") {
    return {
      summary: "Today's frame turns routine into a cinematic micro-story.",
      bullets: [
        "Describe the scene in one vivid line.",
        "Add one personal reflection.",
        "Close with a clear CTA question."
      ]
    };
  }

  return {
    summary:
      "She exists to make intentional living feel stylish, grounded, and visually memorable for ambitious digital natives.",
    bullets: [
      "Voice: warm, precise, and observant.",
      "Core trait: disciplined creator with playful details.",
      "Boundary: never explicit or celebrity-derived."
    ]
  };
}
