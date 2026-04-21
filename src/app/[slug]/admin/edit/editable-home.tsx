"use client";

import type { ReactNode } from "react";
import type { Business } from "@/lib/business-types";
import { BusinessProvider } from "@/lib/business-context";
import { EditModeProvider, useEditMode } from "@/lib/edit-mode-context";
import { HomePage } from "@/components/site/home-page";
import { SaveIndicator } from "@/components/editable/save-indicator";

/**
 * Wraps the public HomePage in EditMode context + BusinessProvider.
 *
 * The flow:
 *   EditModeProvider holds the live business state (every edit mutates it).
 *   BusinessBridge reads that live state and feeds it into BusinessProvider
 *   so every existing `useBusiness()` call gets the LIVE edited object, not
 *   the server snapshot — no extra wiring needed in the home components.
 *
 * Any component that wants to show edit affordances (pencils, +Add buttons)
 * calls useEditMode() in addition to useBusiness().
 */
export function EditableHome({ business }: { business: Business }) {
  return (
    <div className="edit-mode" data-theme={business.theme}>
      <EditModeProvider business={business}>
        <BusinessBridge>
          <HomePage />
        </BusinessBridge>
        <SaveIndicator />
      </EditModeProvider>
    </div>
  );
}

function BusinessBridge({ children }: { children: ReactNode }) {
  const ctx = useEditMode();
  if (!ctx) return <>{children}</>;
  return <BusinessProvider business={ctx.business}>{children}</BusinessProvider>;
}
