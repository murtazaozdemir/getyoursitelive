"use client";

import type { Business } from "@/lib/business-types";
import type { NavLabels, SectionTitles } from "@/types/site";

export function LabelsTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const titles = business.sectionTitles;
  const nav = business.navLabels;

  function patchTitles<K extends keyof SectionTitles>(key: K, value: SectionTitles[K]) {
    update("sectionTitles", { ...titles, [key]: value });
  }

  function patchNav<K extends keyof NavLabels>(key: K, value: NavLabels[K]) {
    update("navLabels", { ...nav, [key]: value });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Labels</h2>
      <p className="admin-section-lede">
        Section headings and navigation labels across the site. These can also
        be edited inline by clicking directly on each heading.
      </p>

      <h3 className="admin-subsection-title">Navigation</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Home</span>
          <input
            className="admin-input"
            value={nav.home}
            onChange={(e) => patchNav("home", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">About</span>
          <input
            className="admin-input"
            value={nav.about}
            onChange={(e) => patchNav("about", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Services</span>
          <input
            className="admin-input"
            value={nav.services}
            onChange={(e) => patchNav("services", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Technicians</span>
          <input
            className="admin-input"
            value={nav.technicians}
            onChange={(e) => patchNav("technicians", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Contact</span>
          <input
            className="admin-input"
            value={nav.contact}
            onChange={(e) => patchNav("contact", e.target.value)}
          />
        </label>
      </div>

      <h3 className="admin-subsection-title">Section headings</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Services section</span>
          <input
            className="admin-input"
            value={titles.services}
            onChange={(e) => patchTitles("services", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Deals eyebrow</span>
          <input
            className="admin-input"
            value={titles.dealsEyebrow}
            onChange={(e) => patchTitles("dealsEyebrow", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Deals heading</span>
          <input
            className="admin-input"
            value={titles.deals}
            onChange={(e) => patchTitles("deals", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Deals sub-heading</span>
          <input
            className="admin-input"
            value={titles.dealsLede}
            onChange={(e) => patchTitles("dealsLede", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Deals CTA button</span>
          <input
            className="admin-input"
            value={titles.dealsCta}
            onChange={(e) => patchTitles("dealsCta", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Pricing section</span>
          <input
            className="admin-input"
            value={titles.pricing}
            onChange={(e) => patchTitles("pricing", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Pricing "popular" badge</span>
          <input
            className="admin-input"
            value={titles.pricingPopular}
            onChange={(e) => patchTitles("pricingPopular", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Pricing "no surprises" label</span>
          <input
            className="admin-input"
            value={titles.pricingRegular}
            onChange={(e) => patchTitles("pricingRegular", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Team section</span>
          <input
            className="admin-input"
            value={titles.team}
            onChange={(e) => patchTitles("team", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Testimonials section</span>
          <input
            className="admin-input"
            value={titles.testimonials}
            onChange={(e) => patchTitles("testimonials", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">FAQ section</span>
          <input
            className="admin-input"
            value={titles.faq}
            onChange={(e) => patchTitles("faq", e.target.value)}
          />
        </label>
      </div>
    </section>
  );
}
