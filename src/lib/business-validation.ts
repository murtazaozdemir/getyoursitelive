import type { Business } from "@/lib/business-types";

/**
 * Business data validation. Lightweight checks before save.
 * Not server-only — also used client-side for inline form validation.
 */

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const VALID_THEMES = ["industrial", "modern", "luxury", "friendly"] as const;

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateBusiness(b: Business): ValidationResult {
  if (!b.slug || !SLUG_PATTERN.test(b.slug)) {
    return {
      ok: false,
      error:
        "Slug must be lowercase letters, numbers, and hyphens (1-64 chars, no leading/trailing hyphen).",
    };
  }
  if (!VALID_THEMES.includes(b.theme as (typeof VALID_THEMES)[number])) {
    return { ok: false, error: `Theme must be one of: ${VALID_THEMES.join(", ")}` };
  }
  if (!b.businessInfo?.name?.trim()) {
    return { ok: false, error: "Business name is required." };
  }
  if (!b.businessInfo?.address?.trim()) {
    return { ok: false, error: "Address is required." };
  }
  if (!b.businessInfo?.phone?.trim()) {
    return { ok: false, error: "Phone is required." };
  }

  // Hours: each day must be either null or {open, close} with valid HH:MM
  const days: Array<keyof typeof b.hoursSchedule> = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ];
  for (const d of days) {
    const v = b.hoursSchedule?.[d];
    if (v !== null && v !== undefined) {
      if (!isHHMM(v.open) || !isHHMM(v.close)) {
        return { ok: false, error: `Hours for ${d} must be valid HH:MM times (or closed).` };
      }
    }
  }

  // Service IDs must be unique within the array
  const serviceIds = (b.services ?? []).map((s) => s.id);
  if (new Set(serviceIds).size !== serviceIds.length) {
    return { ok: false, error: "Service IDs must be unique." };
  }

  // Deal IDs must be unique
  const dealIds = (b.deals ?? []).map((d) => d.id);
  if (new Set(dealIds).size !== dealIds.length) {
    return { ok: false, error: "Deal IDs must be unique." };
  }

  // Pricing IDs must be unique
  const pricingIds = (b.pricing ?? []).map((p) => p.id);
  if (new Set(pricingIds).size !== pricingIds.length) {
    return { ok: false, error: "Pricing card IDs must be unique." };
  }

  // FAQ IDs must be unique
  const faqIds = (b.faqs ?? []).map((f) => f.id);
  if (new Set(faqIds).size !== faqIds.length) {
    return { ok: false, error: "FAQ IDs must be unique." };
  }

  return { ok: true };
}

function isHHMM(s: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}
