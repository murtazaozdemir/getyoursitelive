"use client";

import type { Business } from "@/lib/business-types";
import type { PricingCard } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankCard(): PricingCard {
  return {
    id: `price-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    price: "",
    note: "",
    popular: false,
  };
}

export function PricingTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const pricing = business.pricing ?? [];

  function patch(i: number, p: Partial<PricingCard>) {
    const next = [...pricing];
    next[i] = { ...next[i], ...p };
    update("pricing", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Pricing</h2>
      <p className="admin-section-lede">
        Transparent pricing cards. Mark one card as &ldquo;popular&rdquo; to
        give it accent styling.
      </p>

      <RepeatableList
        items={pricing}
        keyOf={(c) => c.id}
        addLabel="+ Add pricing card"
        emptyText="No pricing cards yet."
        onAdd={() => update("pricing", [...pricing, blankCard()])}
        onRemove={(i) => update("pricing", pricing.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("pricing", moveInArray(pricing, i, dir))}
        renderItem={(card, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Name</span>
              <input
                className="admin-input"
                placeholder="Oil Change"
                value={card.name}
                onChange={(e) => patch(i, { name: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Price</span>
              <input
                className="admin-input"
                placeholder="$49"
                value={card.price}
                onChange={(e) => patch(i, { price: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Note / description</span>
              <input
                className="admin-input"
                placeholder="Synthetic blend + 27-point inspection"
                value={card.note}
                onChange={(e) => patch(i, { note: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Popular?</span>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={card.popular}
                  onChange={(e) => patch(i, { popular: e.target.checked })}
                />
                <span className="admin-toggle-label">Highlight as popular</span>
              </label>
            </label>
          </div>
        )}
      />
    </section>
  );
}
