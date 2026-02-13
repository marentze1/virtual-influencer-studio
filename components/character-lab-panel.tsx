"use client";

import { useState } from "react";

type UploadedReference = {
  id: string;
  filePath: string;
};

type Candidate = {
  id: string;
  name: string;
  handle: string;
  archetype: string;
  styleDna: string[];
  starterPromptJson: Record<string, unknown>;
};

type SuggestionResponse = {
  ok: boolean;
  error?: string;
  candidates?: Candidate[];
  safetyChecklist?: Array<{ label: string; passed: boolean }>;
};

type UploadResponse = {
  ok: boolean;
  error?: string;
  asset?: {
    id: string;
    filePath: string;
  };
};

export function CharacterLabPanel() {
  const [styleDirection, setStyleDirection] = useState("Cinematic streetwear with confident urban motion");
  const [audienceVibe, setAudienceVibe] = useState("Style-forward creators aged 18-34");
  const [locationFocus, setLocationFocus] = useState("Neon tunnel, city rooftops, modern gym interiors");
  const [outfitDirection, setOutfitDirection] = useState(
    "Jordan sneakers, elevated athleisure, minimalist accessories"
  );
  const [files, setFiles] = useState<File[]>([]);
  const [references, setReferences] = useState<UploadedReference[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [response, setResponse] = useState<SuggestionResponse | null>(null);

  const uploadReferences = async (): Promise<UploadedReference[]> => {
    if (files.length === 0) return references;
    setUploading(true);
    setError("");

    try {
      const uploaded: UploadedReference[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("title", `Character Lab - ${file.name}`);
        formData.set("tags", "character-lab,reference,inspiration");
        formData.set("pillar", "Identity");

        const res = await fetch("/api/assets/upload", {
          method: "POST",
          body: formData
        });
        const data = (await res.json()) as UploadResponse;

        if (!res.ok || !data.ok || !data.asset) {
          throw new Error(data.error ?? "Failed to upload reference image.");
        }

        uploaded.push({
          id: data.asset.id,
          filePath: data.asset.filePath
        });
      }

      const combined = [...references, ...uploaded];
      setReferences(combined);
      setFiles([]);
      return combined;
    } finally {
      setUploading(false);
    }
  };

  const generateCandidates = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const uploaded = await uploadReferences();
      const res = await fetch("/api/character-lab/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          styleDirection,
          audienceVibe,
          locationFocus,
          outfitDirection,
          referenceImageIds: uploaded.map((entry) => entry.id)
        })
      });
      const data = (await res.json()) as SuggestionResponse;
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Failed to generate character suggestions.");
      }

      setResponse(data);
      setSelectedCandidateId(data.candidates?.[0]?.id ?? "");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCandidate = response?.candidates?.find((candidate) => candidate.id === selectedCandidateId);

  const copySelectedPrompt = async () => {
    if (!selectedCandidate) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedCandidate.starterPromptJson, null, 2));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-ink/10 bg-white/75 p-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="styleDirection">Style direction</label>
          <textarea
            id="styleDirection"
            rows={2}
            value={styleDirection}
            onChange={(event) => setStyleDirection(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="audienceVibe">Audience vibe</label>
          <input
            id="audienceVibe"
            value={audienceVibe}
            onChange={(event) => setAudienceVibe(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="outfitDirection">Outfit direction</label>
          <input
            id="outfitDirection"
            value={outfitDirection}
            onChange={(event) => setOutfitDirection(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="locationFocus">Location focus</label>
          <input
            id="locationFocus"
            value={locationFocus}
            onChange={(event) => setLocationFocus(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="referenceFiles">Reference images (optional)</label>
          <input
            id="referenceFiles"
            type="file"
            multiple
            accept="image/*"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </div>
      </div>

      {references.length > 0 ? (
        <div className="rounded-2xl border border-ink/10 bg-white/75 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Uploaded references</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {references.map((item) => (
              <p key={item.id} className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs text-ink/75">
                {item.id}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={generateCandidates} disabled={loading || uploading}>
          {loading ? "Generating..." : "Generate Character Candidates"}
        </button>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {response?.candidates?.length ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {response.candidates.map((candidate) => {
              const isSelected = candidate.id === selectedCandidateId;
              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`text-left rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-ink bg-ink text-stone shadow-soft"
                      : "border-ink/10 bg-white/75 text-ink hover:border-ink/30"
                  }`}
                >
                  <p className="text-base font-semibold">{candidate.name}</p>
                  <p className={`mt-1 text-sm ${isSelected ? "text-stone/80" : "text-ink/65"}`}>
                    @{candidate.handle}
                  </p>
                  <p className={`mt-2 text-xs uppercase tracking-[0.12em] ${isSelected ? "text-stone/70" : "text-ink/50"}`}>
                    {candidate.archetype}
                  </p>
                  <p className={`mt-2 text-xs ${isSelected ? "text-stone/80" : "text-ink/70"}`}>
                    {candidate.styleDna.join(" · ")}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedCandidate ? (
            <div className="space-y-3 rounded-2xl border border-ink/10 bg-white/75 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Selected starter look</p>
                  <p className="text-lg font-semibold text-ink">
                    {selectedCandidate.name} (@{selectedCandidate.handle})
                  </p>
                </div>
                <button type="button" className="muted-button" onClick={copySelectedPrompt}>
                  Copy starter JSON
                </button>
              </div>
              <pre className="max-h-96 overflow-auto rounded-2xl bg-ink/95 p-4 text-xs text-stone">
                {JSON.stringify(selectedCandidate.starterPromptJson, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
