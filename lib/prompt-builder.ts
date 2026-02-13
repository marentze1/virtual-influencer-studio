import type { ContentFormat } from "@prisma/client";
import type { InfluencerPromptJSON, PromptPreset, PromptTemplateInput } from "@/lib/types";

type PresetConfig = {
  instructions: string;
  locationStyle: string;
  framing: string;
  angle: string;
  outfitDirection: string;
};

export const PROMPT_PRESETS: Record<PromptPreset, PresetConfig> = {
  studio_portrait: {
    instructions:
      "Photorealistic creator portrait with clean editorial polish and natural skin texture.",
    locationStyle: "minimal studio backdrop with subtle color gradient",
    framing: "waist-up portrait",
    angle: "slight 3/4 turn, camera at eye level",
    outfitDirection: "smart capsule wardrobe with one accent accessory"
  },
  street_fashion: {
    instructions: "Street-style fashion image with confident movement and natural city energy.",
    locationStyle: "urban sidewalk with layered storefront depth",
    framing: "full body with breathing room",
    angle: "slight low-angle walk frame",
    outfitDirection: "statement outfit with balanced textures and muted palette"
  },
  tunnel_streetwear: {
    instructions: "Underground tunnel fashion frame with athletic edge and clean perspective lines.",
    locationStyle: "urban tunnel with neon reflections and concrete textures",
    framing: "full body action frame",
    angle: "ground-level dynamic angle for footwear emphasis",
    outfitDirection: "streetwear layers with performance sneakers and bold silhouette"
  },
  airport_travel: {
    instructions: "Travel lifestyle still with premium airport atmosphere and editorial composition.",
    locationStyle: "airport terminal corridor with motion blur in background",
    framing: "mid-body travel frame",
    angle: "dynamic 3/4 perspective",
    outfitDirection: "functional chic travel set with carry-on"
  },
  cafe_laptop: {
    instructions: "Lifestyle creator-at-work scene in cozy natural-light cafe setting.",
    locationStyle: "independent cafe corner with warm textures",
    framing: "seated medium shot",
    angle: "over-table 30-degree angle",
    outfitDirection: "soft knit layers with minimalist jewelry"
  },
  gym_training: {
    instructions: "Fitness lifestyle frame with disciplined movement and realistic workout energy.",
    locationStyle: "high-end gym floor with clean mirrors and directional lights",
    framing: "mid-body to full-body motion shot",
    angle: "45-degree action angle with depth",
    outfitDirection: "performance activewear with practical accessories"
  },
  golden_hour_city_walk: {
    instructions:
      "Golden-hour city walk scene with cinematic warmth and subtle lens flare control.",
    locationStyle: "old-town street with reflected warm light",
    framing: "mid-thigh to head",
    angle: "walking frame from front-left",
    outfitDirection: "flowing silhouette with movement-friendly fabric"
  },
  museum_gallery: {
    instructions: "Editorial lifestyle still in museum/gallery environment with tasteful symmetry.",
    locationStyle: "white gallery corridor with minimal art context",
    framing: "full body static pose",
    angle: "straight-on shot with slight shoulder turn",
    outfitDirection: "polished monochrome look with clean lines"
  },
  rooftop_sunset: {
    instructions: "Rooftop sunset scene with skyline depth and premium lifestyle mood.",
    locationStyle: "city rooftop with horizon glow",
    framing: "mid-body environmental portrait",
    angle: "gentle low-angle facing skyline",
    outfitDirection: "evening casual with layered outerwear"
  }
};

export function buildPromptJSON(
  input: PromptTemplateInput,
  format: ContentFormat | string
): InfluencerPromptJSON {
  const preset = PROMPT_PRESETS[input.preset];
  const scene = input.scene ?? {
    location: preset.locationStyle,
    action: "calm editorial pose with natural body language",
    props: []
  };
  const styleVariations = input.styleVariations ?? {
    outfit: preset.outfitDirection,
    makeup: "soft natural makeup, skin texture preserved",
    jewelry: "minimal jewelry accents",
    emotion: "confident and approachable"
  };

  return {
    IMPORTANT_INSTRUCTION:
      "DO NOT use or suggest any celebrity, famous person, or public figure. This influencer must remain original and private.",
    safety: {
      no_real_identity: true,
      non_explicit_only: true,
      originality_required: true
    },
    task: {
      instructions: `${preset.instructions} Keep style aligned with ${input.vibe} vibe and concept: ${input.concept}.`,
      output: "photorealistic influencer lifestyle photo",
      aspect_ratio: input.aspectRatio ?? "4:5",
      content_format: format,
      background: input.styleConstants.backgroundStyle,
      location_style: preset.locationStyle
    },
    identity_lock: {
      reference_image_id: input.referenceImageId ?? "NO_REFERENCE_IMAGE",
      lock_face: true,
      lock_hair: true,
      lock_skin_tone: true,
      instruction:
        "Do not alter facial identity, hair structure, or skin tone between generations. Keep identity consistency strict across all outputs."
    },
    body_consistency: {
      fixed_descriptors: input.bodyDescriptors,
      instruction:
        "Preserve the same body silhouette and proportions in all scenes, only changing wardrobe, expression, makeup, and accessories."
    },
    camera: {
      framing: preset.framing,
      angle: preset.angle,
      lens_look: input.styleConstants.lensLook,
      depth_of_field: "moderate shallow depth for realism"
    },
    wardrobe: {
      palette_rules: "Follow wardrobe palette and avoid clashing high-saturation colors.",
      outfit_direction: styleVariations.outfit
    },
    scene: {
      location: scene.location,
      action: scene.action,
      props: scene.props ?? []
    },
    style_variations: {
      outfit: styleVariations.outfit,
      makeup: styleVariations.makeup ?? "natural makeup with skin realism",
      jewelry: styleVariations.jewelry ?? "minimal jewelry accents",
      emotion: styleVariations.emotion ?? "confident and warm"
    },
    lighting: {
      direction: input.styleConstants.lighting,
      mood: "natural editorial lighting with dimensional highlights"
    },
    output_target: {
      generator: "nano_banana_compatible_json",
      note: "Use this JSON as the exact structured prompt payload in your external generator."
    },
    styling_notes: [
      "Keep texture realism in skin, fabric, and hair strands.",
      `Influencer identity: ${input.profileName}.`,
      "Allow variation in emotion and pose while preserving core identity lock.",
      `Scene target: ${scene.location} with action: ${scene.action}.`
    ],
    negatives: [
      "celebrity resemblance",
      "real public figure likeness",
      "nudity or explicit content",
      "identity drift (face/hair/skin tone changes)",
      "incorrect body proportions",
      "deformed hands or fingers",
      "extra limbs",
      "plastic skin or beauty filter",
      "anime, cartoon, CGI, 3D render look",
      "warped text or logos",
      "brand watermark artifacts",
      "over-sharpened AI skin texture",
      "incorrect sneaker or clothing geometry",
      ...(input.styleConstants.negativeExtras ?? [])
    ]
  };
}
