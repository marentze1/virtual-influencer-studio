import type { ContentFormat } from "@prisma/client";

export type PromptPreset =
  | "studio_portrait"
  | "street_fashion"
  | "tunnel_streetwear"
  | "airport_travel"
  | "cafe_laptop"
  | "gym_training"
  | "golden_hour_city_walk"
  | "museum_gallery"
  | "rooftop_sunset";

export type PromptTemplateInput = {
  profileName: string;
  vibe: string;
  concept: string;
  preset: PromptPreset;
  aspectRatio?: string;
  referenceImageId?: string | null;
  bodyDescriptors: string[];
  styleConstants: {
    lensLook: string;
    lighting: string;
    backgroundStyle: string;
    negativeExtras?: string[];
  };
  scene?: {
    location: string;
    action: string;
    props?: string[];
  };
  styleVariations?: {
    outfit: string;
    makeup?: string;
    jewelry?: string;
    emotion?: string;
  };
  referenceImages?: Array<{
    image_id: string;
    role: "identity_primary" | "style_outfit" | "environment_mood" | "pose_reference";
    weight?: number;
    lockIdentity?: boolean;
  }>;
};

export type InfluencerPromptJSON = {
  IMPORTANT_INSTRUCTION: string;
  safety: {
    no_real_identity: true;
    non_explicit_only: true;
    originality_required: true;
  };
  task: {
    instructions: string;
    output: string;
    aspect_ratio: string;
    content_format: ContentFormat | string;
    background: string;
    location_style: string;
  };
  identity_lock: {
    reference_image_id: string;
    lock_face: true;
    lock_hair: true;
    lock_skin_tone: true;
    instruction: string;
  };
  reference_inputs: Array<{
    image_id: string;
    role: string;
    weight: number;
    lock_identity: boolean;
    instruction: string;
  }>;
  body_consistency: {
    fixed_descriptors: string[];
    instruction: string;
  };
  camera: {
    framing: string;
    angle: string;
    lens_look: string;
    depth_of_field: string;
  };
  wardrobe: {
    palette_rules: string;
    outfit_direction: string;
  };
  scene: {
    location: string;
    action: string;
    props: string[];
  };
  style_variations: {
    outfit: string;
    makeup: string;
    jewelry: string;
    emotion: string;
  };
  lighting: {
    direction: string;
    mood: string;
  };
  output_target: {
    generator: "nano_banana_compatible_json";
    note: string;
  };
  styling_notes: string[];
  negatives: string[];
};

export type TextPlanInput = {
  purpose: "bible" | "trend_summary" | "caption";
  input: string;
  constraints?: string[];
};

export type TextPlanOutput = {
  summary: string;
  bullets: string[];
  hooks?: string[];
  angles?: string[];
};

export type DailyBriefPayload = {
  dateKey: string;
  mission: string;
  format: string;
  concept: string;
  shotList: string[];
  caption: string;
  hashtags: string[];
  promptJson: InfluencerPromptJSON;
  safetyChecklist: { label: string; passed: boolean }[];
};
