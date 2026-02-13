import type {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageGeneratorProvider
} from "@/lib/image-connectors/types";

export class StubImageGeneratorProvider implements ImageGeneratorProvider {
  id = "stub-provider";
  label = "Stub Provider";

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    void request;

    return {
      status: "stub",
      message:
        "Image generation is not enabled in MVP. Plug your provider behind ImageGeneratorProvider to use this endpoint."
    };
  }
}
