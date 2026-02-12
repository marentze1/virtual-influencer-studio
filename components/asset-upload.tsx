"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type UploadState = {
  status: "idle" | "loading" | "done" | "error";
  message?: string;
};

export function AssetUpload() {
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({ status: "loading", message: "Uploading..." });

    const response = await fetch("/api/assets/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      setState({ status: "error", message: "Upload failed" });
      return;
    }

    setState({ status: "done", message: "Asset uploaded" });
    form.reset();
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="file">Image file</label>
        <input id="file" name="file" type="file" required accept="image/*" />
      </div>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" placeholder="Rooftop look set" />
      </div>
      <div>
        <label htmlFor="tags">Tags</label>
        <input id="tags" name="tags" placeholder="outfit, rooftop, sunset" />
      </div>
      <div>
        <label htmlFor="pillar">Pillar</label>
        <input id="pillar" name="pillar" placeholder="Street fashion" />
      </div>
      <div>
        <label htmlFor="location">Location</label>
        <input id="location" name="location" placeholder="Berlin Mitte" />
      </div>
      <div>
        <label htmlFor="outfit">Outfit</label>
        <input id="outfit" name="outfit" placeholder="Beige coat + black boots" />
      </div>
      <div>
        <label htmlFor="assetDate">Asset date</label>
        <input id="assetDate" name="assetDate" type="date" />
      </div>
      <div className="md:col-span-2 flex items-center gap-3">
        <button type="submit">Upload to Library</button>
        {state.message ? <p className="text-sm text-ink/65">{state.message}</p> : null}
      </div>
    </form>
  );
}
