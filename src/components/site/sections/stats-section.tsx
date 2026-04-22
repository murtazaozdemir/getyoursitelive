"use client";

import { Car } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";

export function StatsSection({ counters }: { counters: number[] }) {
  const { stats } = useBusiness();
  const edit = useEditMode();

  function patchStat(i: number, patch: Partial<(typeof stats)[number]>) {
    if (!edit) return;
    const next = [...stats];
    next[i] = { ...next[i], ...patch };
    edit.updateField("stats", next);
  }

  return (
    <SectionBlock name="Stats" visibilityKey="showStats" isEmpty={stats.length === 0}>
      <section id="stats" className="section-shell mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-4 md:px-8">
        {edit ? (
          <EditableList
            items={stats}
            keyOf={(_, i) => `stat-${i}`}
            addLabel="Add stat"
            onAdd={() =>
              edit.updateField("stats", [...stats, { label: "New stat", value: 0, suffix: "+" }])
            }
            onRemove={(i) =>
              edit.updateField("stats", stats.filter((_, idx) => idx !== i))
            }
            onMove={(i, dir) => edit.updateField("stats", moveInArray(stats, i, dir))}
            renderItem={(item, i) => (
              <div className="stat-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
                <Car className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
                <p className="text-3xl font-bold">
                  <EditableText
                    value={String(item.value)}
                    onCommit={(v) => {
                      const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
                      if (!Number.isNaN(n)) patchStat(i, { value: n });
                    }}
                    placeholder="0"
                  />
                  <EditableText
                    value={item.suffix}
                    onCommit={(v) => patchStat(i, { suffix: v })}
                    placeholder="+"
                  />
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  <EditableText
                    value={item.label}
                    onCommit={(v) => patchStat(i, { label: v })}
                    placeholder="Stat label"
                  />
                </p>
              </div>
            )}
          />
        ) : (
          stats.map((item, index) => (
            <div
              key={item.label}
              className="stat-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
            >
              <Car className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
              <p className="text-3xl font-bold">
                {(counters[index] ?? 0).toLocaleString()}{item.suffix}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
            </div>
          ))
        )}
      </section>
    </SectionBlock>
  );
}
