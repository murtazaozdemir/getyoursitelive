"use client";

import type { Business } from "@/lib/business-types";
import type { HeroContent } from "@/types/site";

export function HeroTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const hero = business.hero;

  function patch<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    update("hero", { ...hero, [key]: value });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Hero</h2>
      <p className="admin-section-lede">
        The first thing visitors see. Headline, sub-headline, CTA buttons, and
        the credibility bullets that sit in the card.
      </p>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Eyebrow</span>
          <input
            className="admin-input"
            value={hero.eyebrowPrefix}
            onChange={(e) => patch("eyebrowPrefix", e.target.value)}
          />
          <span className="admin-field-help">
            Short line shown above the headline. Type whatever you like —
            e.g. &ldquo;Family-owned since 2001&rdquo;, &ldquo;Nice mechanic shop&rdquo;, or leave empty.
          </span>
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Headline</span>
          <input
            className="admin-input"
            value={hero.headline}
            onChange={(e) => patch("headline", e.target.value)}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Lead / sub-headline</span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={2}
            value={hero.lead}
            onChange={(e) => patch("lead", e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Primary CTA label</span>
          <input
            className="admin-input"
            value={hero.primaryCta}
            onChange={(e) => patch("primaryCta", e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Secondary CTA label</span>
          <input
            className="admin-input"
            value={hero.secondaryCta}
            onChange={(e) => patch("secondaryCta", e.target.value)}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Why-us card title</span>
          <input
            className="admin-input"
            value={hero.whyTitle}
            onChange={(e) => patch("whyTitle", e.target.value)}
            placeholder="Why our customers choose us"
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Hero image URL</span>
          <input
            className="admin-input"
            type="url"
            value={hero.heroImage}
            onChange={(e) => patch("heroImage", e.target.value)}
            placeholder="https://…"
          />
          <span className="admin-field-help">
            The photo shown on the right side of the hero. Use the Inline editor to upload a file.
          </span>
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">
            Why-us bullets (one per line)
          </span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={5}
            value={hero.whyBullets.join("\n")}
            onChange={(e) =>
              patch(
                "whyBullets",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
          <span className="admin-field-help">
            Leave empty to hide the credibility card.
          </span>
        </label>
      </div>
    </section>
  );
}
