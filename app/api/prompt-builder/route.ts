import { generatePromptJSON } from "@/lib/llm";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import type { PromptPreset, PromptTemplateInput } from "@/lib/types";

function readStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();

  const body = (await request.json()) as {
    profileId?: string;
    concept?: string;
    preset?: PromptPreset;
    format?: "POST" | "STORY" | "CAROUSEL" | "REEL";
    sceneLocation?: string;
    sceneAction?: string;
    sceneProps?: string[];
    outfit?: string;
    makeup?: string;
    jewelry?: string;
    emotion?: string;
  };

  if (!body.profileId || !body.concept || !body.preset) {
    return Response.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const profile = await prisma.influencerProfile.findFirst({
    where: {
      id: body.profileId,
      userId: user.id
    }
  });

  if (!profile) {
    return Response.json({ ok: false, error: "Profile not found" }, { status: 404 });
  }

  const lensLook = readStringArray(profile.cameraStyle, ["85mm portrait realism"])[0] ?? "85mm portrait realism";
  const backgroundStyle =
    readStringArray(profile.styleRules, ["Clean realistic locations"])[0] ?? "Clean realistic locations";

  const template: PromptTemplateInput = {
    profileName: profile.name ?? "Original Influencer",
    vibe: profile.vibe,
    concept: body.concept,
    preset: body.preset,
    aspectRatio: body.format === "STORY" ? "9:16" : "4:5",
    referenceImageId: profile.referenceFaceImageId,
    bodyDescriptors: readStringArray(profile.bodyDescriptors, [
      "balanced proportions",
      "consistent silhouette"
    ]),
    styleConstants: {
      lensLook,
      lighting: "Natural key + soft fill with cinematic depth",
      backgroundStyle,
      negativeExtras: ["identity drift", "plastic skin", "CGI look"]
    },
    scene: {
      location: body.sceneLocation ?? "Curated city scene",
      action: body.sceneAction ?? "Natural movement with confident posture",
      props: Array.isArray(body.sceneProps) ? body.sceneProps : []
    },
    styleVariations: {
      outfit: body.outfit ?? "Capsule wardrobe, premium streetwear balance",
      makeup: body.makeup ?? "Natural makeup with skin texture preserved",
      jewelry: body.jewelry ?? "Minimal silver accents",
      emotion: body.emotion ?? "confident and approachable"
    }
  };

  const promptJson = await generatePromptJSON({
    template,
    format: body.format ?? "POST"
  });

  return Response.json({ ok: true, promptJson });
}
