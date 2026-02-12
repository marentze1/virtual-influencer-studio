import Image from "next/image";
import { AssetUpload } from "@/components/asset-upload";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";

function readArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export default async function AssetsPage() {
  const user = await ensureDemoUser();
  const assets = await prisma.asset.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <div className="space-y-6">
      <Surface title="Asset Library" subtitle="Prompts, exports, and uploaded visuals.">
        <AssetUpload />
      </Surface>

      <Surface title="Stored Assets" subtitle="Tagged by outfit, location, pillar, and date.">
        {assets.length === 0 ? <p className="text-sm text-ink/70">No assets saved yet.</p> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => {
            const tags = readArray(asset.tags);
            const hasImage = Boolean(asset.filePath);

            return (
              <article key={asset.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                {hasImage ? (
                  <div className="relative h-56 w-full">
                    <Image src={asset.filePath!} alt={asset.title ?? "Asset"} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="h-20 bg-ink/5" />
                )}

                <div className="space-y-2 p-4">
                  <p className="text-sm font-semibold text-ink">{asset.title ?? "Untitled"}</p>
                  <p className="text-xs uppercase tracking-[0.1em] text-ink/50">{asset.type}</p>

                  {asset.captionText ? (
                    <p className="text-sm text-ink/75">{asset.captionText}</p>
                  ) : null}

                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-ink/10 bg-stone px-2 py-1 text-xs text-ink/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="grid gap-1 text-xs text-ink/60">
                    {asset.outfit ? <p>Outfit: {asset.outfit}</p> : null}
                    {asset.location ? <p>Location: {asset.location}</p> : null}
                    {asset.pillar ? <p>Pillar: {asset.pillar}</p> : null}
                  </div>

                  {asset.promptJson ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-ink/65">Prompt JSON</summary>
                      <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-ink/95 p-2 text-[11px] text-stone">
                        {JSON.stringify(asset.promptJson, null, 2)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </Surface>
    </div>
  );
}
