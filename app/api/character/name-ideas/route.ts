import { generateNameIdeas } from "@/lib/planner";

type NameIdeasBody = {
  niche?: string;
  vibe?: string;
  gender?: string;
};

type HandleStatus = "likely_taken" | "likely_available" | "unknown";

const IG_TIMEOUT_MS = 2200;

function toHandle(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

async function checkInstagramHandle(handle: string): Promise<HandleStatus> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IG_TIMEOUT_MS);

  try {
    const response = await fetch(`https://www.instagram.com/${handle}/`, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      },
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal
    });

    if (response.status === 404) {
      return "likely_available";
    }

    if (response.status === 200 || response.status === 301 || response.status === 302) {
      return "likely_taken";
    }

    return "unknown";
  } catch {
    return "unknown";
  } finally {
    clearTimeout(timeout);
  }
}

function genderPrefix(gender: string): string {
  const value = gender.toLowerCase();
  if (value.includes("male")) return "Leo";
  if (value.includes("non")) return "Ari";
  return "Mira";
}

export async function POST(request: Request) {
  const body = (await request.json()) as NameIdeasBody;
  const niche = body.niche ?? "fashion travel lifestyle";
  const vibe = body.vibe ?? "minimal cinematic";
  const seedPrefix = genderPrefix(body.gender ?? "female");

  const baseIdeas = generateNameIdeas(`${seedPrefix} ${niche}`, vibe);
  const extras = generateNameIdeas(`${niche} ${seedPrefix} ${vibe}`, "editorial");
  const names = [...new Set([...baseIdeas, ...extras])].slice(0, 10);

  const handles = names.map((name) => toHandle(name));
  const statuses = await Promise.all(handles.map((handle) => checkInstagramHandle(handle)));

  return Response.json({
    ok: true,
    ideas: names.map((name, index) => ({
      name,
      handle: handles[index],
      availability: statuses[index]
    })),
    note: "Availability is a best-effort hint only."
  });
}
