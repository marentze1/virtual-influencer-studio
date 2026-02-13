"use client";

import { useMemo, useState } from "react";
import type { PromptPreset } from "@/lib/types";

const PRESETS: Array<{ value: PromptPreset; label: string }> = [
  { value: "studio_portrait", label: "Studio Portrait" },
  { value: "street_fashion", label: "Street Fashion" },
  { value: "tunnel_streetwear", label: "Tunnel Streetwear" },
  { value: "airport_travel", label: "Airport Travel" },
  { value: "cafe_laptop", label: "Cafe Laptop" },
  { value: "gym_training", label: "Gym Training" },
  { value: "golden_hour_city_walk", label: "Golden-Hour City Walk" },
  { value: "museum_gallery", label: "Museum / Gallery" },
  { value: "rooftop_sunset", label: "Rooftop Sunset" }
];

type BuilderResult = {
  ok: boolean;
  promptJson?: Record<string, unknown>;
  error?: string;
};

type ImageProviderResult = {
  status: string;
  message?: string;
  provider?: string;
};

export function PromptBuilderPanel({ profileId }: { profileId: string }) {
  const [concept, setConcept] = useState("Confident tunnel look with bold sneaker focus and moody city light");
  const [preset, setPreset] = useState<PromptPreset>("tunnel_streetwear");
  const [format, setFormat] = useState("POST");
  const [sceneLocation, setSceneLocation] = useState("Urban tunnel with reflective floor");
  const [sceneAction, setSceneAction] = useState("Walking toward camera with controlled motion");
  const [sceneProps, setSceneProps] = useState("phone, metro pass, coffee cup");
  const [outfit, setOutfit] = useState("Oversized bomber, tapered cargos, Jordan sneakers");
  const [makeup, setMakeup] = useState("natural matte finish, soft defined eyes");
  const [jewelry, setJewelry] = useState("silver hoops + slim rings");
  const [emotion, setEmotion] = useState("focused confidence");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<BuilderResult | null>(null);
  const [providerResult, setProviderResult] = useState<ImageProviderResult | null>(null);

  const presetLabel = useMemo(
    () => PRESETS.find((entry) => entry.value === preset)?.label ?? preset,
    [preset]
  );

  const buildPrompt = async () => {
    setLoading(true);
    setProviderResult(null);
    setResult(null);

    try {
      const response = await fetch("/api/prompt-builder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          profileId,
          concept,
          preset,
          format,
          sceneLocation,
          sceneAction,
          sceneProps: sceneProps
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          outfit,
          makeup,
          jewelry,
          emotion
        })
      });

      const data = (await response.json()) as BuilderResult;
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const copyJson = async () => {
    if (!result?.promptJson) return;
    await navigator.clipboard.writeText(JSON.stringify(result.promptJson, null, 2));
  };

  const downloadJson = () => {
    if (!result?.promptJson) return;
    const blob = new Blob([JSON.stringify(result.promptJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `prompt-${preset}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const sendToStubProvider = async () => {
    if (!result?.promptJson) return;
    setSending(true);
    setProviderResult(null);

    try {
      const response = await fetch("/api/image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          providerId: "stub-provider",
          promptJson: result.promptJson
        })
      });
      setProviderResult((await response.json()) as ImageProviderResult);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-2xl border border-ink/10 bg-white/70 p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="pb-concept">Creative concept</label>
          <textarea
            id="pb-concept"
            rows={3}
            value={concept}
            onChange={(event) => setConcept(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pb-preset">Scene preset</label>
          <select
            id="pb-preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as PromptPreset)}
          >
            {PRESETS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
        <div>
          <label htmlFor="pb-scene-location">Scene location</label>
          <input
            id="pb-scene-location"
            value={sceneLocation}
            onChange={(event) => setSceneLocation(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pb-scene-action">Scene action</label>
          <input
            id="pb-scene-action"
            value={sceneAction}
            onChange={(event) => setSceneAction(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="pb-scene-props">Props (comma separated)</label>
          <input
            id="pb-scene-props"
            value={sceneProps}
            onChange={(event) => setSceneProps(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pb-outfit">Outfit direction</label>
          <input id="pb-outfit" value={outfit} onChange={(event) => setOutfit(event.target.value)} />
        </div>
        <div>
          <label htmlFor="pb-emotion">Emotion</label>
          <input id="pb-emotion" value={emotion} onChange={(event) => setEmotion(event.target.value)} />
        </div>
        <div>
          <label htmlFor="pb-makeup">Makeup</label>
          <input id="pb-makeup" value={makeup} onChange={(event) => setMakeup(event.target.value)} />
        </div>
        <div>
          <label htmlFor="pb-jewelry">Jewelry</label>
          <input id="pb-jewelry" value={jewelry} onChange={(event) => setJewelry(event.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={buildPrompt} disabled={loading}>
          {loading ? "Building..." : "Build Prompt JSON"}
        </button>
        <button
          type="button"
          className="muted-button"
          onClick={copyJson}
          disabled={!result?.promptJson}
        >
          Copy JSON
        </button>
        <button
          type="button"
          className="muted-button"
          onClick={downloadJson}
          disabled={!result?.promptJson}
        >
          Download JSON
        </button>
        <button
          type="button"
          className="muted-button"
          onClick={sendToStubProvider}
          disabled={!result?.promptJson || sending}
        >
          {sending ? "Sending..." : "Send to Provider Stub"}
        </button>
      </div>

      <p className="text-xs uppercase tracking-[0.1em] text-ink/50">
        Current preset: {presetLabel}
      </p>

      {result?.error ? <p className="text-sm text-red-700">{result.error}</p> : null}
      {providerResult ? (
        <p className="rounded-xl border border-ink/10 bg-white/80 px-3 py-2 text-sm text-ink/80">
          Provider response: {providerResult.status}
          {providerResult.message ? ` - ${providerResult.message}` : ""}
        </p>
      ) : null}

      {result?.promptJson ? (
        <pre className="max-h-96 overflow-auto rounded-2xl bg-ink/95 p-4 text-xs text-stone">
          {JSON.stringify(result.promptJson, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
