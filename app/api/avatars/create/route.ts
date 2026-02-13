import { prisma } from "@/lib/db";
import { ensureDemoUser, generateNameIdeas } from "@/lib/planner";

type CreateAvatarBody = {
  name?: string;
  handle?: string;
  niche?: string;
  targetAudience?: string;
  vibe?: string;
  values?: string[];
  boundaries?: string[];
  languages?: string[];
  postingFrequency?: string;
  growthGoal?: string;
  characterSummary?: string;
  bodyDescriptors?: string[];
  styleRules?: string[];
  cameraStyle?: string[];
  recurringLocations?: string[];
  personalityTraits?: string[];
};

function toHandle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function joinList(value: string[] | undefined, fallback: string): string {
  if (!value || value.length === 0) return fallback;
  return value.join(", ");
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = (await request.json()) as CreateAvatarBody;

  const name = body.name?.trim() || generateNameIdeas("fashion", body.vibe ?? "minimal")[0];
  const handle = body.handle?.trim() || toHandle(name);

  const profile = await prisma.influencerProfile.create({
    data: {
      userId: user.id,
      name,
      handle,
      niche: body.niche ?? "fashion, travel, photography lifestyle",
      targetAudience: body.targetAudience ?? "Style-forward creators, 18-34",
      vibe: body.vibe ?? "minimal cinematic",
      values: joinList(body.values, "creativity, consistency, originality"),
      boundaries: joinList(
        body.boundaries,
        "No nudity, no explicit content, no real celebrity/public figure references"
      ),
      languages: joinList(body.languages, "English"),
      postingFrequency: body.postingFrequency ?? "1 carousel post daily + 2 stories",
      growthGoal: body.growthGoal ?? "Build a high-quality niche audience and stable daily publishing system",
      personaBio:
        body.characterSummary ??
        "Original digital creator focused on fashion, travel, and photo-storytelling with a premium lifestyle tone.",
      whyExists:
        "To produce consistent, high-quality visual stories that look premium while staying practical and brand-safe.",
      backstory:
        "A fictional creative persona built for consistent storytelling, designed to evolve through daily scene-driven content.",
      bodyDescriptors: body.bodyDescriptors ?? ["balanced proportions", "consistent silhouette", "confident posture"],
      styleRules: body.styleRules ?? ["capsule wardrobe", "premium streetwear accents", "clean color palette"],
      cameraStyle: body.cameraStyle ?? ["85mm editorial realism", "clean composition", "natural depth"],
      recurringLocations:
        body.recurringLocations ?? ["city center", "cafe interior", "airport corridor", "urban tunnel"],
      personalityTraits:
        body.personalityTraits ?? ["confident", "observant", "modern", "disciplined", "playful"],
      toneRules: [
        "concise caption structure",
        "one clear hook",
        "one clear CTA",
        "brand-safe language only"
      ],
      doRules: [
        "keep content original",
        "keep daily consistency",
        "include practical value",
        "stay in fashion/travel/photo lifestyle"
      ],
      dontRules: [
        "no celebrity imitation",
        "no explicit content",
        "no unsafe topics"
      ],
      captionStyle: "short premium micro-story + CTA",
      emojiRules: "max 2 emojis",
      photographyStyle: "modern editorial realism",
      contentPillars: [
        "daily outfit story",
        "city travel diary",
        "creator routine",
        "photo tips",
        "moodboards"
      ],
      nameIdeas: generateNameIdeas(body.niche ?? "fashion", body.vibe ?? "minimal cinematic"),
      handleSuggestions: generateNameIdeas(body.niche ?? "fashion", body.vibe ?? "minimal cinematic").map(toHandle)
    }
  });

  return Response.json({ ok: true, profileId: profile.id });
}
