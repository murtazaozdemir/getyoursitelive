"use client";

import { useRef } from "react";
import { Upload, Trash2 } from "lucide-react";
import type { Business } from "@/lib/business-types";
import type { PhotoItem } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankPhoto(): PhotoItem {
  return {
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url: "",
    caption: "",
  };
}

function PhotoUploadField({
  photo,
  slug,
  onPatch,
}: {
  photo: PhotoItem;
  slug: string;
  onPatch: (patch: Partial<PhotoItem>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    form.append("slug", slug);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = (await res.json()) as { url?: string; error?: string };
    if (res.ok && data.url) {
      onPatch({ url: data.url });
    }
  }

  return (
    <div className="admin-photo-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {photo.url ? (
        <div className="admin-photo-preview">
          <img src={photo.url} alt={photo.caption || "Photo"} className="admin-photo-thumb" />
          <div className="admin-photo-actions">
            <button
              type="button"
              className="admin-btn admin-btn--small"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" /> Replace
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--small admin-btn--danger"
              onClick={() => onPatch({ url: "" })}
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="admin-photo-upload-btn"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-5 w-5" />
          <span>Upload photo</span>
        </button>
      )}
    </div>
  );
}

export function PhotosTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const photos = business.photos ?? [];

  function patch(i: number, patchObj: Partial<PhotoItem>) {
    const next = [...photos];
    next[i] = { ...next[i], ...patchObj };
    update("photos", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Photos</h2>
      <p className="admin-section-lede">
        Upload photos of your work, shop, team, or anything you want customers
        to see. Toggle the section on in Visibility once you&rsquo;ve added photos.
      </p>
      <p className="admin-section-lede">
        Each photo must be under <strong>5 MB</strong> (PNG, JPG, or WebP).
        If your photo is too large, open it on your phone and take a screenshot
        &mdash; that creates a smaller copy. On a computer you can use a free
        site like{" "}
        <a href="https://imageresizer.com" target="_blank" rel="noopener noreferrer" className="admin-link">
          imageresizer.com
        </a>{" "}
        to shrink it before uploading.
      </p>

      <RepeatableList
        items={photos}
        keyOf={(p) => p.id}
        addLabel="+ Add photo"
        emptyText="No photos yet."
        onAdd={() => update("photos", [...photos, blankPhoto()])}
        onRemove={(i) => update("photos", photos.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("photos", moveInArray(photos, i, dir))}
        renderItem={(photo, i) => (
          <div className="admin-grid">
            <div className="admin-field admin-field--wide">
              <span className="admin-field-label">Photo</span>
              <PhotoUploadField
                photo={photo}
                slug={business.slug}
                onPatch={(p) => patch(i, p)}
              />
            </div>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Caption (optional)</span>
              <input
                className="admin-input"
                placeholder="e.g. Before & after brake job"
                value={photo.caption}
                onChange={(e) => patch(i, { caption: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
