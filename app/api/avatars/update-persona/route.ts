import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";

type UpdatePersonaBody = {
  profileId?: string;
  personaBio?: string;
  backstory?: string;
  whyExists?: string;
  personalityTraits?: string[];
  favoriteBrands?: string[];
  clothingPreferences?: string[];
  travelPreferences?: string[];
  toneRules?: string[];
  contentPillars?: string[];
  captionStyle?: string;
  emojiRules?: string;
};

function cleanList(input: string[] | undefined): string[] {
  if (!input) return [];
  return input.map((item) => item.trim()).filter(Boolean);
}

export async function POST(request: Request) {
  const user = await ensureDemoUser();
  const body = (await request.json()) as UpdatePersonaBody;

  if (!body.profileId) {
    return Response.json({ ok: false, error: "Missing profileId" }, { status: 400 });
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

  await prisma.influencerProfile.update({
    where: { id: profile.id },
    data: {
      personaBio: body.personaBio ?? profile.personaBio,
      backstory: body.backstory ?? profile.backstory,
      whyExists: body.whyExists ?? profile.whyExists,
      personalityTraits: cleanList(body.personalityTraits),
      styleRules: cleanList([...(body.favoriteBrands ?? []), ...(body.clothingPreferences ?? [])]),
      recurringLocations: cleanList(body.travelPreferences),
      toneRules: cleanList(body.toneRules),
      contentPillars: cleanList(body.contentPillars),
      captionStyle: body.captionStyle ?? profile.captionStyle,
      emojiRules: body.emojiRules ?? profile.emojiRules
    }
  });

  return Response.json({ ok: true });
}
