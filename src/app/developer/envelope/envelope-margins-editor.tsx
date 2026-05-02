"use client";

import { useState, useTransition } from "react";
import { saveEnvelopeMarginsAction } from "./actions";
import type { EnvelopeMargins } from "@/lib/platform-settings";

interface MarginField {
  key: keyof EnvelopeMargins;
  label: string;
  group: "front" | "back";
  description: string;
}

const FIELDS: MarginField[] = [
  { key: "returnTop", label: "Return Address — Top", group: "front", description: "Distance from top edge to return address" },
  { key: "returnLeft", label: "Return Address — Left", group: "front", description: "Distance from left edge to return address" },
  { key: "postageTop", label: "Stamp Box — Top", group: "front", description: "Distance from top edge to stamp box" },
  { key: "postageRight", label: "Stamp Box — Right", group: "front", description: "Distance from right edge to stamp box" },
  { key: "noticeTop", label: "Notice Box — Top", group: "front", description: "Distance from top edge to notice box" },
  { key: "noticeLeft", label: "Notice Box — Left", group: "front", description: "Distance from left edge to notice box" },
  { key: "recipientTop", label: "Recipient — Top", group: "front", description: "Distance from top edge to recipient address" },
  { key: "recipientLeft", label: "Recipient — Left", group: "front", description: "Distance from left edge to recipient address" },
  { key: "backContentTop", label: "Back Content — Top", group: "back", description: "Distance from top edge to back content" },
  { key: "backContentBottom", label: "Back Content — Bottom", group: "back", description: "Distance from bottom edge to back content" },
  { key: "backContentLeft", label: "Back Content — Left", group: "back", description: "Distance from left edge to back content" },
  { key: "backContentRight", label: "Back Content — Right", group: "back", description: "Distance from right edge to back content" },
];

export function EnvelopeMarginsEditor({
  envelope,
  initial,
  defaults,
}: {
  envelope: "envelope1" | "envelope2";
  initial: EnvelopeMargins;
  defaults: EnvelopeMargins;
}) {
  const [margins, setMargins] = useState<EnvelopeMargins>(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(key: keyof EnvelopeMargins, value: string) {
    setMargins((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveEnvelopeMarginsAction(envelope, margins);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleReset() {
    setMargins(defaults);
    setSaved(false);
  }

  const frontFields = FIELDS.filter((f) => f.group === "front");
  const backFields = FIELDS.filter((f) => f.group === "back");

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center" }}>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save margins"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={handleReset}
        >
          Reset to defaults
        </button>
        {saved && <span style={{ color: "#16a34a", fontSize: 14 }}>Saved</span>}
      </div>

      <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 600 }}>Front Side</h3>
      <div className="envelope-margins-grid">
        {frontFields.map((f) => (
          <div key={f.key} className="envelope-margin-field">
            <label htmlFor={f.key}>
              <span className="envelope-margin-label">{f.label}</span>
              <span className="envelope-margin-desc">{f.description}</span>
            </label>
            <div className="envelope-margin-input-wrap">
              <input
                id={f.key}
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={margins[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="envelope-margin-input"
              />
              <span className="envelope-margin-unit">in</span>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ margin: "24px 0 12px", fontSize: 15, fontWeight: 600 }}>Back Side</h3>
      <div className="envelope-margins-grid">
        {backFields.map((f) => (
          <div key={f.key} className="envelope-margin-field">
            <label htmlFor={f.key}>
              <span className="envelope-margin-label">{f.label}</span>
              <span className="envelope-margin-desc">{f.description}</span>
            </label>
            <div className="envelope-margin-input-wrap">
              <input
                id={f.key}
                type="number"
                step="0.05"
                min="0"
                max="5"
                value={margins[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="envelope-margin-input"
              />
              <span className="envelope-margin-unit">in</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .envelope-margins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }
        .envelope-margin-field {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 14px;
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
        }
        .envelope-margin-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #222;
        }
        .envelope-margin-desc {
          display: block;
          font-size: 11px;
          color: #888;
          margin-top: 2px;
        }
        .envelope-margin-input-wrap {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }
        .envelope-margin-input {
          width: 70px;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
          text-align: right;
        }
        .envelope-margin-unit {
          font-size: 12px;
          color: #888;
        }
      `}</style>
    </div>
  );
}
