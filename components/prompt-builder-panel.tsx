"use client";

import { useState } from "react";
import type { PromptPreset } from "@/lib/types";

const PRESETS: PromptPreset[] = [
  "studio_portrait",
  "street_fashion",
  "airport_travel",
  "cafe_laptop",
  "golden_hour_city_walk",
  "museum_gallery",
  "rooftop_sunset"
];

type BuilderResult = {
  ok: boolean;
  promptJson?: Record<string, unknown>;
  error?: string;
};

export function PromptBuilderPanel({ profileId }: { profileId: string }) {
  const [concept, setConcept] = useState("Cinematic city-walk frame with neutral trench and evening light");
  const [preset, setPreset] = useState<PromptPreset>("golden_hour_city_walk");
  const [format, setFormat] = useState("POST");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuilderResult | null>(null);

  const buildPrompt = async () => {
    setLoading(true);
    setResult(null);

    const response = await fetch("/api/prompt-builder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profileId,
        concept,
        preset,
        format
      })
    });

    const data = (await response.json()) as BuilderResult;
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="pb-concept">Concept</label>
          <textarea
            id="pb-concept"
            rows={3}
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pb-preset">Preset</label>
          <select
            id="pb-preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as PromptPreset)}
          >
            {PRESETS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pb-format">Format</label>
          <select id="pb-format" value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="POST">POST</option>
            <option value="STORY">STORY</option>
            <option value="CAROUSEL">CAROUSEL</option>
            <option value="REEL">REEL</option>
          </select>
        </div>
      </div>

      <button type="button" onClick={buildPrompt} disabled={loading}>
        {loading ? "Building..." : "Build Prompt JSON"}
      </button>

      {result?.error ? <p className="text-sm text-red-700">{result.error}</p> : null}

      {result?.promptJson ? (
        <pre className="max-h-80 overflow-auto rounded-xl bg-ink/95 p-3 text-xs text-stone">
          {JSON.stringify(result.promptJson, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
