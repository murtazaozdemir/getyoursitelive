"use client";

import { create } from "zustand";
import { ThemeName } from "@/types/site";

/**
 * Per-business theme state.
 *
 * Intentionally NOT persisted — each business page initialises the
 * theme from its own DB row (via the `theme` field). This way a visitor
 * hitting different business pages will see each site in its intended
 * look without stale localStorage overriding the shop's branding.
 *
 * The user can still switch themes via the header dropdown within a
 * session; that change is scoped to the open tab only.
 */
interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
  theme: "modern",
  setTheme: (theme) => set({ theme }),
}));
