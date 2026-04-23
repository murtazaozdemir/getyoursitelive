"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBusinessAction } from "@/app/admin/actions";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";

const THEMES: ThemeName[] = ["industrial", "modern", "luxury", "friendly"];

function blankBusiness(slug: string, name: string, theme: ThemeName): Business {
  return {
    slug,
    category: "Auto Repair",
    theme,
    businessInfo: {
      name,
      tagline: "",
      founded: new Date().getFullYear(),
      phone: "",
      email: "",
      address: "",
      hours: "Mon-Fri: 8am-6pm",
      emergencyPhone: "",
      logoUrl: "",
      social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
    },
    hoursSchedule: {
      mon: { open: "08:00", close: "18:00" },
      tue: { open: "08:00", close: "18:00" },
      wed: { open: "08:00", close: "18:00" },
      thu: { open: "08:00", close: "18:00" },
      fri: { open: "08:00", close: "18:00" },
      sat: null,
      sun: null,
    },
    hero: {
      eyebrowPrefix: "Family-owned since",
      headline: "Expert care for your vehicle.",
      lead: "Same-day service, clear communication, and repairs performed by ASE-certified technicians.",
      primaryCta: "Explore Services",
      secondaryCta: "Request Estimate",
      whyTitle: "Why our customers choose us",
      heroImage: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyBullets: [
        "Photo-backed diagnostics before any repair.",
        "Same-day turnaround on most repairs.",
        "24-month / 24,000-mile warranty on parts and labor.",
        "Friendly advisors who explain options in plain language.",
      ],
    },
    about: {
      heading: `${name} - Where Expertise Meets Honesty`,
      narrative: "Add a short paragraph about your shop — who you are, where you're based, what you stand for.",
      bullets: [
        "Free digital inspections with photos and videos",
        "Written warranties on parts and labor",
        "No surprise pricing before work begins",
      ],
      primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
      secondaryImage: "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyUsCards: [
        { title: "Honest Diagnostics", description: "We show photos of every issue before recommending repairs." },
        { title: "Same-Day Service", description: "Most repairs are completed in 24 hours." },
        { title: "Digital Updates", description: "Text and email progress reports from check-in to pickup." },
        { title: "2-Year Warranty", description: "24,000-mile parts and labor protection included." },
      ],
    },
    stats: [
      { label: "Years Experience", value: 15, suffix: "+" },
      { label: "Happy Clients", value: 1000, suffix: "+" },
      { label: "Services Done", value: 5000, suffix: "+" },
      { label: "Expert Technicians", value: 3, suffix: "+" },
    ],
    services: [],
    deals: [],
    pricing: [],
    teamMembers: [],
    testimonials: [],
    faqs: [],
    emergency: {
      heading: "Car Won't Start? We're Here 24/7.",
      description: "Emergency towing, after-hours repairs, and loaner car options available.",
      ctaLabel: "Call Emergency Line",
    },
    contact: {
      heading: "Request Service",
      description: "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.",
      bookButtonLabel: "Book Service",
      extraServiceOptions: ["General Inspection", "Other"],
    },
    footer: {
      locationLabel: "Location",
      phoneLabel: "Phone",
      copyrightSuffix: "All rights reserved.",
    },
    sectionTitles: {
      services: "Our Services",
      dealsEyebrow: "Current Specials",
      deals: "Deals this month",
      dealsLede: "Limited-time offers. Mention this page when you book.",
      pricing: "Transparent Pricing",
      team: "Meet Our Technicians",
      testimonials: "What Customers Say",
      faq: "Frequently Asked Questions",
      dealsCta: "Claim this offer",
      pricingPopular: "Popular",
      pricingRegular: "No surprises",
    },
    navLabels: {
      home: "Home",
      about: "About",
      services: "Services",
      technicians: "Technicians",
      contact: "Contact",
    },
    visibility: {
      showHeroEyebrow: true,
      showHeroCtas: true,
      showHeroHeadline: true,
      showHeroLead: true,
      showHeroImage: true,
      showHeroCard: true,
      showAbout: true,
      showAboutWhyUs: true,
      showStats: true,
      showServices: true,
      showDeals: false,
      showPricing: false,
      showTeam: true,
      showTestimonials: true,
      showFaq: false,
      showEmergencyBanner: false,
      showBooking: true,
      showContactInfo: true,
      showMap: true,
      showHours: true,
    },
  };
}

export function NewBusinessForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<ThemeName>("modern");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const res = await createBusinessAction(blankBusiness(slug, name, theme));
      if (res.ok) {
        router.push(`/${res.slug}/admin`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit} noValidate>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Business name</span>
          <input
            className="admin-input"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">URL slug</span>
          <input
            className="admin-input"
            value={slug}
            required
            placeholder="joes-garage"
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            disabled={isPending}
          />
          <span className="admin-field-help">
            Site will live at /{slug || "your-slug"}
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Theme</span>
          <select
            className="admin-input"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeName)}
            disabled={isPending}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="admin-auth-error" role="alert">{error}</div>}

      <div className="admin-editor-toolbar">
        <div />
        <div className="admin-editor-toolbar-right">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending || !slug || !name}>
            {isPending ? "Creating\u2026" : "Create business"}
          </button>
        </div>
      </div>
    </form>
  );
}
