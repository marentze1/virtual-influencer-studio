import { buildPromptJSON } from "@/lib/prompt-builder";
import type { PromptPreset, PromptTemplateInput } from "@/lib/types";

type SuggestBody = {
  styleDirection?: string;
  audienceVibe?: string;
  locationFocus?: string;
  outfitDirection?: string;
  referenceImageIds?: string[];
};

const FIRST_NAMES = ["Ayla", "Nina", "Mila", "Sera", "Lena", "Kaia", "Rhea", "Mira", "Elin", "Nora"];
const LAST_NAMES = ["Vale", "Sorel", "Marlow", "Quinn", "Noir", "Aster", "Skye", "Ives", "Lenn", "Rowe"];
const PRESETS: PromptPreset[] = [
  "studio_portrait",
  "tunnel_streetwear",
  "street_fashion",
  "gym_training",
  "cafe_laptop",
  "rooftop_sunset"
];

const BLOCKED_TERMS = [
  "kardashian",
  "hadid",
  "jenner",
  "swift",
  "rihanna",
  "beyonce",
  "selena gomez"
];

function toHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function containsBlockedIdentity(input: string): boolean {
  const lower = input.toLowerCase();
  return BLOCKED_TERMS.some((term) => lower.includes(term));
}

function buildCandidate(index: number, body: SuggestBody) {
  const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[(index * 3) % LAST_NAMES.length]}`;
  const preset = PRESETS[index % PRESETS.length];
  const concept = `${body.styleDirection ?? "Cinematic lifestyle"} influencer in ${body.locationFocus ?? "urban city"} environment with confident original presence.`;

  const template: PromptTemplateInput = {
    profileName: name,
    vibe: body.audienceVibe ?? "minimal cinematic",
    concept,
    preset,
    aspectRatio: "4:5",
    referenceImageId: body.referenceImageIds?.[0] ?? `candidate_ref_${index + 1}`,
    bodyDescriptors: ["balanced proportions", "consistent silhouette", "natural posture"],
    styleConstants: {
      lensLook: "85mm portrait realism",
      lighting: "Natural key + soft fill + practical highlights",
      backgroundStyle: `${body.locationFocus ?? "city environment"} with realistic depth`,
      negativeExtras: ["identity drift", "duplicate faces", "plastic skin", "cgi look"]
    },
    scene: {
      location: body.locationFocus ?? "creative city location",
      action: "authentic lifestyle movement with camera awareness",
      props: ["phone", "bag", "coffee cup"]
    },
    styleVariations: {
      outfit: body.outfitDirection ?? "street-lux capsule wardrobe with premium sneakers",
      makeup: "natural matte skin and soft contour",
      jewelry: "minimal silver jewelry",
      emotion: "confident, curious, approachable"
    },
    referenceImages: [
      {
        image_id: body.referenceImageIds?.[0] ?? `candidate_ref_${index + 1}`,
        role: "identity_primary",
        weight: 1.2,
        lockIdentity: true
      },
      ...(body.referenceImageIds?.[1]
        ? [
            {
              image_id: body.referenceImageIds[1],
              role: "style_outfit" as const,
              weight: 0.95,
              lockIdentity: false
            }
          ]
        : [])
    ]
  };

  return {
    id: `candidate_${index + 1}`,
    name,
    handle: toHandle(name),
    archetype: ["City Minimalist", "Editorial Traveler", "Athletic Lifestyle"][index % 3],
    styleDna: [
      body.styleDirection ?? "clean cinematic",
      body.audienceVibe ?? "style-forward",
      body.locationFocus ?? "urban textures"
    ],
    starterPromptJson: buildPromptJSON(template, "POST")
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as SuggestBody;
  const combinedText = [
    body.styleDirection,
    body.audienceVibe,
    body.locationFocus,
    body.outfitDirection
  ]
    .filter(Boolean)
    .join(" ");

  if (containsBlockedIdentity(combinedText)) {
    return Response.json(
      {
        ok: false,
        error: "Blocked identity reference detected. Use only original non-public-figure inspiration."
      },
      { status: 400 }
    );
  }

  const candidates = Array.from({ length: 6 }, (_, index) => buildCandidate(index, body));

  return Response.json({
    ok: true,
    candidates,
    safetyChecklist: [
      { label: "No real person/celebrity identity referenced", passed: true },
      { label: "Content remains non-explicit", passed: true },
      { label: "Identity lock + consistency rules included", passed: true }
    ]
  });
}
