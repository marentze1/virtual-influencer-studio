"use client";

import { useEffect, useMemo, useState } from "react";

type ProfileOption = {
  id: string;
  name: string | null;
  handle: string | null;
  referenceFaceImageId: string | null;
  vibe: string;
};

type TrendOption = {
  id: string;
  label: string;
  source: string;
  reason: string;
};

type ImageSpec = {
  concept: string;
  location: string;
  action: string;
  outfit: string;
  expression: string;
  cameraAngle: string;
  framing: string;
  lensLook: string;
  props: string;
};

type DailyOutput = {
  caption: string;
  cta: string;
  hashtags: string[];
  stories: string[];
  prompts: Array<{
    index: number;
    concept: string;
    promptJson: Record<string, unknown>;
  }>;
  safetyChecklist: Array<{ label: string; passed: boolean }>;
};

type GenerateResult = {
  ok: boolean;
  output?: DailyOutput;
  error?: string;
};

function makeDefaultSpec(index: number): ImageSpec {
  const defaults = [
    {
      concept: "hero frame introducing the full look",
      location: "city tunnel",
      action: "walking toward camera",
      outfit: "street luxe fit with statement sneakers",
      expression: "confident neutral",
      cameraAngle: "slight low angle",
      framing: "full body",
      lensLook: "35mm cinematic",
      props: "none"
    },
    {
      concept: "detail frame focusing on fit and accessories",
      location: "same tunnel side wall",
      action: "static pose",
      outfit: "same base outfit with jacket details visible",
      expression: "subtle smile",
      cameraAngle: "eye level",
      framing: "mid-body",
      lensLook: "50mm crisp",
      props: "phone"
    },
    {
      concept: "movement frame with stronger energy",
      location: "tunnel exit",
      action: "turn and walk",
      outfit: "same outfit with motion",
      expression: "focused",
      cameraAngle: "dynamic side angle",
      framing: "full body wide",
      lensLook: "28mm urban",
      props: "bag"
    },
    {
      concept: "final lifestyle frame for carousel closing",
      location: "outdoor city corner",
      action: "leaning and looking away",
      outfit: "outer layer highlight",
      expression: "relaxed",
      cameraAngle: "high angle slight tilt",
      framing: "3/4 body",
      lensLook: "35mm",
      props: "coffee cup"
    }
  ];

  return defaults[index] ?? defaults[0];
}

function downloadTextFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudioDailyPlanner({
  profiles,
  trends,
  selectedProfileId,
  defaultDate
}: {
  profiles: ProfileOption[];
  trends: TrendOption[];
  selectedProfileId: string;
  defaultDate: string;
}) {
  const [profileId, setProfileId] = useState(selectedProfileId || profiles[0]?.id || "");

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === profileId) ?? profiles[0],
    [profiles, profileId]
  );
  const [dateKey, setDateKey] = useState(defaultDate);
  const [selectedTrendId, setSelectedTrendId] = useState(trends[0]?.id ?? "custom");
  const [customTrendText, setCustomTrendText] = useState("");

  const [postImageCount, setPostImageCount] = useState(3);
  const [storyCount, setStoryCount] = useState(2);
  const [identityImageId, setIdentityImageId] = useState(selectedProfile?.referenceFaceImageId ?? "");
  const [outfitImageId, setOutfitImageId] = useState("");
  const [moodImageId, setMoodImageId] = useState("");

  const [specs, setSpecs] = useState<ImageSpec[]>([makeDefaultSpec(0), makeDefaultSpec(1), makeDefaultSpec(2)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DailyOutput | null>(null);

  useEffect(() => {
    if (!selectedProfile) return;
    setIdentityImageId(selectedProfile.referenceFaceImageId ?? "");
  }, [selectedProfile]);

  useEffect(() => {
    setSpecs((current) => {
      if (current.length === postImageCount) return current;

      if (current.length > postImageCount) {
        return current.slice(0, postImageCount);
      }

      const next = [...current];
      for (let index = current.length; index < postImageCount; index += 1) {
        next.push(makeDefaultSpec(index));
      }
      return next;
    });
  }, [postImageCount]);

  const selectedTrend = useMemo(
    () => trends.find((trend) => trend.id === selectedTrendId),
    [trends, selectedTrendId]
  );

  const selectedTrendText =
    selectedTrendId === "custom" ? customTrendText.trim() : (selectedTrend?.label ?? "city fashion trends");

  const updateSpec = (index: number, patch: Partial<ImageSpec>) => {
    setSpecs((current) => current.map((spec, specIndex) => (specIndex === index ? { ...spec, ...patch } : spec)));
  };

  const applyStructure = (type: "balanced" | "lean" | "extended") => {
    if (type === "balanced") {
      setPostImageCount(3);
      setStoryCount(2);
      return;
    }

    if (type === "lean") {
      setPostImageCount(2);
      setStoryCount(2);
      return;
    }

    setPostImageCount(4);
    setStoryCount(3);
  };

  const generatePlan = async () => {
    if (!profileId) {
      setError("Pick an avatar profile first.");
      return;
    }

    if (!selectedTrendText) {
      setError("Select a trend or provide custom trend text.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/studio/generate-daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          dateKey,
          trend: selectedTrendText,
          postImageCount,
          storyCount,
          identityImageId,
          outfitImageId,
          moodImageId,
          imageSpecs: specs
        })
      });

      const data = (await response.json()) as GenerateResult;
      if (!response.ok || !data.ok || !data.output) {
        throw new Error(data.error ?? "Could not generate daily plan.");
      }

      setResult(data.output);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate daily plan.");
    } finally {
      setLoading(false);
    }
  };

  const copyCaption = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${result.caption}\n\n${result.hashtags.join(" ")}`);
  };

  const exportJson = () => {
    if (!result) return;
    downloadTextFile(`daily-plan-${dateKey}.json`, JSON.stringify(result, null, 2), "application/json");
  };

  const exportText = () => {
    if (!result) return;

    const lines = [
      `Date: ${dateKey}`,
      `Trend: ${selectedTrendText}`,
      "",
      `Caption: ${result.caption}`,
      `CTA: ${result.cta}`,
      `Hashtags: ${result.hashtags.join(" ")}`,
      "",
      "Stories:",
      ...result.stories.map((story, index) => `${index + 1}. ${story}`),
      "",
      "Safety:",
      ...result.safetyChecklist.map((item) => `${item.passed ? "[OK]" : "[ ]"} ${item.label}`)
    ];

    downloadTextFile(`daily-plan-${dateKey}.txt`, lines.join("\n"), "text/plain;charset=utf-8");
  };

  if (!selectedProfile) {
    return <p className="text-sm text-ink/70">No avatar profile found. Create one first.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 3</p>
        <h3 className="text-xl font-semibold text-ink">Daily Studio</h3>
        <p className="mt-1 text-sm text-ink/65">Generate one post (2-4 images) and stories, with exact prompt JSON for each visual.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="sd-profile">Avatar</label>
            <select id="sd-profile" value={profileId} onChange={(event) => setProfileId(event.target.value)}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name ?? "Untitled"} (@{profile.handle ?? "no_handle"})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sd-date">Date</label>
            <input id="sd-date" type="date" value={dateKey} onChange={(event) => setDateKey(event.target.value)} />
          </div>
          <div>
            <label htmlFor="sd-images">Post images</label>
            <select
              id="sd-images"
              value={String(postImageCount)}
              onChange={(event) => setPostImageCount(Number(event.target.value))}
            >
              <option value="2">2 images</option>
              <option value="3">3 images</option>
              <option value="4">4 images</option>
            </select>
          </div>
          <div>
            <label htmlFor="sd-stories">Stories</label>
            <select id="sd-stories" value={String(storyCount)} onChange={(event) => setStoryCount(Number(event.target.value))}>
              <option value="2">2 stories</option>
              <option value="3">3 stories</option>
              <option value="4">4 stories</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className="muted-button" onClick={() => applyStructure("balanced")}>
            Balanced (3 + 2)
          </button>
          <button type="button" className="muted-button" onClick={() => applyStructure("lean")}>
            Lean (2 + 2)
          </button>
          <button type="button" className="muted-button" onClick={() => applyStructure("extended")}>
            Extended (4 + 3)
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <h3 className="text-xl font-semibold text-ink">Trend Selection</h3>
        <p className="mt-1 text-sm text-ink/65">Backend trend suggestions from your saved briefs. Pick one or add custom.</p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {trends.map((trend) => {
            const active = selectedTrendId === trend.id;
            return (
              <button
                key={trend.id}
                type="button"
                onClick={() => setSelectedTrendId(trend.id)}
                className={`rounded-2xl border p-4 text-left ${
                  active ? "border-ink bg-ink text-stone" : "border-ink/10 bg-white text-ink"
                }`}
              >
                <p className="text-sm font-semibold">{trend.label}</p>
                <p className={`mt-1 text-xs ${active ? "text-stone/80" : "text-ink/60"}`}>{trend.reason}</p>
                <p className={`mt-2 text-[11px] uppercase tracking-[0.1em] ${active ? "text-stone/70" : "text-ink/50"}`}>
                  {trend.source}
                </p>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSelectedTrendId("custom")}
            className={`rounded-2xl border p-4 text-left ${
              selectedTrendId === "custom" ? "border-ink bg-ink text-stone" : "border-ink/10 bg-white text-ink"
            }`}
          >
            <p className="text-sm font-semibold">Custom trend</p>
            <p className={`mt-1 text-xs ${selectedTrendId === "custom" ? "text-stone/80" : "text-ink/60"}`}>
              Type your own focus for today.
            </p>
          </button>
        </div>

        {selectedTrendId === "custom" ? (
          <div className="mt-4">
            <label htmlFor="sd-custom-trend">Custom trend</label>
            <input
              id="sd-custom-trend"
              value={customTrendText}
              onChange={(event) => setCustomTrendText(event.target.value)}
              placeholder="Example: oversized denim layering with tunnel lighting"
            />
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <h3 className="text-xl font-semibold text-ink">Reference Inputs</h3>
        <p className="mt-1 text-sm text-ink/65">Use one or more reference images to lock identity and optionally transfer outfit/mood.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="sd-identity">Identity image id (IMAGE1)</label>
            <input
              id="sd-identity"
              value={identityImageId}
              onChange={(event) => setIdentityImageId(event.target.value)}
              placeholder="asset_identity_001"
            />
          </div>
          <div>
            <label htmlFor="sd-outfit">Outfit image id (IMAGE2 optional)</label>
            <input
              id="sd-outfit"
              value={outfitImageId}
              onChange={(event) => setOutfitImageId(event.target.value)}
              placeholder="asset_outfit_002"
            />
          </div>
          <div>
            <label htmlFor="sd-mood">Mood image id (optional)</label>
            <input
              id="sd-mood"
              value={moodImageId}
              onChange={(event) => setMoodImageId(event.target.value)}
              placeholder="asset_mood_003"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <h3 className="text-xl font-semibold text-ink">Post Visual Planner</h3>
        <p className="mt-1 text-sm text-ink/65">Each card becomes one image JSON prompt in your post.</p>

        <div className="mt-4 space-y-4">
          {specs.map((spec, index) => (
            <article key={`spec-${index}`} className="rounded-2xl border border-ink/10 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Image {index + 1}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Field
                  label="Concept"
                  value={spec.concept}
                  onChange={(value) => updateSpec(index, { concept: value })}
                />
                <Field
                  label="Location"
                  value={spec.location}
                  onChange={(value) => updateSpec(index, { location: value })}
                />
                <Field
                  label="Action"
                  value={spec.action}
                  onChange={(value) => updateSpec(index, { action: value })}
                />
                <Field
                  label="Outfit"
                  value={spec.outfit}
                  onChange={(value) => updateSpec(index, { outfit: value })}
                />
                <Field
                  label="Expression"
                  value={spec.expression}
                  onChange={(value) => updateSpec(index, { expression: value })}
                />
                <Field
                  label="Camera angle"
                  value={spec.cameraAngle}
                  onChange={(value) => updateSpec(index, { cameraAngle: value })}
                />
                <Field
                  label="Framing"
                  value={spec.framing}
                  onChange={(value) => updateSpec(index, { framing: value })}
                />
                <Field
                  label="Lens look"
                  value={spec.lensLook}
                  onChange={(value) => updateSpec(index, { lensLook: value })}
                />
                <Field
                  label="Props"
                  value={spec.props}
                  onChange={(value) => updateSpec(index, { props: value })}
                />
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={generatePlan} disabled={loading}>
            {loading ? "Generating..." : "Generate Daily Output"}
          </button>
          {result ? (
            <>
              <button type="button" className="muted-button" onClick={copyCaption}>
                Copy Caption + Hashtags
              </button>
              <button type="button" className="muted-button" onClick={exportJson}>
                Download JSON
              </button>
              <button type="button" className="muted-button" onClick={exportText}>
                Download Text
              </button>
            </>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {result ? (
        <section className="space-y-4 rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
          <div>
            <h3 className="text-xl font-semibold text-ink">Today’s Output</h3>
            <p className="mt-1 text-sm text-ink/65">Ready to copy-paste into Instagram + external generator.</p>
          </div>

          <article className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/55">Caption</p>
            <p className="mt-2 text-sm text-ink/85">{result.caption}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/55">CTA</p>
            <p className="mt-1 text-sm text-ink/85">{result.cta}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.1em] text-ink/55">Hashtags</p>
            <p className="mt-1 text-sm text-ink/85">{result.hashtags.join(" ")}</p>
          </article>

          <article className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/55">Stories</p>
            <ol className="mt-2 space-y-1 text-sm text-ink/85">
              {result.stories.map((story, index) => (
                <li key={story}>{index + 1}. {story}</li>
              ))}
            </ol>
          </article>

          <article className="rounded-2xl border border-ink/10 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.1em] text-ink/55">Safety & Originality</p>
            <ul className="mt-2 space-y-1 text-sm text-ink/85">
              {result.safetyChecklist.map((item) => (
                <li key={item.label}>{item.passed ? "[OK]" : "[ ]"} {item.label}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-3">
            {result.prompts.map((entry) => (
              <details key={entry.index} className="rounded-2xl border border-ink/10 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-ink">
                  Image {entry.index + 1} JSON · {entry.concept}
                </summary>
                <pre className="mt-3 max-h-[360px] overflow-auto rounded-xl bg-ink p-3 text-xs text-stone">
                  {JSON.stringify(entry.promptJson, null, 2)}
                </pre>
              </details>
            ))}
          </article>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
