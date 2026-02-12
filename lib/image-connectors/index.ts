import { StubImageGeneratorProvider } from "@/lib/image-connectors/stub";
import type { ImageGeneratorProvider } from "@/lib/image-connectors/types";

const providers: Record<string, ImageGeneratorProvider> = {
  stub: new StubImageGeneratorProvider()
};

export function getImageProvider(id?: string): ImageGeneratorProvider {
  if (!id) {
    return providers.stub;
  }

  return providers[id] ?? providers.stub;
}
