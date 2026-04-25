"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { ServiceIcon } from "@/lib/service-icons";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { ServiceItem } from "@/types/site";

function blankService(): ServiceItem {
  return {
    id: `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "New service",
    priceRange: "$0",
    duration: "30 min",
    description: "",
    features: [],
  };
}

export function ServicesSection({
  serviceTab,
  onServiceTabChange,
}: {
  serviceTab: string;
  onServiceTabChange: (tab: string) => void;
}) {
  const { services } = useBusiness();
  const edit = useEditMode();

  if (services.length === 0 && !edit) return null;

  if (edit && services.length === 0) {
    return (
      <SectionBlock name="Services" visibilityKey="showServices" isEmpty={false}>
        <section id="services" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="section-title mb-6 text-3xl font-bold">
            <SectionH2 titleKey="services" />
          </h2>
          <button
            type="button"
            className="editable-add-btn"
            onClick={() => {
              const first = blankService();
              edit.updateField("services", [first]);
              onServiceTabChange(first.id);
            }}
          >
            + Add first service
          </button>
        </section>
      </SectionBlock>
    );
  }

  const activeService = services.find((s) => s.id === serviceTab) ?? services[0];
  const activeIndex = services.findIndex((s) => s.id === activeService.id);

  function patchService(patch: Partial<ServiceItem>) {
    if (!edit || activeIndex < 0) return;
    const next = [...services];
    next[activeIndex] = { ...next[activeIndex], ...patch };
    edit.updateField("services", next);
  }

  return (
    <SectionBlock name="Services" visibilityKey="showServices" isEmpty={services.length === 0}>
      <section id="services" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="section-title mb-6 text-3xl font-bold">
          <SectionH2 titleKey="services" />
        </h2>
        <div className="grid gap-4 md:grid-cols-[260px_1fr]">
          <div className="flex gap-2 overflow-auto md:flex-col">
            {services.map((item) => {
              const active = serviceTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onServiceTabChange(item.id)}
                  className={`service-pill flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--accent)]/50"}`}
                >
                  <ServiceIcon
                    id={item.id}
                    className={`h-5 w-5 flex-shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                  />
                  <span>{item.name}</span>
                </button>
              );
            })}
            {edit && (
              <button
                type="button"
                className="editable-add-btn"
                onClick={() => {
                  const fresh = blankService();
                  edit.updateField("services", [...services, fresh]);
                  onServiceTabChange(fresh.id);
                }}
              >
                + Add service
              </button>
            )}
          </div>
          <motion.div
            key={activeService.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="content-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="inline-block rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm text-[var(--accent)]">
                  {edit ? (
                    <EditableText
                      value={activeService.priceRange}
                      onCommit={(v) => patchService({ priceRange: v })}
                      placeholder="Price range"
                    />
                  ) : (
                    activeService.priceRange
                  )}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {edit ? (
                    <EditableText
                      value={activeService.name}
                      onCommit={(v) => patchService({ name: v })}
                      placeholder="Service name"
                    />
                  ) : (
                    activeService.name
                  )}
                </h3>
                {edit && (
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Duration:{" "}
                    <EditableText
                      value={activeService.duration}
                      onCommit={(v) => patchService({ duration: v })}
                      placeholder="30 min"
                    />
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-[var(--accent)]/10 p-3">
                <ServiceIcon id={activeService.id} className="h-8 w-8 text-[var(--accent)]" />
              </div>
            </div>
            <p className="mt-2 text-[var(--muted)]">
              {edit ? (
                <EditableText
                  value={activeService.description}
                  onCommit={(v) => patchService({ description: v })}
                  multiline
                  placeholder="What this service includes"
                />
              ) : (
                activeService.description
              )}
            </p>
            <ul className="mt-4 grid gap-2">
              {edit ? (
                <EditableList
                  items={activeService.features}
                  keyOf={(_, i) => `svc-${activeService.id}-f-${i}`}
                  addLabel="Add feature"
                  onAdd={() => patchService({ features: [...activeService.features, "New feature"] })}
                  onRemove={(i) =>
                    patchService({ features: activeService.features.filter((_, idx) => idx !== i) })
                  }
                  onMove={(i, dir) =>
                    patchService({ features: moveInArray(activeService.features, i, dir) })
                  }
                  renderItem={(feature, i) => (
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                      <EditableText
                        value={feature}
                        onCommit={(v) => {
                          const next = [...activeService.features];
                          next[i] = v;
                          patchService({ features: next });
                        }}
                        placeholder="Feature"
                      />
                    </li>
                  )}
                />
              ) : (
                activeService.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                    {feature}
                  </li>
                ))
              )}
            </ul>
            {edit && services.length > 1 && (
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    if (!window.confirm(`Delete "${activeService.name}"?`)) return;
                    const remaining = services.filter((_, idx) => idx !== activeIndex);
                    edit.updateField("services", remaining);
                    if (remaining.length > 0) onServiceTabChange(remaining[0].id);
                  }}
                >
                  Delete this service
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </SectionBlock>
  );
}
