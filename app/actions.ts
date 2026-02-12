"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CalendarStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  buildDailyBrief,
  createBibleFromOnboarding,
  ensureDemoUser,
  generateMonthPlan,
  generateNameIdeas,
  getPrimaryProfile,
  summarizeTrendText
} from "@/lib/planner";
import { monthWindow, todayInTimezone, zonedDate } from "@/lib/time";

function parseList(value: string): string[] {
  return value
    .split(/\n|,|;/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseMonth(month: string): Date {
  const [year, monthIndex] = month.split("-").map((piece) => Number(piece));
  const safeYear = Number.isFinite(year) ? year : new Date().getUTCFullYear();
  const safeMonth = Number.isFinite(monthIndex) ? monthIndex - 1 : new Date().getUTCMonth();

  return new Date(Date.UTC(safeYear, safeMonth, 1, 8, 0, 0));
}

export async function saveOnboardingAction(formData: FormData) {
  const user = await ensureDemoUser();
  const referenceAsset = await storeReferenceFaceAsset(formData, user.id, user.timezone);
  const referenceFaceImageId =
    referenceAsset?.id || String(formData.get("referenceFaceImageId") ?? "");

  await createBibleFromOnboarding(user.id, {
    niche: String(formData.get("niche") ?? "fashion/travel/photography"),
    targetAudience: String(formData.get("targetAudience") ?? "18-34 urban creators"),
    vibe: String(formData.get("vibe") ?? "minimal cinematic"),
    values: String(formData.get("values") ?? "creativity, discipline, authenticity"),
    boundaries: String(
      formData.get("boundaries") ?? "No nudity, no explicit content, no celebrity references"
    ),
    languages: String(formData.get("languages") ?? "English"),
    postingFrequency: String(formData.get("postingFrequency") ?? "5 posts + daily stories"),
    growthGoal: String(formData.get("growthGoal") ?? "Reach 10k followers in 6 months"),
    referenceFaceImageId,
    bodyGuidelines: String(formData.get("bodyGuidelines") ?? "balanced proportions"),
    wardrobePalette: String(formData.get("wardrobePalette") ?? "black, cream, olive, denim"),
    cameraStyle: String(formData.get("cameraStyle") ?? "85mm portrait realism"),
    recurringLocations: String(formData.get("recurringLocations") ?? "city center, cafe, airport")
  });

  revalidatePath("/onboarding");
  revalidatePath("/profile");
  revalidatePath("/calendar");

  redirect("/profile?created=1");
}

export async function updateProfileAction(formData: FormData) {
  const profileId = String(formData.get("profileId") ?? "");
  if (!profileId) {
    return;
  }

  const niche = String(formData.get("niche") ?? "fashion/travel/photography");
  const vibe = String(formData.get("vibe") ?? "minimal cinematic");
  const nameIdeas = generateNameIdeas(niche, vibe);

  await prisma.influencerProfile.update({
    where: { id: profileId },
    data: {
      name: String(formData.get("name") ?? ""),
      handle: String(formData.get("handle") ?? ""),
      niche,
      targetAudience: String(formData.get("targetAudience") ?? ""),
      vibe,
      values: String(formData.get("values") ?? ""),
      boundaries: String(formData.get("boundaries") ?? ""),
      languages: String(formData.get("languages") ?? ""),
      postingFrequency: String(formData.get("postingFrequency") ?? ""),
      growthGoal: String(formData.get("growthGoal") ?? ""),
      referenceFaceImageId: String(formData.get("referenceFaceImageId") ?? "") || null,
      bodyDescriptors: parseList(String(formData.get("bodyGuidelines") ?? "")),
      styleRules: parseList(String(formData.get("styleRules") ?? "")),
      cameraStyle: parseList(String(formData.get("cameraStyle") ?? "")),
      recurringLocations: parseList(String(formData.get("recurringLocations") ?? "")),
      personaBio: String(formData.get("personaBio") ?? ""),
      whyExists: String(formData.get("whyExists") ?? ""),
      backstory: String(formData.get("backstory") ?? ""),
      toneRules: parseList(String(formData.get("toneRules") ?? "")),
      doRules: parseList(String(formData.get("doRules") ?? "")),
      dontRules: parseList(String(formData.get("dontRules") ?? "")),
      brandColors: parseList(String(formData.get("brandColors") ?? "")),
      captionStyle: String(formData.get("captionStyle") ?? ""),
      emojiRules: String(formData.get("emojiRules") ?? ""),
      photographyStyle: String(formData.get("photographyStyle") ?? ""),
      recurringMotifs: parseList(String(formData.get("recurringMotifs") ?? "")),
      contentPillars: parseList(String(formData.get("contentPillars") ?? "")),
      nameIdeas,
      handleSuggestions: nameIdeas.map((idea) =>
        idea.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")
      )
    }
  });

  revalidatePath("/profile");
  revalidatePath("/calendar");
}

export async function addTrendInputAction(formData: FormData) {
  const user = await ensureDemoUser();
  const manualText = String(formData.get("rawText") ?? "").trim();
  const briefFile = formData.get("briefFile");
  const fileText =
    briefFile instanceof File && briefFile.size > 0 ? (await briefFile.text()).trim() : "";
  const rawText = [manualText, fileText].filter(Boolean).join("\n\n");

  if (!rawText) {
    return;
  }

  const summary = await summarizeTrendText(rawText);

  await prisma.trendInput.create({
    data: {
      userId: user.id,
      sourceType: "BRIEF",
      title: String(formData.get("title") ?? "Manual trend brief"),
      rawText,
      sourceLinks: parseList(String(formData.get("sourceLinks") ?? "")),
      summary: summary.summary,
      themes: summary.bullets,
      hooks: summary.hooks ?? [],
      angles: summary.angles ?? []
    }
  });

  revalidatePath("/trends");
}

export async function regenerateMonthPlanAction(formData: FormData) {
  const user = await ensureDemoUser();
  const monthInput = String(formData.get("month") ?? "");
  const baseDate = parseMonth(monthInput || todayInTimezone(user.timezone).slice(0, 7));

  const profile = await getPrimaryProfile(user.id);

  if (!profile) {
    redirect("/onboarding");
  }

  const latestTrend = await prisma.trendInput.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  const { keys } = monthWindow(baseDate, user.timezone);
  const monthRows = await generateMonthPlan(user.id, profile, keys, latestTrend);

  const firstDay = zonedDate(keys[0], user.timezone);
  const nextMonthStart = new Date(firstDay);
  nextMonthStart.setUTCDate(nextMonthStart.getUTCDate() + keys.length);

  await prisma.contentCalendar.deleteMany({
    where: {
      userId: user.id,
      date: {
        gte: firstDay,
        lt: nextMonthStart
      }
    }
  });

  await prisma.contentCalendar.createMany({
    data: monthRows
  });

  revalidatePath("/calendar");
  revalidatePath("/today");
  revalidatePath("/analytics");

  redirect(`/calendar?month=${monthInput || keys[0].slice(0, 7)}`);
}

export async function updateCalendarItemAction(formData: FormData) {
  const itemId = String(formData.get("itemId") ?? "");
  if (!itemId) {
    return;
  }

  await prisma.contentCalendar.update({
    where: { id: itemId },
    data: {
      concept: String(formData.get("concept") ?? ""),
      caption: String(formData.get("caption") ?? ""),
      cta: String(formData.get("cta") ?? ""),
      hashtags: parseList(String(formData.get("hashtags") ?? "")),
      status: String(formData.get("status") ?? "PLANNED") as CalendarStatus
    }
  });

  revalidatePath("/calendar");
  revalidatePath("/today");
}

export async function generateDailyBriefAction(formData: FormData) {
  const user = await ensureDemoUser();
  const dateKey = String(formData.get("dateKey") ?? "") || todayInTimezone(user.timezone);

  const dayStart = zonedDate(dateKey, user.timezone);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

  let item = await prisma.contentCalendar.findFirst({
    where: {
      userId: user.id,
      date: {
        gte: dayStart,
        lt: dayEnd
      }
    },
    orderBy: [{ format: "asc" }, { createdAt: "asc" }]
  });

  if (!item) {
    const profile = await getPrimaryProfile(user.id);

    if (!profile) {
      redirect("/onboarding");
    }

    const latestTrend = await prisma.trendInput.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    });

    const [single] = await generateMonthPlan(user.id, profile, [dateKey], latestTrend);

    item = await prisma.contentCalendar.create({
      data: single
    });
  }

  const payload = buildDailyBrief(item, dateKey);

  await prisma.dailyBrief.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: dayStart
      }
    },
    create: {
      userId: user.id,
      date: dayStart,
      payload
    },
    update: {
      payload
    }
  });

  revalidatePath("/today");

  redirect(`/today?date=${dateKey}`);
}

export async function saveMetricAction(formData: FormData) {
  const user = await ensureDemoUser();
  const dateKey = String(formData.get("date") ?? todayInTimezone(user.timezone));
  const followers = Number(formData.get("followers") ?? 0);
  const reach = Number(formData.get("reach") ?? 0);
  const likes = Number(formData.get("likes") ?? 0);
  const comments = Number(formData.get("comments") ?? 0);
  const saves = Number(formData.get("saves") ?? 0);
  const engagementRate = reach > 0 ? ((likes + comments + saves) / reach) * 100 : 0;

  await prisma.metric.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: zonedDate(dateKey, user.timezone)
      }
    },
    create: {
      userId: user.id,
      date: zonedDate(dateKey, user.timezone),
      followers,
      reach,
      likes,
      comments,
      saves,
      engagementRate
    },
    update: {
      followers,
      reach,
      likes,
      comments,
      saves,
      engagementRate
    }
  });

  revalidatePath("/analytics");
}

export async function saveSettingsAction(formData: FormData) {
  const user = await ensureDemoUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      displayName: String(formData.get("displayName") ?? "Studio Creator"),
      timezone: String(formData.get("timezone") ?? "Europe/Berlin")
    }
  });

  revalidatePath("/settings");
  revalidatePath("/today");
}

export async function saveTextAssetAction(formData: FormData) {
  const user = await ensureDemoUser();

  const typeRaw = String(formData.get("type") ?? "EXPORT");

  await prisma.asset.create({
    data: {
      userId: user.id,
      type:
        typeRaw === "PROMPT" || typeRaw === "CAPTION" || typeRaw === "IMAGE" || typeRaw === "EXPORT"
          ? typeRaw
          : "EXPORT",
      title: String(formData.get("title") ?? "Untitled export"),
      captionText: String(formData.get("captionText") ?? ""),
      promptJson: safeJsonParse(String(formData.get("promptJson") ?? "")),
      tags: parseList(String(formData.get("tags") ?? "")),
      pillar: String(formData.get("pillar") ?? "") || null,
      location: String(formData.get("location") ?? "") || null,
      outfit: String(formData.get("outfit") ?? "") || null,
      assetDate: String(formData.get("assetDate") ?? "")
        ? zonedDate(String(formData.get("assetDate")), user.timezone)
        : null
    }
  });

  revalidatePath("/assets");
}

function safeJsonParse(value: string): Prisma.InputJsonValue | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as Prisma.InputJsonValue;
  } catch {
    return {
      raw: value
    } as Prisma.InputJsonValue;
  }
}

async function storeReferenceFaceAsset(formData: FormData, userId: string, timezone: string) {
  const file = formData.get("referenceFaceFile");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  const ext = path.extname(file.name) || ".png";
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const absolutePath = path.join(uploadDir, filename);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return prisma.asset.create({
    data: {
      userId,
      type: "IMAGE",
      title: "Onboarding reference face",
      filePath: `/uploads/${filename}`,
      mimeType: file.type,
      tags: ["reference-face", "identity-lock"],
      pillar: "Identity",
      assetDate: zonedDate(todayInTimezone(timezone), timezone)
    }
  });
}
