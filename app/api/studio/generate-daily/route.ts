import type { Prisma } from "@prisma/client";
import { buildSafetyChecklist } from "@/lib/safety";
import { prisma } from "@/lib/db";
import { generatePromptJSON, generateTextPlan } from "@/lib/llm";
import { ensureDemoUser } from "@/lib/planner";
import { zonedDate } from "@/lib/time";
import type { PromptPreset, PromptTemplateInput } from "@/lib/types";

type ImageSpec = {
  concept?: string;
  location?: string;
  action?: string;
  outfit?: string;
  expression?: string;
  cameraAngle?: string;
  framing?: string;
  lensLook?: string;
  props?: string;
};

type Body = {
  profileId?: string;
  dateKey?: string;
  trend?: string;
  postImageCount?: number;
  storyCount?: number;
  identityImageId?: string;
  outfitImageId?: string;
  moodImageId?: string;
  imageSpecs?: ImageSpec[];
};

const BLOCKED_IDENTITY_TERMS = [
  "kardashian",
  "hadid",
  "jenner",
  "swift",
  "rihanna",
  "beyonce",
  "selena gomez"
];

const EXPLICIT_TERMS = ["nude", "nudity", "sex", "explicit", "porn"];

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function splitProps(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/,|;|\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasBlockedTerms(value: string): boolean {
  const text = value.toLowerCase();
  return [...BLOCKED_IDENTITY_TERMS, ...EXPLICIT_TERMS].some((term) => text.includes(term));
}

function inferPreset(location: string): PromptPreset {
  const text = location.toLowerCase();
  if (text.includes("tunnel")) return "tunnel_streetwear";
  if (text.includes("airport")) return "airport_travel";
  if (text.includes("cafe")) return "cafe_laptop";
  if (text.includes("gym")) return "gym_training";
  if (text.includes("museum") || text.includes("gallery")) return "museum_gallery";
  if (text.includes("rooftop")) return "rooftop_sunset";
  if (text.includes("golden") || text.includes("sunset")) return "golden_hour_city_walk";
  if (text.includes("street") || text.includes("city")) return "street_fashion";
  return "studio_portrait";
}

function buildHashtags(niche: string, trend: string): string[] {
  const normalizedTrend = trend
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join("");

  const normalizedNiche = niche
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .split(" ")
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join("");

  return [
    "#virtualinfluencer",
    "#digitalcreator",
    "#visualstorytelling",
    "#brandsafe",
    `#${normalizedTrend || "trend"}`,
    `#${normalizedNiche || "fashion"}`,
    "#streetstyle",
    "#contentcreator"
  ];
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = (await request.json()) as Body;

  if (!body.profileId || !body.dateKey || !body.trend || !Array.isArray(body.imageSpecs)) {
    return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  if (hasBlockedTerms(body.trend)) {
    return Response.json(
      { ok: false, error: "Blocked terms detected. Keep content original and non-explicit." },
      { status: 400 }
    );
  }

  const profile = await prisma.influencerProfile.findFirst({
    where: { id: body.profileId, userId: user.id }
  });

  if (!profile) {
    return Response.json({ ok: false, error: "Profile not found." }, { status: 404 });
  }

  const postImageCount = Math.min(4, Math.max(2, body.postImageCount ?? 3));
  const storyCount = Math.min(4, Math.max(2, body.storyCount ?? 2));
  const imageSpecs = body.imageSpecs.slice(0, postImageCount);

  const bodyDescriptors = readStringArray(profile.bodyDescriptors, [
    "balanced proportions",
    "consistent silhouette",
    "realistic anatomy"
  ]);
  const styleRules = readStringArray(profile.styleRules, ["clean premium styling"]);
  const cameraRules = readStringArray(profile.cameraStyle, ["85mm editorial realism"]);

  const prompts: Array<{ index: number; concept: string; promptJson: Record<string, unknown> }> = [];

  for (let index = 0; index < imageSpecs.length; index += 1) {
    const spec = imageSpecs[index] ?? {};
    const location = spec.location?.trim() || "city street";
    const action = spec.action?.trim() || "natural movement";
    const concept = `${spec.concept?.trim() || "daily lifestyle frame"}. Trend focus: ${body.trend}.`;
    const lensLook = spec.lensLook?.trim() || cameraRules[0] || "85mm editorial realism";

    if (hasBlockedTerms(`${concept} ${location} ${action}`)) {
      return Response.json(
        {
          ok: false,
          error: `Blocked terms detected in image ${index + 1}. Keep prompts original and non-explicit.`
        },
        { status: 400 }
      );
    }

    const template: PromptTemplateInput = {
      profileName: profile.name ?? "Original Influencer",
      vibe: profile.vibe,
      concept,
      preset: inferPreset(location),
      aspectRatio: "4:5",
      referenceImageId: body.identityImageId || profile.referenceFaceImageId,
      bodyDescriptors,
      styleConstants: {
        lensLook: `${lensLook}; framing ${spec.framing?.trim() || "full body"}; angle ${spec.cameraAngle?.trim() || "eye level"}`,
        lighting: "natural cinematic lighting with realistic highlights",
        backgroundStyle: styleRules[0] ?? "clean realistic background",
        negativeExtras: ["identity drift", "CGI look", "deformed anatomy", "plastic skin"]
      },
      scene: {
        location,
        action,
        props: splitProps(spec.props)
      },
      styleVariations: {
        outfit: spec.outfit?.trim() || "capsule wardrobe with premium accents",
        makeup: "natural skin texture preserved",
        jewelry: "minimal jewelry",
        emotion: spec.expression?.trim() || "confident"
      },
      referenceImages: [
        {
          image_id: body.identityImageId || profile.referenceFaceImageId || "NO_REFERENCE_IMAGE",
          role: "identity_primary",
          weight: 1.3,
          lockIdentity: true
        },
        ...(body.outfitImageId
          ? [
              {
                image_id: body.outfitImageId,
                role: "style_outfit" as const,
                weight: 0.95,
                lockIdentity: false
              }
            ]
          : []),
        ...(body.moodImageId
          ? [
              {
                image_id: body.moodImageId,
                role: "environment_mood" as const,
                weight: 0.8,
                lockIdentity: false
              }
            ]
          : [])
      ]
    };

    const promptJson = await generatePromptJSON({
      template,
      format: "CAROUSEL"
    });

    prompts.push({
      index,
      concept: spec.concept?.trim() || `Image ${index + 1}`,
      promptJson
    });
  }

  const captionPlan = await generateTextPlan({
    purpose: "caption",
    input: `${profile.vibe} | ${body.trend} | ${profile.niche}`,
    constraints: [
      "brand-safe lifestyle only",
      "no celebrity references",
      "short instagram-ready caption"
    ]
  });

  const storyBase = [
    `Story hook: ${body.trend}`,
    "Behind-the-scenes setup of today’s shoot",
    "Poll: choose your favorite frame",
    "CTA: save or share"
  ];

  const stories = storyBase.slice(0, storyCount);
  const caption = captionPlan.summary;
  const cta = "Which frame should be tomorrow’s opener?";
  const hashtags = buildHashtags(profile.niche, body.trend);
  const safetyChecklist = buildSafetyChecklist().map((item) => ({ label: item.label, passed: item.passed }));

  const payload = {
    dateKey: body.dateKey,
    mission: `Publish 1 post (${postImageCount} images) + ${storyCount} stories`,
    format: "CAROUSEL",
    concept: body.trend,
    shotList: imageSpecs.map((spec, index) => `Image ${index + 1}: ${spec.concept ?? "lifestyle frame"}`),
    caption,
    hashtags,
    promptJson: prompts[0]?.promptJson ?? {},
    safetyChecklist
  };

  await prisma.dailyBrief.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: zonedDate(body.dateKey, user.timezone)
      }
    },
    create: {
      userId: user.id,
      date: zonedDate(body.dateKey, user.timezone),
      payload: payload as Prisma.InputJsonValue
    },
    update: {
      payload: payload as Prisma.InputJsonValue
    }
  });

  return Response.json({
    ok: true,
    output: {
      caption,
      cta,
      hashtags,
      stories,
      prompts,
      safetyChecklist
    }
  });
}
