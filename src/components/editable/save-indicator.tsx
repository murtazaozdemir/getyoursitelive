"use client";

import { useEditMode } from "@/lib/edit-mode-context";
import { Check, Loader2, AlertTriangle } from "lucide-react";

/**
 * Floating corner indicator that shows the save state.
 * Renders nothing when not in edit mode.
 */
export function SaveIndicator() {
  const ctx = useEditMode();
  if (!ctx) return null;
  const { saveState, errorMessage } = ctx;

  if (saveState === "idle") {
    return (
      <div className="save-indicator save-indicator--idle" aria-live="polite">
        <span>Click anything to edit</span>
      </div>
    );
  }

  if (saveState === "saving") {
    return (
      <div className="save-indicator save-indicator--saving" aria-live="polite">
        <Loader2 aria-hidden className="save-indicator-icon save-indicator-icon--spin" />
        <span>Saving&hellip;</span>
      </div>
    );
  }

  if (saveState === "saved") {
    return (
      <div className="save-indicator save-indicator--saved" aria-live="polite">
        <Check aria-hidden className="save-indicator-icon" />
        <span>Saved</span>
      </div>
    );
  }

  return (
    <div className="save-indicator save-indicator--error" role="alert">
      <AlertTriangle aria-hidden className="save-indicator-icon" />
      <span>{errorMessage ?? "Failed to save"}</span>
    </div>
  );
}
