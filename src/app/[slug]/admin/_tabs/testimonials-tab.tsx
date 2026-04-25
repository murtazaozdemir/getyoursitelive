"use client";

import type { Business } from "@/lib/business-types";
import type { Testimonial } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankTestimonial(): Testimonial {
  return { name: "", context: "", quote: "" };
}

export function TestimonialsTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const list = business.testimonials ?? [];

  function patch(i: number, patchObj: Partial<Testimonial>) {
    const next = [...list];
    next[i] = { ...next[i], ...patchObj };
    update("testimonials", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Testimonials</h2>
      <p className="admin-section-lede">
        Customer quotes that appear in the testimonials carousel.
      </p>

      <RepeatableList
        items={list}
        keyOf={(_, i) => `${i}`}
        addLabel="+ Add testimonial"
        emptyText="No testimonials yet."
        onAdd={() => update("testimonials", [...list, blankTestimonial()])}
        onRemove={(i) => update("testimonials", list.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("testimonials", moveInArray(list, i, dir))}
        renderItem={(t, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Customer name</span>
              <input
                className="admin-input"
                value={t.name}
                onChange={(e) => patch(i, { name: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Context</span>
              <input
                className="admin-input"
                placeholder="2018 Honda Civic, Haircut, etc."
                value={t.context}
                onChange={(e) => patch(i, { context: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Quote</span>
              <textarea
                className="admin-input admin-input--textarea"
                rows={3}
                value={t.quote}
                onChange={(e) => patch(i, { quote: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
