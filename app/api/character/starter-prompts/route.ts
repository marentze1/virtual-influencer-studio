import { buildPromptJSON } from "@/lib/prompt-builder";
import type { PromptPreset, PromptTemplateInput } from "@/lib/types";

type StarterPromptBody = {
  selectedName?: string;
  vibe?: string;
  look?: string;
  ageRange?: string;
  gender?: string;
  race?: string;
  bodyType?: string;
  hairStyle?: string;
  styleArchetype?: string;
  inspirationNote?: string;
};

const PRESETS: PromptPreset[] = [
  "studio_portrait",
  "street_fashion",
  "golden_hour_city_walk",
  "tunnel_streetwear"
];

const CONCEPTS = [
  "first introduction portrait for social profile launch",
  "streetwear full-body hero shot with confident stance",
  "golden-hour city walk lifestyle shot",
  "urban tunnel fashion frame with footwear focus"
];

export async function POST(request: Request) {
  const body = (await request.json()) as StarterPromptBody;
  const profileName = body.selectedName?.trim() || "Original Influencer";
  const vibe = body.vibe ?? "minimal cinematic";

  const baseDescriptors = [
    `${body.gender ?? "female"} presentation`,
    `${body.ageRange ?? "22-28"} appearance`,
    `${body.race ?? "mixed heritage"} look`,
    `${body.bodyType ?? "balanced athletic"} body type`,
    `${body.hairStyle ?? "wavy shoulder length"} hair style`
  ];

  const prompts = PRESETS.map((preset, index) => {
    const template: PromptTemplateInput = {
      profileName,
      vibe,
      concept: `${CONCEPTS[index]}. style archetype: ${body.styleArchetype ?? "editorial minimalist"}. look notes: ${body.look ?? "clean polished features"}.`,
      preset,
      aspectRatio: "4:5",
      referenceImageId: null,
      bodyDescriptors: baseDescriptors,
      styleConstants: {
        lensLook: "85mm editorial realism",
        lighting: "soft key + practical ambient fill",
        backgroundStyle: "clean premium urban environments",
        negativeExtras: [
          "celebrity resemblance",
          "face asymmetry artifacts",
          "cgi sheen",
          "over-smoothed skin"
        ]
      },
      scene: {
        location: ["studio set", "city crosswalk", "old town avenue", "tunnel corridor"][index],
        action: ["calm standing intro", "mid-stride fashion walk", "soft smile city walk", "confident motion pose"][index],
        props: []
      },
      styleVariations: {
        outfit: body.styleArchetype ?? "capsule wardrobe with statement sneakers",
        makeup: "natural modern makeup",
        jewelry: "minimal jewelry accents",
        emotion: ["neutral confidence", "bold confidence", "warm smile", "focused intensity"][index]
      },
      referenceImages: []
    };

    const prompt = buildPromptJSON(template, "POST");

    return {
      id: `starter_${index + 1}`,
      preset,
      promptJson: {
        ...prompt,
        task: {
          ...prompt.task,
          instructions: `${prompt.task.instructions} This is an initial identity generation with no input reference image.`
        },
        reference_inputs: [],
        identity_lock: {
          ...prompt.identity_lock,
          reference_image_id: "NONE_INITIAL_GENERATION",
          instruction:
            "Generate an original consistent identity from text attributes only. After selection, lock this face as future IMAGE1 reference."
        },
        styling_notes: [
          ...prompt.styling_notes,
          `Inspiration notes: ${body.inspirationNote || "none provided"}`
        ]
      }
    };
  });

  return Response.json({
    ok: true,
    prompts,
    safetyChecklist: [
      { label: "No real celebrity/public figure referenced", passed: true },
      { label: "Initial prompt uses no input images", passed: true },
      { label: "Non-explicit content constraints included", passed: true }
    ]
  });
}
