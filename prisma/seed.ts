import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FORMATS = ["POST", "STORY", "CAROUSEL", "REEL"] as const;

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "creator@virtualstudio.local";

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      displayName: "Studio Creator",
      timezone: "Europe/Berlin"
    },
    update: {}
  });

  await prisma.metric.deleteMany({ where: { userId: user.id } });
  await prisma.dailyBrief.deleteMany({ where: { userId: user.id } });
  await prisma.contentCalendar.deleteMany({ where: { userId: user.id } });
  await prisma.trendInput.deleteMany({ where: { userId: user.id } });
  await prisma.asset.deleteMany({ where: { userId: user.id } });
  await prisma.influencerProfile.deleteMany({ where: { userId: user.id } });

  const profile = await prisma.influencerProfile.create({
    data: {
      userId: user.id,
      name: "Mira Aster",
      handle: "mira_aster",
      niche: "fashion, travel, photography lifestyle",
      targetAudience: "Aspirational creators (18-34) who want practical style systems",
      vibe: "minimal cinematic",
      values: "originality, discipline, warmth",
      boundaries: "No explicit content, no real celebrity/public figure references",
      languages: "English, German",
      postingFrequency: "5 feed pieces per week + daily stories",
      growthGoal: "Reach first 10k followers in 6 months",
      referenceFaceImageId: "seed_ref_face_001",
      bodyDescriptors: [
        "balanced proportions",
        "confident posture",
        "consistent long-line silhouette"
      ],
      styleRules: [
        "Wardrobe palette: black, cream, olive, denim",
        "Cinematic realism",
        "No explicit themes"
      ],
      cameraStyle: ["85mm editorial look", "shallow depth"],
      recurringLocations: ["Berlin Mitte", "airport terminal", "gallery district", "cafe corner"],
      personaBio:
        "A fictional visual storyteller who transforms daily moments into editorial lifestyle narratives.",
      whyExists:
        "To make fashion and travel content feel intentional, repeatable, and practical for ambitious creators.",
      backstory:
        "Born as a digital creative director persona, she documents systems for style, movement, and storytelling.",
      personalityTraits: ["intentional", "observant", "grounded", "curious"],
      toneRules: [
        "Short cinematic lines",
        "One practical takeaway per caption",
        "Question CTA at the end"
      ],
      doRules: [
        "Keep content brand-safe",
        "Stay original",
        "Use practical narrative details"
      ],
      dontRules: [
        "No nudity/explicit content",
        "No public figure identity references",
        "No clickbait promises"
      ],
      brandColors: ["#102420", "#7AB6AD", "#E38158", "#F4F3EE"],
      captionStyle: "Cinematic micro-story + actionable CTA",
      emojiRules: "Max 2 emojis",
      photographyStyle: "Editorial realism with natural texture",
      recurringMotifs: ["window light", "transit moments", "coffee ritual", "motion blur"],
      contentPillars: [
        "Street fashion",
        "Travel diary",
        "Photo tips",
        "Behind the scenes",
        "Moodboards"
      ],
      nameIdeas: ["Mira Aster", "Nora Quinn", "Lumi Marlow", "Kaia Lenn"],
      handleSuggestions: ["mira_aster", "noraquinn.studio", "lumi_marlow", "kaia.lenn"]
    }
  });

  await prisma.trendInput.create({
    data: {
      userId: user.id,
      sourceType: "BRIEF",
      title: "Seed trend brief",
      rawText:
        "Cinematic travel transitions, repeat outfit formulas, practical camera tips, and location-led storytelling are trending.",
      summary:
        "Audiences currently engage with practical lifestyle stories that combine polish with candid process moments.",
      themes: ["capsule wardrobe", "city walk reels", "travel prep stories"],
      hooks: [
        "One outfit, three locations",
        "POV: early airport morning",
        "How I shoot while moving"
      ],
      angles: [
        "Style efficiency",
        "Behind-the-scenes planning",
        "Camera framing education"
      ]
    }
  });

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const days = 30;

  const safetyChecklist = [
    {
      id: "no_real_identity",
      label: "No real celebrity or public figure identity is referenced",
      passed: true
    },
    {
      id: "non_explicit",
      label: "Content remains non-explicit (fashion/travel/photography/lifestyle only)",
      passed: true
    },
    {
      id: "consistency_applied",
      label: "Identity/body/style consistency rules are applied in prompt JSON",
      passed: true
    }
  ];

  for (let day = 1; day <= days; day += 1) {
    const date = new Date(Date.UTC(year, month, day, 8, 0, 0));
    const format = FORMATS[(day - 1) % FORMATS.length];
    const concept = `Day ${day}: cinematic ${format.toLowerCase()} around street-fashion + travel mood.`;

    await prisma.contentCalendar.create({
      data: {
        userId: user.id,
        profileId: profile.id,
        date,
        format,
        concept,
        caption: `Day ${day} frame: keeping style intentional while moving through the city.`,
        cta: "Would you try this setup this week?",
        hashtags: [
          "#virtualinfluencer",
          "#fashiontravel",
          "#visualstorytelling",
          "#originalcreator"
        ],
        promptJson: {
          IMPORTANT_INSTRUCTION:
            "DO NOT use or suggest any celebrity, famous person, or public figure. Keep this influencer original.",
          safety: {
            no_real_identity: true,
            non_explicit_only: true,
            originality_required: true
          },
          task: {
            instructions: `Generate a photorealistic lifestyle ${format.toLowerCase()} scene with cinematic realism.`,
            output: "photorealistic influencer image",
            aspect_ratio: format === "STORY" ? "9:16" : "4:5",
            background: "natural city textures with soft depth",
            location_style: "Berlin urban lifestyle"
          },
          identity_lock: {
            reference_image_id: "seed_ref_face_001",
            lock_face: true,
            lock_hair: true,
            lock_skin_tone: true,
            instruction:
              "Do not alter facial identity, hair structure, or skin tone between generations."
          },
          body_consistency: {
            fixed_descriptors: [
              "balanced proportions",
              "confident posture",
              "consistent long-line silhouette"
            ],
            instruction:
              "Keep body proportions and silhouette consistent while varying outfit/location/expression."
          },
          negatives: [
            "celebrity resemblance",
            "public figure likeness",
            "nudity or explicit content",
            "identity drift",
            "deformed hands",
            "cartoon/anime/CGI look"
          ]
        },
        safetyChecklist,
        pillar: "Street fashion",
        status: "PLANNED"
      }
    });
  }

  const firstDate = new Date(Date.UTC(year, month, 1, 8, 0, 0));

  await prisma.dailyBrief.create({
    data: {
      userId: user.id,
      date: firstDate,
      payload: {
        dateKey: `${year}-${String(month + 1).padStart(2, "0")}-01`,
        mission: "Publish 1 main post + 3 stories",
        format: "POST",
        concept: "Street-fashion morning frame with cinematic transit mood.",
        shotList: [
          "Anchor full-body frame",
          "Detail shot for accessories",
          "Walking motion frame",
          "Story cutaway"
        ],
        caption: "Morning light + repeat outfit formula. Building style systems one frame at a time.",
        hashtags: ["#virtualinfluencer", "#fashiontravel", "#cinematiclifestyle"],
        promptJson: {
          task: "seed prompt"
        },
        safetyChecklist
      }
    }
  });

  for (let i = 0; i < 8; i += 1) {
    const date = new Date(Date.UTC(year, month, Math.max(1, i + 1), 8, 0, 0));
    const reach = 1200 + i * 180;
    const likes = 140 + i * 15;
    const comments = 22 + i * 2;
    const saves = 30 + i * 4;

    await prisma.metric.create({
      data: {
        userId: user.id,
        date,
        followers: 1800 + i * 90,
        reach,
        likes,
        comments,
        saves,
        engagementRate: ((likes + comments + saves) / reach) * 100
      }
    });
  }

  console.log("Seed complete: profile + trend input + monthly plan + brief + metrics");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
