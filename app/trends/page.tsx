import { addTrendInputAction } from "@/app/actions";
import { Surface } from "@/components/surface";
import { prisma } from "@/lib/db";
import { ensureDemoUser } from "@/lib/planner";
import { trendConnectors } from "@/lib/trend-connectors";

function readArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export default async function TrendsPage() {
  const user = await ensureDemoUser();
  const trends = await prisma.trendInput.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  return (
    <div className="space-y-6">
      <Surface
        title="Trend + Idea Research"
        subtitle="Paste notes, links, or a short trend brief. MVP avoids fragile scraping."
      >
        <form action={addTrendInputAction} encType="multipart/form-data" className="space-y-4">
          <div>
            <label htmlFor="title">Brief title</label>
            <input id="title" name="title" placeholder="February travel aesthetics" />
          </div>
          <div>
            <label htmlFor="sourceLinks">Source links (optional)</label>
            <textarea
              id="sourceLinks"
              name="sourceLinks"
              rows={2}
              placeholder="https://example.com/trend-note"
            />
          </div>
          <div>
            <label htmlFor="rawText">Trend brief text</label>
            <textarea
              id="rawText"
              name="rawText"
              rows={6}
              required
              placeholder="Paste your notes, links summary, and observations here..."
            />
          </div>
          <div>
            <label htmlFor="briefFile">Or upload a short trend brief file (optional)</label>
            <input id="briefFile" name="briefFile" type="file" accept=".txt,.md,text/plain" />
          </div>
          <button type="submit">Summarize and Extract Insights</button>
        </form>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface title="Connector Stubs" subtitle="Optional adapters (intentionally conservative for MVP)">
          <ul className="space-y-3 text-sm text-ink/80">
            {trendConnectors.map((connector) => (
              <li key={connector.id} className="rounded-2xl border border-ink/10 bg-white p-3">
                <p className="font-medium text-ink">{connector.label}</p>
                <p className="mt-1 text-ink/70">{connector.description}</p>
              </li>
            ))}
          </ul>
        </Surface>

        <Surface title="Recent Trend Briefs" subtitle="Themes, hooks, and content angles">
          <div className="space-y-4">
            {trends.length === 0 ? <p className="text-sm text-ink/70">No briefs yet.</p> : null}
            {trends.map((trend) => (
              <article key={trend.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                <p className="text-sm font-semibold text-ink">{trend.title ?? "Trend brief"}</p>
                <p className="mt-2 text-sm text-ink/75">{trend.summary ?? "No summary"}</p>
                <List title="Themes" items={readArray(trend.themes)} />
                <List title="Hooks" items={readArray(trend.hooks)} />
                <List title="Angles" items={readArray(trend.angles)} />
              </article>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="text-xs uppercase tracking-[0.1em] text-ink/55">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-ink/55">None extracted.</p>
      ) : (
        <ul className="mt-1 space-y-1 text-sm text-ink/75">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
