"use client";

import type { Business } from "@/lib/business-types";
import type { StatItem } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankStat(): StatItem {
  return { label: "", value: 0, suffix: "" };
}

export function StatsTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const stats = business.stats ?? [];

  function patch(i: number, p: Partial<StatItem>) {
    const next = [...stats];
    next[i] = { ...next[i], ...p };
    update("stats", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Stats</h2>
      <p className="admin-section-lede">
        The numeric proof row that sits below the hero. Values animate up
        from zero when they scroll into view.
      </p>

      <RepeatableList
        items={stats}
        keyOf={(_, i) => `${i}`}
        addLabel="+ Add stat"
        emptyText="No stats yet."
        onAdd={() => update("stats", [...stats, blankStat()])}
        onRemove={(i) => update("stats", stats.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("stats", moveInArray(stats, i, dir))}
        renderItem={(stat, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Label</span>
              <input
                className="admin-input"
                placeholder="Years Experience"
                value={stat.label}
                onChange={(e) => patch(i, { label: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Value (number)</span>
              <input
                className="admin-input"
                type="number"
                min={0}
                value={stat.value}
                onChange={(e) => patch(i, { value: Number(e.target.value) })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Suffix</span>
              <input
                className="admin-input"
                placeholder="+"
                value={stat.suffix}
                onChange={(e) => patch(i, { suffix: e.target.value })}
              />
              <span className="admin-field-help">e.g. &ldquo;+&rdquo;, &ldquo;%&rdquo;, &ldquo;k&rdquo;.</span>
            </label>
          </div>
        )}
      />
    </section>
  );
}
