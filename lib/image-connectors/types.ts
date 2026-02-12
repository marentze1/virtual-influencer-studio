export type ImageGenerationRequest = {
  providerPrompt: Record<string, unknown>;
  referenceImageId?: string | null;
};

export type ImageGenerationResult = {
  status: "stub" | "ok" | "error";
  message: string;
  externalAssetUrl?: string;
};

export interface ImageGeneratorProvider {
  id: string;
  label: string;
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
