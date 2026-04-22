"use client";

import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { PricingCard } from "@/types/site";

function blankPricing(): PricingCard {
  return {
    id: `price-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "New service",
    price: "$0",
    note: "",
    popular: false,
  };
}

export function PricingSection() {
  const { pricing, sectionTitles } = useBusiness();
  const edit = useEditMode();

  function patchCard(i: number, patch: Partial<PricingCard>) {
    if (!edit) return;
    const next = [...pricing];
    next[i] = { ...next[i], ...patch };
    edit.updateField("pricing", next);
  }

  return (
    <SectionBlock name="Pricing" visibilityKey="showPricing" isEmpty={pricing.length === 0}>
      <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="section-title mb-6 text-3xl font-bold">
          <SectionH2 titleKey="pricing" />
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {edit ? (
            <EditableList
              items={pricing}
              keyOf={(c) => c.id}
              addLabel="Add pricing card"
              onAdd={() => edit.updateField("pricing", [...pricing, blankPricing()])}
              onRemove={(i) =>
                edit.updateField("pricing", pricing.filter((_, idx) => idx !== i))
              }
              onMove={(i, dir) => edit.updateField("pricing", moveInArray(pricing, i, dir))}
              renderItem={(card, i) => (
                <div
                  className={`pricing-card rounded-2xl border p-6 ${card.popular ? "border-[var(--accent)] shadow-lg card-popular" : "border-[var(--border)]"}`}
                >
                  <p className="text-sm text-[var(--muted)]">
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <input
                        type="checkbox"
                        checked={card.popular}
                        onChange={(e) => patchCard(i, { popular: e.target.checked })}
                      />
                      {card.popular ? sectionTitles.pricingPopular : "Mark as popular"}
                    </label>
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    <EditableText
                      value={card.name}
                      onCommit={(v) => patchCard(i, { name: v })}
                      placeholder="Service name"
                    />
                  </h3>
                  <p className="mt-4 text-4xl font-bold">
                    <EditableText
                      value={card.price}
                      onCommit={(v) => patchCard(i, { price: v })}
                      placeholder="$0"
                    />
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    <EditableText
                      value={card.note}
                      onCommit={(v) => patchCard(i, { note: v })}
                      multiline
                      placeholder="Short note"
                    />
                  </p>
                </div>
              )}
            />
          ) : (
            pricing.map((card) => (
              <div
                key={card.id}
                className={`pricing-card rounded-2xl border p-6 ${card.popular ? "border-[var(--accent)] shadow-lg card-popular" : "border-[var(--border)]"}`}
              >
                <p className="pricing-kicker text-sm text-[var(--muted)]">
                  {card.popular ? sectionTitles.pricingPopular : sectionTitles.pricingRegular}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{card.name}</h3>
                <p className="pricing-price mt-4 text-4xl font-bold">{card.price}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{card.note}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </SectionBlock>
  );
}
