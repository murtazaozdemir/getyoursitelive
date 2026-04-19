"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ThemeName } from "@/types/site";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "industrial",
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
    }),
    {
      name: "precision-theme",
      onRehydrateStorage: () => (state) => {
        document.documentElement.setAttribute(
          "data-theme",
          state?.theme ?? "industrial",
        );
      },
    },
  ),
);
