"use client";

import { useState } from "react";
import { backfillDroppedOffAction } from "./actions";

export function BackfillButton() {
  const [result, setResult] = useState<{ updated: number; slugs: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await backfillDroppedOffAction();
      setResult(res);
    } catch (err) {
      alert("Error: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="admin-banner admin-banner--success" style={{ marginBottom: 12 }}>
        Backfill done: {result.updated} lead{result.updated !== 1 ? "s" : ""} moved to Contacted.
        {result.slugs.length > 0 && (
          <span style={{ fontSize: 12, marginLeft: 8 }}>({result.slugs.join(", ")})</span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="admin-btn admin-btn--ghost"
      style={{ fontSize: 12 }}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? "Running..." : "Backfill: mark dropped-off tasks as Contacted"}
    </button>
  );
}
