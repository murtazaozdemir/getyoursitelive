import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getBusinessBySlug, saveBusiness } from "@/lib/db";
import { createProspect, getProspect, findProspectByPhone, normalizePhone, updateProspectGoogleData } from "@/lib/prospects";
import { logAudit } from "@/lib/audit-log";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import { revalidatePath } from "next/cache";

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prospectBusiness(
  slug: string,
  name: string,
  phone: string,
  address: string,
): Business {
  const theme: ThemeName = "modern";
  const founded = new Date().getFullYear() - 11;

  return {
    slug,
    category: "Car repair and maintenance service",
    theme,
    businessInfo: {
      name,
      tagline: "Honest repairs. Real technicians. No surprises.",
      founded,
      phone,
      email: "",
      address,
      hours: "Mon-Fri: 8am-6pm, Sat: 8am-2pm",
      emergencyPhone: phone,
      logoUrl: "",
      social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
    },
    hoursSchedule: {
      mon: { open: "08:00", close: "18:00" },
      tue: { open: "08:00", close: "18:00" },
      wed: { open: "08:00", close: "18:00" },
      thu: { open: "08:00", close: "18:00" },
      fri: { open: "08:00", close: "18:00" },
      sat: { open: "08:00", close: "14:00" },
      sun: null,
    },
    hero: {
      eyebrowPrefix: `Serving the community since ${founded}`,
      headline: "Quality Service You Can Trust.",
      lead: "Experienced professionals. Fair pricing. No surprises.",
      primaryCta: "See Our Services",
      secondaryCta: "Request an Estimate",
      whyTitle: "Why customers keep coming back",
      heroImage:
        "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyBullets: [
        "Honest, upfront pricing.",
        "Fast turnaround on most jobs.",
        "Quality parts and materials.",
        "Friendly, professional service.",
      ],
    },
    about: {
      heading: "Where Expertise Meets Honesty",
      narrative: `${name} has been serving the local community.`,
      bullets: [
        "Quality work at fair prices",
        "Written estimates before any work begins",
        "No surprise pricing",
      ],
      primaryImage:
        "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
      secondaryImage:
        "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyUsCards: [
        { title: "Quality Work", description: "We take pride in every job." },
        { title: "Fair Pricing", description: "Competitive rates with no hidden fees." },
        { title: "Fast Service", description: "Quick turnaround without cutting corners." },
        { title: "Satisfaction Guaranteed", description: "We stand behind our work." },
      ],
    },
    stats: [
      { label: "Years in Business", value: 11, suffix: "+" },
      { label: "Satisfied Customers", value: 500, suffix: "+" },
      { label: "Jobs Completed", value: 2000, suffix: "+" },
      { label: "Team Members", value: 3, suffix: "" },
    ],
    services: [],
    deals: [],
    pricing: [],
    teamMembers: [],
    testimonials: [],
    faqs: [],
    emergency: {
      heading: "Need Help? We're Here for You.",
      description: "Contact us for assistance.",
      ctaLabel: "Call Us Now",
    },
    contact: {
      heading: "Get in Touch",
      description: "Tell us what you need.",
      bookButtonLabel: "Contact Us",
      extraServiceOptions: ["General Inquiry", "Other"],
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
      dealsLede: "Limited-time offers.",
      pricing: "Transparent Pricing",
      team: "Meet Our Team",
      testimonials: "What Customers Say",
      faq: "Common Questions",
      dealsCta: "Claim this offer",
      pricingPopular: "Most Popular",
      pricingRegular: "No surprises",
    },
    navLabels: {
      home: "Home",
      about: "About",
      services: "Services",
      technicians: "Team",
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
      showServices: false,
      showDeals: false,
      showPricing: false,
      showTeam: false,
      showTestimonials: false,
      showFaq: false,
      showEmergencyBanner: false,
      showBooking: true,
      showContactInfo: true,
      showMap: true,
      showHours: true,
    },
  };
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const street = (formData.get("street") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const state = (formData.get("state") as string)?.trim() ?? "";
  const zipCode = (formData.get("zip") as string)?.trim() ?? "";

  // Google Places data
  const googlePlaceId = (formData.get("googlePlaceId") as string)?.trim() ?? "";
  const googleRating = formData.get("googleRating") ? parseFloat(formData.get("googleRating") as string) : null;
  const googleReviewCount = formData.get("googleReviewCount") ? parseInt(formData.get("googleReviewCount") as string, 10) : 0;
  const googleCategory = (formData.get("googleCategory") as string)?.trim() ?? "";
  const googleMapsUrl = (formData.get("googleMapsUrl") as string)?.trim() ?? "";
  const website = (formData.get("website") as string)?.trim() ?? "";
  const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
  const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." });
  }

  const slug = nameToSlug(name);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Could not generate slug." });
  }

  const googleData = {
    state: state || undefined,
    website: website || undefined,
    googlePlaceId: googlePlaceId || undefined,
    googleRating,
    googleReviewCount,
    googleCategory: googleCategory || undefined,
    googleMapsUrl: googleMapsUrl || undefined,
    lat,
    lng,
  };

  // Check for existing by slug
  const [existingBiz, existingProspect] = await Promise.all([
    getBusinessBySlug(slug),
    getProspect(slug),
  ]);

  if (existingBiz || existingProspect) {
    // Update existing prospect with Google data
    const targetSlug = existingProspect?.slug ?? slug;
    try {
      await updateProspectGoogleData(targetSlug, googleData);
    } catch { /* ignore if columns don't exist yet */ }
    return NextResponse.json({ ok: true, updated: true, slug: targetSlug });
  }

  // Check duplicate phone
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch) {
      // Update existing prospect with Google data
      try {
        await updateProspectGoogleData(phoneMatch.slug, googleData);
      } catch { /* ignore if columns don't exist yet */ }
      return NextResponse.json({ ok: true, updated: true, slug: phoneMatch.slug });
    }
  }

  const addressParts = [street, city, state && zipCode ? `${state} ${zipCode}` : state || zipCode].filter(Boolean);
  const address = addressParts.join(", ");

  const business = prospectBusiness(slug, name, phone, address);
  await saveBusiness(business);

  const now = new Date().toISOString();
  try {
    await createProspect({
      slug,
      name,
      phone,
      address,
      state: state || undefined,
      status: "found",
      notes: [],
      website: googleData.website,
      googlePlaceId: googleData.googlePlaceId,
      googleRating: googleData.googleRating ?? undefined,
      googleReviewCount: googleData.googleReviewCount || undefined,
      googleCategory: googleData.googleCategory,
      googleMapsUrl: googleData.googleMapsUrl,
      lat: googleData.lat ?? undefined,
      lng: googleData.lng ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    // Rollback
    const { deleteBusiness } = await import("@/lib/db");
    await deleteBusiness(slug).catch(() => {});
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create prospect.",
    });
  }

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_prospect",
    slug,
    detail: `${name} (zip search)`,
  });

  revalidatePath("/admin/leads");
  return NextResponse.json({ ok: true, slug });
}
