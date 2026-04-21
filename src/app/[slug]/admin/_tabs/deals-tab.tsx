"use client";

import type { Business } from "@/lib/business-types";
import type { DealItem } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankDeal(): DealItem {
  return {
    id: `deal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    description: "",
    price: "",
  };
}

export function DealsTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const deals = business.deals ?? [];

  function patch(i: number, patchObj: Partial<DealItem>) {
    const next = [...deals];
    next[i] = { ...next[i], ...patchObj };
    update("deals", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Deals &amp; promotions</h2>
      <p className="admin-section-lede">
        Limited-time offers that show up in the Deals section. Leave empty to
        hide the whole section (or toggle it off in Visibility).
      </p>

      <RepeatableList
        items={deals}
        keyOf={(d) => d.id}
        addLabel="+ Add deal"
        emptyText="No deals yet."
        onAdd={() => update("deals", [...deals, blankDeal()])}
        onRemove={(i) => update("deals", deals.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("deals", moveInArray(deals, i, dir))}
        renderItem={(deal, i) => (
          <div className="admin-grid">
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Title</span>
              <input
                className="admin-input"
                value={deal.title}
                onChange={(e) => patch(i, { title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Price</span>
              <input
                className="admin-input"
                placeholder="$39"
                value={deal.price}
                onChange={(e) => patch(i, { price: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Original price (optional)</span>
              <input
                className="admin-input"
                placeholder="$69"
                value={deal.originalPrice ?? ""}
                onChange={(e) =>
                  patch(i, { originalPrice: e.target.value || undefined })
                }
              />
              <span className="admin-field-help">Rendered as strikethrough.</span>
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Badge (optional)</span>
              <input
                className="admin-input"
                placeholder="Limited time"
                value={deal.badge ?? ""}
                onChange={(e) => patch(i, { badge: e.target.value || undefined })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Description</span>
              <textarea
                className="admin-input admin-input--textarea"
                rows={2}
                value={deal.description}
                onChange={(e) => patch(i, { description: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
