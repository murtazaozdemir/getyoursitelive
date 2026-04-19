"use client";

import { ChevronUp } from "lucide-react";

export function BackToTopButton({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 rounded-full bg-[var(--accent)] p-3 text-[var(--accent-ink)]"
      aria-label="Back to top"
    >
      <ChevronUp />
    </button>
  );
}
