"use client";

import { useMemo, useState } from "react";

type PersonaProfile = {
  id: string;
  name: string | null;
  handle: string | null;
  vibe: string;
  niche: string;
  personaBio: string | null;
  backstory: string | null;
  whyExists: string | null;
  personalityTraits: string[];
  styleRules: string[];
  recurringLocations: string[];
  toneRules: string[];
  contentPillars: string[];
  captionStyle: string | null;
  emojiRules: string | null;
};

const STYLE_PRESETS = [
  "Premium minimal",
  "Street luxe",
  "Athletic chic",
  "Travel editorial"
];

const CAPTION_STYLES = [
  "Hook + micro-story + CTA",
  "Clean one-liner + CTA",
  "Narrative diary + CTA",
  "Photo tip + CTA"
];

function splitCsv(value: string): string[] {
  return value
    .split(/,|\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(values: string[]): string {
  return values.join(", ");
}

export function PersonaEditor({
  profiles,
  selectedProfileId
}: {
  profiles: PersonaProfile[];
  selectedProfileId: string;
}) {
  const selected = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? profiles[0],
    [profiles, selectedProfileId]
  );

  const [personaBio, setPersonaBio] = useState(selected?.personaBio ?? "");
  const [backstory, setBackstory] = useState(selected?.backstory ?? "");
  const [whyExists, setWhyExists] = useState(selected?.whyExists ?? "");
  const [personalityTraits, setPersonalityTraits] = useState(joinList(selected?.personalityTraits ?? []));
  const [favoriteBrands, setFavoriteBrands] = useState("");
  const [clothingPreferences, setClothingPreferences] = useState(joinList(selected?.styleRules ?? []));
  const [travelPreferences, setTravelPreferences] = useState(joinList(selected?.recurringLocations ?? []));
  const [toneRules, setToneRules] = useState(joinList(selected?.toneRules ?? []));
  const [contentPillars, setContentPillars] = useState(joinList(selected?.contentPillars ?? []));
  const [captionStyle, setCaptionStyle] = useState(selected?.captionStyle ?? CAPTION_STYLES[0]);
  const [emojiRules, setEmojiRules] = useState(selected?.emojiRules ?? "Max 2 emojis per caption");

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  if (!selected) {
    return (
      <p className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink/70">
        No avatar profiles yet.
      </p>
    );
  }

  const refreshIdeas = () => {
    const base = selected.vibe.toLowerCase();

    if (base.includes("street")) {
      setFavoriteBrands("Nike, Jordan, New Balance, Aritzia, COS");
      setClothingPreferences("street luxe layers, oversized outerwear, structured sneakers, monochrome sets");
      setTravelPreferences("Tokyo, Berlin, Seoul, Copenhagen");
    } else if (base.includes("travel")) {
      setFavoriteBrands("Uniqlo, Rimowa, Muji, Arket, Adidas Originals");
      setClothingPreferences("travel minimal capsule, wrinkle-safe sets, elevated basics");
      setTravelPreferences("Lisbon, Milan, Barcelona, Amsterdam");
    } else if (base.includes("athletic")) {
      setFavoriteBrands("Lululemon, Nike, Alo, On Running, Gymshark");
      setClothingPreferences("performance sets, fitted technical layers, clean trainers");
      setTravelPreferences("Zurich, Stockholm, London, Dubai");
    } else {
      setFavoriteBrands("COS, & Other Stories, Arket, Massimo Dutti, Zara Studio");
      setClothingPreferences("minimal editorial tailoring, clean knits, neutral palette");
      setTravelPreferences("Paris, Milan, Vienna, Munich");
    }

    setStatus("Persona suggestions refreshed.");
  };

  const savePersona = async () => {
    setLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/avatars/update-persona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: selected.id,
          personaBio,
          backstory,
          whyExists,
          personalityTraits: splitCsv(personalityTraits),
          favoriteBrands: splitCsv(favoriteBrands),
          clothingPreferences: splitCsv(clothingPreferences),
          travelPreferences: splitCsv(travelPreferences),
          toneRules: splitCsv(toneRules),
          contentPillars: splitCsv(contentPillars),
          captionStyle,
          emojiRules
        })
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not save persona.");
      }

      setStatus("Persona saved.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save persona.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Avatar Library</p>
            <h3 className="text-xl font-semibold text-ink">Choose Avatar to Edit</h3>
          </div>
          <button
            type="button"
            className="muted-button"
            onClick={() => {
              window.location.href = "/create";
            }}
          >
            Create New Avatar
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const active = profile.id === selected.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  window.location.href = `/persona?profileId=${profile.id}`;
                }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active ? "border-ink bg-ink text-stone" : "border-ink/10 bg-white text-ink hover:border-ink/35"
                }`}
              >
                <p className="text-base font-semibold">{profile.name ?? "Untitled avatar"}</p>
                <p className={`mt-1 text-sm ${active ? "text-stone/80" : "text-ink/65"}`}>
                  @{profile.handle ?? "no_handle"}
                </p>
                <p className={`mt-3 text-xs uppercase tracking-[0.1em] ${active ? "text-stone/70" : "text-ink/55"}`}>
                  {profile.vibe}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Step 2</p>
            <h3 className="text-xl font-semibold text-ink">Shape Persona and Story</h3>
            <p className="mt-1 text-sm text-ink/65">Define lifestyle narrative, brands, travel behavior, and voice rules.</p>
          </div>
          <button type="button" className="muted-button" onClick={refreshIdeas}>
            Refresh Persona Ideas
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label htmlFor="pe-bio">Persona bio</label>
            <textarea id="pe-bio" rows={3} value={personaBio} onChange={(event) => setPersonaBio(event.target.value)} />
          </div>
          <div>
            <label htmlFor="pe-why">Why this avatar exists</label>
            <textarea id="pe-why" rows={3} value={whyExists} onChange={(event) => setWhyExists(event.target.value)} />
          </div>
          <div>
            <label htmlFor="pe-backstory">Backstory</label>
            <textarea id="pe-backstory" rows={3} value={backstory} onChange={(event) => setBackstory(event.target.value)} />
          </div>

          <div>
            <label htmlFor="pe-traits">Personality traits</label>
            <input
              id="pe-traits"
              value={personalityTraits}
              onChange={(event) => setPersonalityTraits(event.target.value)}
              placeholder="confident, curious, playful"
            />
          </div>
          <div>
            <label htmlFor="pe-brands">Favorite brands</label>
            <input
              id="pe-brands"
              value={favoriteBrands}
              onChange={(event) => setFavoriteBrands(event.target.value)}
              placeholder="Nike, COS, Zara"
            />
          </div>
          <div>
            <label htmlFor="pe-clothes">Clothing preferences</label>
            <input
              id="pe-clothes"
              value={clothingPreferences}
              onChange={(event) => setClothingPreferences(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pe-travel">Travel preferences</label>
            <input
              id="pe-travel"
              value={travelPreferences}
              onChange={(event) => setTravelPreferences(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pe-tone">Tone rules</label>
            <textarea id="pe-tone" rows={3} value={toneRules} onChange={(event) => setToneRules(event.target.value)} />
          </div>
          <div>
            <label htmlFor="pe-pillars">Content pillars</label>
            <textarea
              id="pe-pillars"
              rows={3}
              value={contentPillars}
              onChange={(event) => setContentPillars(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="pe-caption">Caption style</label>
            <select id="pe-caption" value={captionStyle} onChange={(event) => setCaptionStyle(event.target.value)}>
              {CAPTION_STYLES.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pe-emoji">Emoji rule</label>
            <input id="pe-emoji" value={emojiRules} onChange={(event) => setEmojiRules(event.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={savePersona} disabled={loading}>
            {loading ? "Saving..." : "Save Persona"}
          </button>
          <button
            type="button"
            className="muted-button"
            onClick={() => {
              window.location.href = `/studio?profileId=${selected.id}`;
            }}
          >
            Continue to Studio
          </button>
        </div>

        {status ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{status}</p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
      </section>

      <section className="rounded-[28px] border border-ink/10 bg-white/80 p-5 shadow-soft backdrop-blur">
        <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">Smart Presets</p>
        <h3 className="text-xl font-semibold text-ink">Quick Persona Directions</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="muted-button"
              onClick={() => {
                setClothingPreferences(`${preset}, premium textures, cohesive palette`);
                setStatus(`Applied ${preset} style direction.`);
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
