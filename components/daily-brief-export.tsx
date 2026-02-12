"use client";

import { useEffect, useMemo, useState } from "react";
import type { DailyBriefPayload } from "@/lib/types";

function toText(payload: DailyBriefPayload): string {
  return [
    `Date: ${payload.dateKey}`,
    `Mission: ${payload.mission}`,
    `Format: ${payload.format}`,
    `Concept: ${payload.concept}`,
    "",
    "Shot list:",
    ...payload.shotList.map((shot, index) => `${index + 1}. ${shot}`),
    "",
    `Caption: ${payload.caption}`,
    `Hashtags: ${payload.hashtags.join(" ")}`,
    "",
    "Prompt JSON:",
    JSON.stringify(payload.promptJson, null, 2)
  ].join("\n");
}

export function DailyBriefExport({ payload }: { payload: DailyBriefPayload }) {
  const [copied, setCopied] = useState(false);

  const jsonBlob = useMemo(
    () =>
      URL.createObjectURL(
        new Blob([JSON.stringify(payload, null, 2)], {
          type: "application/json"
        })
      ),
    [payload]
  );

  const textBlob = useMemo(
    () =>
      URL.createObjectURL(
        new Blob([toText(payload)], {
          type: "text/plain"
        })
      ),
    [payload]
  );

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(jsonBlob);
      URL.revokeObjectURL(textBlob);
    };
  }, [jsonBlob, textBlob]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(toText(payload));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" className="muted-button" onClick={handleCopy}>
        {copied ? "Copied" : "Copy Brief"}
      </button>
      <a
        href={jsonBlob}
        download={`daily-brief-${payload.dateKey}.json`}
        className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm text-ink"
      >
        Download JSON
      </a>
      <a
        href={textBlob}
        download={`daily-brief-${payload.dateKey}.txt`}
        className="rounded-xl border border-ink/15 bg-white px-4 py-2 text-sm text-ink"
      >
        Download Text
      </a>
    </div>
  );
}
