"use client";

import { useState, useTransition } from "react";
import type { StateVisibility } from "@/lib/state-visibility";
import { toggleStateAction } from "./actions";

export function StatesView({ states: initialStates }: { states: StateVisibility[] }) {
  const [states, setStates] = useState(initialStates);
  const [isPending, startTransition] = useTransition();

  const visibleCount = states.filter((s) => s.visible).length;

  function handleToggle(abbr: string, visible: boolean) {
    setStates((prev) =>
      prev.map((s) => (s.state === abbr ? { ...s, visible } : s))
    );
    startTransition(() => {
      toggleStateAction(abbr, visible);
    });
  }

  return (
    <>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 16 }}>
        {visibleCount} of {states.length} states visible in the leads filter dropdown.
      </p>

      <div className="states-grid">
        {states.map((s) => (
          <label key={s.state} className={`state-toggle${s.visible ? " state-toggle--on" : ""}`}>
            <input
              type="checkbox"
              checked={s.visible}
              onChange={(e) => handleToggle(s.state, e.target.checked)}
              disabled={isPending}
            />
            <span className="state-toggle-abbr">{s.state}</span>
            <span className="state-toggle-name">{s.name}</span>
          </label>
        ))}
      </div>
    </>
  );
}
