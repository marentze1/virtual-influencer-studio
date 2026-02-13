"use client";

import { useMemo, useState } from "react";

type Choice = {
  label: string;
  value: string;
  icon: string;
};

type NameIdea = {
  name: string;
  handle: string;
  availability: "likely_taken" | "likely_available" | "unknown";
};

type StarterPrompt = {
  id: string;
  preset: string;
  promptJson: Record<string, unknown>;
};

type UploadedReference = {
  id: string;
  filePath: string;
};

const genders: Choice[] = [
  { label: "Female", value: "female", icon: "♀" },
  { label: "Male", value: "male", icon: "♂" },
  { label: "Non-binary", value: "non-binary", icon: "◐" }
];

const ages: Choice[] = [
  { label: "18-21", value: "18-21", icon: "◔" },
  { label: "22-28", value: "22-28", icon: "◑" },
  { label: "29-35", value: "29-35", icon: "◕" },
  { label: "36+", value: "36+", icon: "◉" }
];

const races: Choice[] = [
  { label: "White", value: "white", icon: "◌" },
  { label: "Black", value: "black", icon: "●" },
  { label: "Asian", value: "asian", icon: "◍" },
  { label: "Middle Eastern", value: "middle eastern", icon: "◎" },
  { label: "Latina/o", value: "latina", icon: "◐" },
  { label: "Mixed", value: "mixed heritage", icon: "◒" }
];

const bodyTypes: Choice[] = [
  { label: "Slim", value: "slim", icon: "▯" },
  { label: "Athletic", value: "athletic", icon: "▭" },
  { label: "Curvy", value: "curvy", icon: "◜" },
  { label: "Balanced", value: "balanced", icon: "◫" }
];

const looks: Choice[] = [
  { label: "Soft Editorial", value: "soft editorial", icon: "◇" },
  { label: "Street Luxe", value: "street luxe", icon: "⬢" },
  { label: "Athletic Chic", value: "athletic chic", icon: "△" },
  { label: "Travel Minimal", value: "travel minimal", icon: "□" }
];

const hairStyles: Choice[] = [
  { label: "Long Straight", value: "long straight", icon: "⇣" },
  { label: "Wavy Medium", value: "wavy medium", icon: "≈" },
  { label: "Curly", value: "curly", icon: "∞" },
  { label: "Short Modern", value: "short modern", icon: "⌇" }
];

const eyeColors: Choice[] = [
  { label: "Brown", value: "brown", icon: "◉" },
  { label: "Hazel", value: "hazel", icon: "◍" },
  { label: "Green", value: "green", icon: "◌" },
  { label: "Blue", value: "blue", icon: "◯" }
];

function badgeClass(availability: NameIdea["availability"]): string {
  if (availability === "likely_available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (availability === "likely_taken") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-ink/10 bg-white text-ink/65";
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}

export function CreateAvatarStudio() {
  const [gender, setGender] = useState("female");
  const [ageRange, setAgeRange] = useState("22-28");
  const [race, setRace] = useState("mixed heritage");
  const [bodyType, setBodyType] = useState("athletic");
  const [look, setLook] = useState("street luxe");
  const [hairStyle, setHairStyle] = useState("wavy medium");
  const [eyeColor, setEyeColor] = useState("brown");

  const [niche, setNiche] = useState("fashion, travel, photography lifestyle");
  const [vibe, setVibe] = useState("minimal cinematic");
  const [targetAudience, setTargetAudience] = useState("Style-forward creators, 18-34");

  const [ideas, setIdeas] = useState<NameIdea[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedHandle, setSelectedHandle] = useState("");

  const [inspirationNote, setInspirationNote] = useState("");
  const [inspirationFiles, setInspirationFiles] = useState<File[]>([]);
  const [uploadedReferences, setUploadedReferences] = useState<UploadedReference[]>([]);

  const [starterPrompts, setStarterPrompts] = useState<StarterPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState("");

  const [loadingNames, setLoadingNames] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedPrompt = useMemo(
    () => starterPrompts.find((item) => item.id === selectedPromptId),
    [starterPrompts, selectedPromptId]
  );

  const refreshStyleMix = () => {
    setGender(randomFrom(genders).value);
    setAgeRange(randomFrom(ages).value);
    setRace(randomFrom(races).value);
    setBodyType(randomFrom(bodyTypes).value);
    setLook(randomFrom(looks).value);
    setHairStyle(randomFrom(hairStyles).value);
    setEyeColor(randomFrom(eyeColors).value);
  };

  const refreshNames = async () => {
    setLoadingNames(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/character/name-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, vibe, gender })
      });
      const data = (await response.json()) as {
        ok: boolean;
        ideas?: NameIdea[];
        error?: string;
      };

      if (!response.ok || !data.ok || !data.ideas) {
        throw new Error(data.error ?? "Could not generate names right now.");
      }

      setIdeas(data.ideas);
      setSelectedName(data.ideas[0]?.name ?? "");
      setSelectedHandle(data.ideas[0]?.handle ?? "");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate names.");
    } finally {
      setLoadingNames(false);
    }
  };

  const uploadInspiration = async (): Promise<UploadedReference[]> => {
    if (inspirationFiles.length === 0) return uploadedReferences;

    const uploaded: UploadedReference[] = [];

    for (const file of inspirationFiles) {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("title", `Inspiration ${file.name}`);
      formData.set("tags", "avatar,inspiration,reference");
      formData.set("pillar", "Identity");

      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as {
        ok: boolean;
        asset?: { id: string; filePath: string };
        error?: string;
      };

      if (!response.ok || !data.ok || !data.asset) {
        throw new Error(data.error ?? "Could not upload inspiration image.");
      }

      uploaded.push({
        id: data.asset.id,
        filePath: data.asset.filePath
      });
    }

    const merged = [...uploadedReferences, ...uploaded];
    setUploadedReferences(merged);
    setInspirationFiles([]);
    return merged;
  };

  const generateStarterPrompts = async () => {
    if (!selectedName) {
      setError("Pick a name first, then generate starter prompts.");
      return;
    }

    setLoadingPrompts(true);
    setError("");
    setSuccess("");

    try {
      await uploadInspiration();

      const response = await fetch("/api/character/starter-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedName,
          vibe,
          look,
          ageRange,
          gender,
          race,
          bodyType,
          hairStyle,
          styleArchetype: look,
          inspirationNote: [inspirationNote, `Eye color: ${eyeColor}`].filter(Boolean).join(". ")
        })
      });

      const data = (await response.json()) as {
        ok: boolean;
        prompts?: StarterPrompt[];
        error?: string;
      };

      if (!response.ok || !data.ok || !data.prompts) {
        throw new Error(data.error ?? "Could not generate starter prompts.");
      }

      setStarterPrompts(data.prompts);
      setSelectedPromptId(data.prompts[0]?.id ?? "");
      setSuccess("Starter pack ready. Generate your favorite face externally and keep that image as identity reference.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to generate starter prompts.");
    } finally {
      setLoadingPrompts(false);
    }
  };

  const saveAvatar = async () => {
    if (!selectedName || !selectedHandle) {
      setError("Select a generated name and handle before saving.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/avatars/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedName,
          handle: selectedHandle,
          niche,
          targetAudience,
          vibe,
          values: ["creativity", "consistency", "originality"],
          boundaries: [
            "No nudity",
            "No explicit content",
            "No real celebrity/public figure references"
          ],
          languages: ["English", "German"],
          postingFrequency: "1 post with 2-4 images + 2 stories daily",
          growthGoal: "Build a strong daily content engine with consistent visual identity",
          characterSummary: `${selectedName}: ${gender}, ${ageRange}, ${race}, ${look}, ${bodyType}, ${hairStyle} hair, ${eyeColor} eyes.`,
          bodyDescriptors: [
            `${bodyType} body silhouette`,
            `${ageRange} appearance`,
            "consistent proportions",
            "realistic anatomy"
          ],
          styleRules: [
            look,
            `${hairStyle} hairstyle consistency`,
            `${eyeColor} eye tone consistency`,
            "premium lifestyle styling"
          ],
          cameraStyle: ["85mm editorial realism", "cinematic depth", "clean focus separation"],
          recurringLocations: ["city tunnel", "cafe", "airport", "rooftop", "gym"],
          personalityTraits: ["confident", "curious", "disciplined", "stylish"]
        })
      });

      const data = (await response.json()) as { ok: boolean; profileId?: string; error?: string };
      if (!response.ok || !data.ok || !data.profileId) {
        throw new Error(data.error ?? "Could not save avatar.");
      }

      setSuccess("Avatar saved. Next: define persona details and daily strategy.");
      window.location.href = `/persona?profileId=${data.profileId}`;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to save avatar.");
    } finally {
      setSaving(false);
    }
  };

  const copySelectedPrompt = async () => {
    if (!selectedPrompt) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedPrompt.promptJson, null, 2));
    setSuccess("Starter JSON copied.");
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 1</p>
            <h3 className="text-xl font-semibold text-ink">Build Avatar DNA</h3>
            <p className="mt-1 text-sm text-ink/65">Pick how your avatar should look. You can randomize and iterate fast.</p>
          </div>
          <button type="button" className="muted-button" onClick={refreshStyleMix}>
            Refresh Style Mix
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <ChoiceGroup label="Gender" choices={genders} value={gender} onChange={setGender} />
          <ChoiceGroup label="Age" choices={ages} value={ageRange} onChange={setAgeRange} />
          <ChoiceGroup label="Race / Ethnicity" choices={races} value={race} onChange={setRace} />
          <ChoiceGroup label="Body" choices={bodyTypes} value={bodyType} onChange={setBodyType} />
          <ChoiceGroup label="Look" choices={looks} value={look} onChange={setLook} />
          <ChoiceGroup label="Hair" choices={hairStyles} value={hairStyle} onChange={setHairStyle} />
          <ChoiceGroup label="Eye color" choices={eyeColors} value={eyeColor} onChange={setEyeColor} />

          <div className="rounded-2xl border border-ink/10 bg-white p-3 lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.12em] text-ink/55">Avatar Snapshot</p>
            <p className="mt-2 text-sm text-ink/80">
              {gender}, {ageRange}, {race}, {bodyType}, {hairStyle} hair, {eyeColor} eyes, {look} style.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 2</p>
        <h3 className="text-xl font-semibold text-ink">Name Lab</h3>
        <p className="mt-1 text-sm text-ink/65">Generate 10 original names + basic Instagram handle availability hint.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="ca-niche">Niche</label>
            <input id="ca-niche" value={niche} onChange={(event) => setNiche(event.target.value)} />
          </div>
          <div>
            <label htmlFor="ca-vibe">Vibe</label>
            <input id="ca-vibe" value={vibe} onChange={(event) => setVibe(event.target.value)} />
          </div>
          <div>
            <label htmlFor="ca-audience">Target audience</label>
            <input
              id="ca-audience"
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={refreshNames} disabled={loadingNames}>
            {loadingNames ? "Refreshing..." : "Refresh 10 Name Ideas"}
          </button>
        </div>

        {ideas.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => {
              const selected = selectedHandle === idea.handle;
              return (
                <button
                  key={idea.handle}
                  type="button"
                  onClick={() => {
                    setSelectedName(idea.name);
                    setSelectedHandle(idea.handle);
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-ink bg-ink text-stone"
                      : "border-ink/10 bg-white text-ink hover:border-ink/35"
                  }`}
                >
                  <p className="text-base font-semibold">{idea.name}</p>
                  <p className={`mt-1 text-sm ${selected ? "text-stone/85" : "text-ink/65"}`}>@{idea.handle}</p>
                  <span
                    className={`mt-3 inline-flex rounded-full border px-2 py-1 text-[11px] uppercase tracking-[0.08em] ${
                      selected ? "border-stone/30 bg-stone/10 text-stone" : badgeClass(idea.availability)
                    }`}
                  >
                    {idea.availability === "likely_available"
                      ? "Likely free"
                      : idea.availability === "likely_taken"
                        ? "Likely taken"
                        : "Unknown"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 3</p>
        <h3 className="text-xl font-semibold text-ink">Inspiration Upload (optional)</h3>
        <p className="mt-1 text-sm text-ink/65">Upload people/styles you like. The app stores references and you can reuse them for outfit/mood prompts later.</p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="ca-inspiration-note">What do you like about those references?</label>
            <textarea
              id="ca-inspiration-note"
              rows={2}
              value={inspirationNote}
              onChange={(event) => setInspirationNote(event.target.value)}
              placeholder="Example: confident expression, clean jawline, premium streetwear mix."
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="ca-inspiration-files">Upload references</label>
            <input
              id="ca-inspiration-files"
              type="file"
              multiple
              accept="image/*"
              onChange={(event) => setInspirationFiles(Array.from(event.target.files ?? []))}
            />
          </div>
        </div>

        {uploadedReferences.length > 0 ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedReferences.map((entry) => (
              <p key={entry.id} className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs text-ink/65">
                {entry.id}
              </p>
            ))}
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 4</p>
        <h3 className="text-xl font-semibold text-ink">Starter Prompt Pack</h3>
        <p className="mt-1 text-sm text-ink/65">Generate 4 JSON prompts without input images for the very first face generation.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={generateStarterPrompts} disabled={loadingPrompts || !selectedName}>
            {loadingPrompts ? "Generating..." : "Generate 4 Starter Prompts"}
          </button>
          <button type="button" className="muted-button" onClick={copySelectedPrompt} disabled={!selectedPrompt}>
            Copy Selected JSON
          </button>
          <button type="button" onClick={saveAvatar} disabled={saving || !selectedName || !selectedHandle}>
            {saving ? "Saving..." : "Save Avatar"}
          </button>
        </div>

        {starterPrompts.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {starterPrompts.map((entry) => {
              const active = selectedPromptId === entry.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedPromptId(entry.id)}
                  className={`rounded-2xl border p-3 text-left transition ${
                    active ? "border-ink bg-ink text-stone" : "border-ink/10 bg-white text-ink"
                  }`}
                >
                  <p className="text-sm font-semibold">{entry.preset.replaceAll("_", " ")}</p>
                  <p className={`mt-1 text-xs ${active ? "text-stone/75" : "text-ink/60"}`}>
                    Initial identity generation
                  </p>
                </button>
              );
            })}
          </div>
        ) : null}

        {selectedPrompt ? (
          <pre className="mt-4 max-h-[500px] overflow-auto rounded-2xl bg-ink p-4 text-xs text-stone">
            {JSON.stringify(selectedPrompt.promptJson, null, 2)}
          </pre>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      ) : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  choices,
  value,
  onChange
}: {
  label: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-3">
      <p className="mb-2 text-xs uppercase tracking-[0.1em] text-ink/55">{label}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => {
          const active = value === choice.value;
          return (
            <button
              key={choice.value}
              type="button"
              onClick={() => onChange(choice.value)}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                active ? "border-ink bg-ink text-stone" : "border-ink/20 bg-white text-ink/75"
              }`}
            >
              <span className="mr-1.5">{choice.icon}</span>
              {choice.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
