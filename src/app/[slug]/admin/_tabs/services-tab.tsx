"use client";

import type { Business } from "@/lib/business-types";
import type { ServiceItem } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankService(): ServiceItem {
  return {
    id: `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    priceRange: "",
    duration: "",
    description: "",
    features: [],
  };
}

export function ServicesTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const services = business.services ?? [];

  function patch(i: number, patchObj: Partial<ServiceItem>) {
    const next = [...services];
    next[i] = { ...next[i], ...patchObj };
    update("services", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Services</h2>
      <p className="admin-section-lede">
        What you offer customers. Each card appears in the Services section.
      </p>

      <RepeatableList
        items={services}
        keyOf={(s) => s.id}
        addLabel="+ Add service"
        emptyText="No services yet."
        onAdd={() => update("services", [...services, blankService()])}
        onRemove={(i) => update("services", services.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("services", moveInArray(services, i, dir))}
        renderItem={(svc, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Service name</span>
              <input
                className="admin-input"
                value={svc.name}
                onChange={(e) => patch(i, { name: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">ID (unique slug)</span>
              <input
                className="admin-input"
                value={svc.id}
                onChange={(e) => patch(i, { id: e.target.value })}
              />
              <span className="admin-field-help">Used to map to the icon.</span>
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Price range</span>
              <input
                className="admin-input"
                placeholder="$45 - $80"
                value={svc.priceRange}
                onChange={(e) => patch(i, { priceRange: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Duration</span>
              <input
                className="admin-input"
                placeholder="30-60 min"
                value={svc.duration}
                onChange={(e) => patch(i, { duration: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Description</span>
              <textarea
                className="admin-input admin-input--textarea"
                rows={2}
                value={svc.description}
                onChange={(e) => patch(i, { description: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Features (one per line)</span>
              <textarea
                className="admin-input admin-input--textarea"
                rows={3}
                value={svc.features.join("\n")}
                onChange={(e) =>
                  patch(i, { features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })
                }
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
