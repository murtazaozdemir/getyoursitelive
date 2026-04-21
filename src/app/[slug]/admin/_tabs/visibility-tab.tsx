"use client";

import type { Business, BusinessVisibility } from "@/lib/business-types";

const TOGGLES: Array<{ key: keyof BusinessVisibility; label: string; help: string }> = [
  { key: "showHeroEyebrow", label: "Hero eyebrow", help: "'Family-owned since …' pill above the headline." },
  { key: "showHeroHeadline", label: "Hero headline", help: "The big headline (e.g. 'Expert care for your car.')." },
  { key: "showHeroLead", label: "Hero lead", help: "Sub-headline paragraph under the main headline." },
  { key: "showHeroCtas", label: "Hero CTA buttons", help: "The 'Explore Services' and 'Request Estimate' buttons." },
  { key: "showHeroImage", label: "Hero image", help: "Photo on the right side of the hero." },
  { key: "showHeroCard", label: "Hero why-us card", help: "'Why our customers choose us' card under the hero CTAs." },
  { key: "showAbout", label: "About story", help: "Image + heading + narrative + bullets." },
  { key: "showAboutWhyUs", label: "About why-us cards", help: "Image + four value-prop cards below the story." },
  { key: "showStats", label: "Stats row", help: "Four animated number cards under the hero." },
  { key: "showServices", label: "Services section", help: "Cards listing what you offer." },
  { key: "showDeals", label: "Deals section", help: "Promotional offers." },
  { key: "showPricing", label: "Pricing section", help: "Transparent pricing cards." },
  { key: "showTeam", label: "Team section", help: "Bios of your technicians." },
  { key: "showTestimonials", label: "Testimonials", help: "Customer quote carousel." },
  { key: "showFaq", label: "FAQ section", help: "Accordion of common questions." },
  { key: "showEmergencyBanner", label: "Emergency banner", help: "Accent-colored call-us-24/7 strip." },
  { key: "showBooking", label: "Booking form", help: "Request-service form customers use to book." },
  { key: "showContactInfo", label: "Contact info", help: "Address, phone, email, open-status pill." },
  { key: "showMap", label: "Map", help: "Google Maps embed inside contact info." },
  { key: "showHours", label: "Hours block", help: "Multi-day hours list nested inside contact info." },
];

export function VisibilityTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const v = business.visibility;

  function toggle(key: keyof BusinessVisibility) {
    update("visibility", { ...v, [key]: !v[key] });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Visibility</h2>
      <p className="admin-section-lede">
        Show or hide entire sections of your site. Useful while you&rsquo;re
        still gathering content, or to simplify a site for certain shops.
      </p>

      <ul className="admin-toggle-list">
        {TOGGLES.map(({ key, label, help }) => (
          <li key={key} className="admin-toggle-row">
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={v[key]}
                onChange={() => toggle(key)}
              />
              <span className="admin-toggle-label">{label}</span>
            </label>
            <span className="admin-toggle-help">{help}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
