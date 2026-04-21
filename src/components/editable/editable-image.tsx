"use client";

import { useRef, useState, type ReactNode } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { useBusiness } from "@/lib/business-context";

/**
 * Click-to-upload image. Renders children (the current image or a fallback)
 * and, in edit mode, overlays an "Upload" button on hover plus a "Remove"
 * button when an image is set.
 *
 * On successful upload the returned URL is committed via onCommit.
 */
export function EditableImage({
  value,
  onCommit,
  children,
  uploadLabel = "Upload image",
  removeLabel = "Remove image",
  className = "",
}: {
  /** Current image URL (may be empty). */
  value: string;
  /** Called with the uploaded URL (or "" when removed). */
  onCommit: (url: string) => void;
  /** What to render when idle (usually the current image or a placeholder). */
  children: ReactNode;
  uploadLabel?: string;
  removeLabel?: string;
  className?: string;
}) {
  const { slug } = useBusiness();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("slug", slug);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Upload failed");
      }
      onCommit(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // Reset so the same file can be re-picked
    e.target.value = "";
  }

  return (
    <span className={`editable-image ${className}`}>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="editable-image-file-input"
        onChange={onPick}
      />
      <span className="editable-image-controls">
        <button
          type="button"
          className="editable-image-btn"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          aria-label={uploadLabel}
          title={uploadLabel}
        >
          {busy ? (
            <Loader2 className="editable-image-icon editable-image-icon--spin" aria-hidden />
          ) : (
            <Upload className="editable-image-icon" aria-hidden />
          )}
          <span className="editable-image-btn-label">{uploadLabel}</span>
        </button>
        {value && !busy && (
          <button
            type="button"
            className="editable-image-btn editable-image-btn--danger"
            onClick={() => onCommit("")}
            aria-label={removeLabel}
            title={removeLabel}
          >
            <Trash2 className="editable-image-icon" aria-hidden />
          </button>
        )}
      </span>
      {error && <span className="editable-image-error" role="alert">{error}</span>}
    </span>
  );
}
