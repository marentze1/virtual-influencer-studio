import { getImageProvider } from "@/lib/image-connectors";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    providerId?: string;
    promptJson?: Record<string, unknown>;
    referenceImageId?: string;
  };

  const provider = getImageProvider(body.providerId);
  const result = await provider.generateImage({
    providerPrompt: body.promptJson ?? {},
    referenceImageId: body.referenceImageId
  });

  return Response.json({
    provider: provider.label,
    ...result
  });
}
