import type {
  ContentCalendar,
  ContentFormat,
  InfluencerProfile,
  Prisma,
  TrendInput,
  User
} from "@prisma/client";
import { zonedDate } from "@/lib/time";
import { prisma } from "@/lib/db";
import { generatePromptJSON, generateTextPlan } from "@/lib/llm";
import { buildSafetyChecklist } from "@/lib/safety";
import type {
  DailyBriefPayload,
  PromptPreset,
  PromptTemplateInput,
  TextPlanOutput
} from "@/lib/types";

export type OnboardingInput = {
  niche: string;
  targetAudience: string;
  vibe: string;
  values: string;
  boundaries: string;
  languages: string;
  postingFrequency: string;
  growthGoal: string;
  referenceFaceImageId?: string;
  bodyGuidelines: string;
  wardrobePalette: string;
  cameraStyle: string;
  recurringLocations: string;
};

const NAME_PARTS_A = [
  "Alina",
  "Mira",
  "Nora",
  "Elia",
  "Sena",
  "Lumi",
  "Veya",
  "Rina",
  "Kaia",
  "Nela"
];

const NAME_PARTS_B = [
  "Vale",
  "Rowe",
  "Noir",
  "Lenn",
  "Skye",
  "Aster",
  "Marlow",
  "Ives",
  "Quinn",
  "Sorel"
];

const DEFAULT_PILLARS = [
  "Street fashion",
  "Travel diary",
  "Photography tips",
  "Behind the scenes",
  "Moodboard lifestyle"
];

const PRESETS: PromptPreset[] = [
  "studio_portrait",
  "street_fashion",
  "airport_travel",
  "cafe_laptop",
  "golden_hour_city_walk",
  "museum_gallery",
  "rooftop_sunset"
];

const FORMATS: ContentFormat[] = ["POST", "STORY", "CAROUSEL", "REEL"];

export async function ensureDemoUser(): Promise<User> {
  const email = process.env.DEMO_USER_EMAIL ?? "creator@virtualstudio.local";

  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      displayName: "Studio Creator",
      timezone: "Europe/Berlin"
    },
    update: {}
  });
}

export async function getPrimaryProfile(userId: string): Promise<InfluencerProfile | null> {
  return prisma.influencerProfile.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });
}

export async function createBibleFromOnboarding(userId: string, input: OnboardingInput) {
  const names = generateNameIdeas(input.niche, input.vibe);
  const handles = names.map((name) => toHandle(name));

  const personaPlan = await generateTextPlan({
    purpose: "bible",
    input: `${input.niche} | ${input.targetAudience} | ${input.vibe} | ${input.values}`,
    constraints: [
      "original fictional influencer",
      "brand safe",
      "fashion travel photography lifestyle only"
    ]
  });

  const profile = await prisma.influencerProfile.create({
    data: {
      userId,
      name: names[0],
      handle: handles[0],
      niche: input.niche,
      targetAudience: input.targetAudience,
      vibe: input.vibe,
      values: input.values,
      boundaries: input.boundaries,
      languages: input.languages,
      postingFrequency: input.postingFrequency,
      growthGoal: input.growthGoal,
      referenceFaceImageId: input.referenceFaceImageId || null,
      bodyDescriptors: parseList(input.bodyGuidelines),
      styleRules: [
        `Wardrobe palette: ${input.wardrobePalette}`,
        "No explicit themes",
        "No celebrity imitation"
      ],
      cameraStyle: [input.cameraStyle],
      recurringLocations: parseList(input.recurringLocations),
      personaBio: personaPlan.summary,
      whyExists:
        "To deliver cinematic, practical inspiration for style-forward people building a life around fashion, travel, and photography.",
      backstory:
        "A fictional creative director who turned daily routines into visual stories and now shares repeatable style systems.",
      personalityTraits: ["Intentional", "Observant", "Confident", "Warm"],
      toneRules: [
        "Short cinematic lines",
        "Specific details over vague hype",
        "One practical takeaway per caption"
      ],
      doRules: [
        "Use inclusive lifestyle language",
        "Celebrate creativity and discipline",
        "Keep posts PG and brand-safe"
      ],
      dontRules: [
        "No nudity/explicit content",
        "No references to real public figures",
        "No aggressive engagement bait"
      ],
      brandColors: ["#102420", "#7AB6AD", "#E38158", "#F4F3EE"],
      captionStyle: "Cinematic micro-story + practical CTA",
      emojiRules: "Max 2 emojis, avoid emoji spam",
      photographyStyle: "Editorial realism with natural texture",
      recurringMotifs: ["Transit moments", "Coffee rituals", "Window light", "Reflections"],
      contentPillars: DEFAULT_PILLARS,
      nameIdeas: names,
      handleSuggestions: handles
    }
  });

  return profile;
}

export async function updateProfileDraft(
  profileId: string,
  data: Partial<InfluencerProfile>
): Promise<InfluencerProfile> {
  return prisma.influencerProfile.update({
    where: { id: profileId },
    data
  });
}

export async function summarizeTrendText(rawText: string): Promise<TextPlanOutput> {
  return generateTextPlan({
    purpose: "trend_summary",
    input: rawText,
    constraints: ["summarize", "extract hooks", "extract content angles"]
  });
}

export async function generateMonthPlan(
  userId: string,
  profile: InfluencerProfile,
  monthKeys: string[],
  trendInput?: TrendInput | null
): Promise<
  Array<{
    date: Date;
    format: ContentFormat;
    concept: string;
    caption: string;
    cta: string;
    hashtags: string[];
    promptJson: Prisma.InputJsonValue;
    safetyChecklist: Prisma.InputJsonValue;
    pillar: string;
    status: "PLANNED";
    profileId: string;
    userId: string;
  }>
> {
  const trendThemes = readStringArray(trendInput?.themes, [
    "cinematic daily routines",
    "capsule wardrobe",
    "city walking shots"
  ]);

  const pillars = readStringArray(profile.contentPillars, DEFAULT_PILLARS);
  const bodyDescriptors = readStringArray(profile.bodyDescriptors, [
    "balanced proportions",
    "athletic elegance",
    "consistent silhouette"
  ]);

  const styleRules = readStringArray(profile.styleRules, []);
  const camera = readStringArray(profile.cameraStyle, ["85mm portrait realism"]);

  const rows: Array<{
    date: Date;
    format: ContentFormat;
    concept: string;
    caption: string;
    cta: string;
    hashtags: string[];
    promptJson: Prisma.InputJsonValue;
    safetyChecklist: Prisma.InputJsonValue;
    pillar: string;
    status: "PLANNED";
    profileId: string;
    userId: string;
  }> = [];

  for (let i = 0; i < monthKeys.length; i += 1) {
    const dateKey = monthKeys[i];
    const format = FORMATS[i % FORMATS.length];
    const pillar = pillars[i % pillars.length] ?? DEFAULT_PILLARS[0];
    const trend = trendThemes[i % trendThemes.length] ?? "city lifestyle";
    const preset = PRESETS[i % PRESETS.length];

    const concept = `${pillar}: ${trend} with ${profile.vibe} mood in ${pickLocation(profile, i)}.`;
    const caption = buildCaption(profile, concept, i);
    const cta = buildCta(i);
    const hashtags = buildHashtags(profile.niche, pillar, trend);

    const template: PromptTemplateInput = {
      profileName: profile.name ?? "Original Influencer",
      vibe: profile.vibe,
      concept,
      preset,
      aspectRatio: format === "STORY" ? "9:16" : "4:5",
      referenceImageId: profile.referenceFaceImageId,
      bodyDescriptors,
      styleConstants: {
        lensLook: camera[0] ?? "85mm editorial portrait",
        lighting: "Natural directional key + soft fill, cinematic realism",
        backgroundStyle: styleRules[0] ?? "Clean, realistic location background",
        negativeExtras: ["oversmoothed skin", "low-res textures", "overprocessed HDR"]
      }
    };

    const promptJson = await generatePromptJSON({ template, format });

    rows.push({
      date: zonedDate(dateKey),
      format,
      concept,
      caption,
      cta,
      hashtags,
      promptJson: promptJson as Prisma.InputJsonValue,
      safetyChecklist: buildSafetyChecklist() as Prisma.InputJsonValue,
      pillar,
      status: "PLANNED",
      profileId: profile.id,
      userId
    });
  }

  return rows;
}

export function buildDailyBrief(item: ContentCalendar, dateKey: string): DailyBriefPayload {
  const hashtags = readStringArray(item.hashtags, []);
  const checklist = readChecklist(item.safetyChecklist);

  return {
    dateKey,
    mission:
      item.format === "STORY"
        ? "Publish 1 anchor story + 3 follow-up stories"
        : "Publish 1 main piece + 3-5 support stories",
    format: item.format,
    concept: item.concept,
    shotList: buildShotList(item),
    caption: item.caption,
    hashtags,
    promptJson: item.promptJson as any,
    safetyChecklist: checklist
  };
}

export function generateNameIdeas(niche: string, vibe: string): string[] {
  const seed = `${niche} ${vibe}`.length;
  const names: string[] = [];

  for (let i = 0; i < 6; i += 1) {
    const first = NAME_PARTS_A[(seed + i) % NAME_PARTS_A.length];
    const last = NAME_PARTS_B[(seed * 2 + i) % NAME_PARTS_B.length];
    names.push(`${first} ${last}`);
  }

  return [...new Set(names)];
}

function toHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseList(value: string): string[] {
  return value
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.length > 0);
  }

  return fallback;
}

function readChecklist(
  value: unknown
): Array<{
  label: string;
  passed: boolean;
}> {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }

        const typed = item as { label?: unknown; passed?: unknown };
        if (typeof typed.label !== "string") {
          return null;
        }

        return {
          label: typed.label,
          passed: typed.passed !== false
        };
      })
      .filter((item): item is { label: string; passed: boolean } => Boolean(item));
  }

  return buildSafetyChecklist().map((item) => ({ label: item.label, passed: item.passed }));
}

function pickLocation(profile: InfluencerProfile, index: number): string {
  const locations = readStringArray(profile.recurringLocations, [
    "city center",
    "rail station",
    "cozy cafe",
    "gallery district"
  ]);

  return locations[index % locations.length] ?? "city center";
}

function buildCaption(profile: InfluencerProfile, concept: string, index: number): string {
  const openers = [
    "Less rush, more rhythm.",
    "A quiet frame before the next flight.",
    "Style is a system, not luck.",
    "City light changes everything."
  ];

  return `${openers[index % openers.length]} ${concept} ${profile.captionStyle ?? ""}`.trim();
}

function buildCta(index: number): string {
  const ctas = [
    "Which detail would you recreate first?",
    "Want the exact shot setup in tomorrow's story?",
    "Save this for your next city day.",
    "Which location should be next?"
  ];

  return ctas[index % ctas.length] ?? ctas[0];
}

function buildHashtags(niche: string, pillar: string, trend: string): string[] {
  return [
    "#virtualinfluencer",
    "#digitalcreator",
    "#brandsafe",
    `#${normalizeTag(niche)}`,
    `#${normalizeTag(pillar)}`,
    `#${normalizeTag(trend)}`,
    "#fashiontravel",
    "#visualstorytelling"
  ];
}

function normalizeTag(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("")
    .slice(0, 22);
}

function buildShotList(item: ContentCalendar): string[] {
  const shared = [
    "Anchor frame matching the main concept",
    "Detail shot: accessories, hands, or textures",
    "Movement shot with natural stride",
    "Story cutaway for environment context"
  ];

  if (item.format === "REEL") {
    return [
      "Clip 1: establishing location (2-3 seconds)",
      "Clip 2: outfit transition or pose switch",
      "Clip 3: close-up details",
      "Clip 4: walking exit shot + CTA overlay"
    ];
  }

  if (item.format === "STORY") {
    return [
      "Story 1: hook text + scene",
      "Story 2: behind-the-scenes setup",
      "Story 3: final look reveal",
      "Story 4: poll or question CTA"
    ];
  }

  return shared;
}
