"use client";

import type { Business } from "@/lib/business-types";
import type { AboutContent } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

export function AboutTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const about = business.about;

  function patch<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    update("about", { ...about, [key]: value });
  }

  const cards = about.whyUsCards;

  function patchCard(i: number, p: Partial<{ title: string; description: string }>) {
    const next = [...cards];
    next[i] = { ...next[i], ...p };
    patch("whyUsCards", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">About</h2>
      <p className="admin-section-lede">
        Who you are, what you do differently. Two side-by-side blocks: a
        narrative paragraph and a grid of value cards.
      </p>

      <div className="admin-grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Heading</span>
          <input
            className="admin-input"
            value={about.heading}
            onChange={(e) => patch("heading", e.target.value)}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Narrative paragraph</span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={4}
            value={about.narrative}
            onChange={(e) => patch("narrative", e.target.value)}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Numbered bullets (one per line)</span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={4}
            value={about.bullets.join("\n")}
            onChange={(e) =>
              patch(
                "bullets",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
          <span className="admin-field-help">
            Auto-numbered &ldquo;1., 2., 3.&rdquo; in the rendered list.
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Primary image URL</span>
          <input
            className="admin-input"
            type="url"
            value={about.primaryImage}
            onChange={(e) => patch("primaryImage", e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Secondary image URL</span>
          <input
            className="admin-input"
            type="url"
            value={about.secondaryImage}
            onChange={(e) => patch("secondaryImage", e.target.value)}
          />
        </label>
      </div>

      <h3 className="admin-subsection-title">Why-us cards</h3>
      <RepeatableList
        items={cards}
        keyOf={(_, i) => `${i}`}
        addLabel="+ Add card"
        emptyText="No cards yet."
        onAdd={() => patch("whyUsCards", [...cards, { title: "", description: "" }])}
        onRemove={(i) => patch("whyUsCards", cards.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => patch("whyUsCards", moveInArray(cards, i, dir))}
        renderItem={(card, i) => (
          <div className="admin-grid">
            <label className="admin-field">
              <span className="admin-field-label">Title</span>
              <input
                className="admin-input"
                value={card.title}
                onChange={(e) => patchCard(i, { title: e.target.value })}
              />
            </label>
            <label className="admin-field">
              <span className="admin-field-label">Description</span>
              <input
                className="admin-input"
                value={card.description}
                onChange={(e) => patchCard(i, { description: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
