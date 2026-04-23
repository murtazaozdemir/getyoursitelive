"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, isFounder } from "@/lib/users";
import {
  createProspect,
  updateProspect,
  deleteProspect,
  getProspect,
  findProspectByPhone,
  normalizePhone,
  type ProspectStatus,
} from "@/lib/prospects";
import { saveBusiness, getBusinessBySlug, deleteBusiness } from "@/lib/db";
import { createUser } from "@/lib/users";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import { logAudit } from "@/lib/audit-log";

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
  const years = new Date().getFullYear() - founded;

  return {
    slug,
    category: "Auto Repair",
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
      eyebrowPrefix: `Family-owned since ${founded}`,
      headline: "Expert Auto Repair You Can Trust.",
      lead: "ASE-certified technicians. Same-day service on most repairs. Clear pricing before we start.",
      primaryCta: "See Our Services",
      secondaryCta: "Request an Estimate",
      whyTitle: "Why customers keep coming back",
      heroImage:
        "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyBullets: [
        "Photo-backed diagnostics — we show you what's wrong.",
        "Same-day turnaround on most repairs.",
        "24-month / 24,000-mile warranty on parts and labor.",
        "Friendly, plain-language explanations.",
      ],
    },
    about: {
      heading: "Where Expertise Meets Honesty",
      narrative: `${name} has been serving the local community for over ${years} years. We're a family-owned shop that treats every customer like a neighbor — because most of our customers are. No upsells, no guesswork. Just honest work and fair prices.`,
      bullets: [
        "Free digital inspections with photos and videos",
        "Written estimates before any work begins",
        "No surprise pricing — ever",
      ],
      primaryImage:
        "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
      secondaryImage:
        "https://images.pexels.com/photos/3807387/pexels-photo-3807387.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyUsCards: [
        {
          title: "Honest Diagnostics",
          description: "We show photos of every issue before recommending repairs.",
        },
        { title: "Same-Day Service", description: "Most repairs completed within 24 hours." },
        {
          title: "Real-Time Updates",
          description: "Text and email updates from check-in to pickup.",
        },
        {
          title: "2-Year Warranty",
          description: "24,000-mile parts and labor protection on every job.",
        },
      ],
    },
    stats: [
      { label: "Years in Business", value: years, suffix: "+" },
      { label: "Satisfied Customers", value: 1200, suffix: "+" },
      { label: "Repairs Completed", value: 6000, suffix: "+" },
      { label: "Certified Technicians", value: 4, suffix: "" },
    ],
    services: [
      {
        id: "diagnostic",
        name: "Engine Diagnostic",
        priceRange: "$79–$129",
        duration: "30–60 min",
        description: "Full-system diagnostic scan to identify warning lights and performance issues.",
        features: ["OBD-II scan", "Check engine code reading", "Written diagnostic report", "Repair recommendations"],
      },
      {
        id: "brakes",
        name: "Brake Repair",
        priceRange: "$129–$349",
        duration: "1–2 hours",
        description: "Complete brake service — pads, rotors, calipers, fluid. Safe stopping power restored.",
        features: ["Pad and rotor replacement", "Caliper inspection", "Brake fluid flush", "Post-service test drive"],
      },
      {
        id: "oil",
        name: "Oil & Filter Change",
        priceRange: "$39–$79",
        duration: "20–30 min",
        description: "Keep your engine running clean with quality oil and a new filter.",
        features: ["Conventional or synthetic oil", "OEM-quality filter", "Fluid top-off", "Multi-point inspection"],
      },
      {
        id: "tires",
        name: "Tires & Alignment",
        priceRange: "$69–$229",
        duration: "45–90 min",
        description: "Tire mounting, balancing, rotation, and alignment.",
        features: ["Tire rotation and balance", "4-wheel alignment", "Tread depth check", "Pressure adjustment"],
      },
      {
        id: "inspection",
        name: "State Inspection",
        priceRange: "Included with service",
        duration: "30 min",
        description: "State safety and emissions inspection. Fast turnaround.",
        features: ["Full safety inspection", "Emissions test", "Courtesy pre-check", "Same-day results"],
      },
    ],
    deals: [
      {
        id: "d1",
        title: "Oil Change Special",
        badge: "Limited Time",
        originalPrice: "$79",
        price: "$49",
        description: "Full synthetic oil change with filter. Up to 5 quarts.",
      },
      {
        id: "d2",
        title: "Brake Inspection",
        badge: "Free",
        originalPrice: "",
        price: "Free",
        description: "No-charge brake inspection with any service visit.",
      },
    ],
    pricing: [
      { id: "oil-change", name: "Oil Change", price: "$49", note: "Synthetic blend + multi-point inspection", popular: false },
      { id: "brake-service", name: "Brake Service", price: "$189", note: "Pads, rotor inspection, safety check", popular: true },
      { id: "diagnostic", name: "Full Diagnostic", price: "$89", note: "Digital scan + road test report", popular: false },
    ],
    teamMembers: [
      {
        name: "Mike",
        role: "Owner & Lead Mechanic",
        experience: "15+ years",
        specialty: "Domestic and import repair",
        image: "https://images.pexels.com/photos/4489743/pexels-photo-4489743.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
      {
        name: "Sarah",
        role: "Senior Technician",
        experience: "10+ years",
        specialty: "Diagnostics and brake systems",
        image: "https://images.pexels.com/photos/4489730/pexels-photo-4489730.jpeg?auto=compress&cs=tinysrgb&w=800",
      },
    ],
    testimonials: [
      {
        name: "John D.",
        vehicle: "2020 Toyota Camry",
        quote: "Best mechanic shop in the area. Upfront about the cost and finished faster than expected. Will definitely be back.",
      },
      {
        name: "Maria L.",
        vehicle: "2018 Honda CR-V",
        quote: "Took my car in for a brake job. They showed me photos of the worn pads and explained everything. Fair price, great work.",
      },
      {
        name: "Carlos R.",
        vehicle: "2017 Ford F-150",
        quote: "Finally a mechanic I can trust. They didn't try to upsell me on anything I didn't need. Highly recommend.",
      },
    ],
    faqs: [
      {
        id: "f1",
        question: "How long does an oil change take?",
        answer: "Most oil changes are done in 30–45 minutes. We'll text you when your car is ready.",
      },
      {
        id: "f2",
        question: "Do I need an appointment?",
        answer:
          "Walk-ins are welcome, but scheduling online ensures minimal wait time.",
      },
      {
        id: "f3",
        question: "What warranty do you offer?",
        answer:
          "All repairs come with a 24-month / 24,000-mile parts and labor warranty.",
      },
      {
        id: "f4",
        question: "Do you offer loaner cars?",
        answer: "Yes — call ahead and we'll arrange a loaner for longer repairs.",
      },
    ],
    emergency: {
      heading: "Car Won't Start? We're Here for You.",
      description:
        "Emergency towing referrals and after-hours assistance available. Call us first.",
      ctaLabel: "Call Us Now",
    },
    contact: {
      heading: "Book Your Service",
      description:
        "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.",
      bookButtonLabel: "Request Service",
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
      dealsLede: "Limited-time offers on common repairs.",
      pricing: "Transparent Pricing",
      team: "Meet Our Technicians",
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
      showDeals: true,
      showPricing: true,
      showTeam: true,
      showTestimonials: true,
      showFaq: true,
      showEmergencyBanner: false,
      showBooking: true,
      showContactInfo: true,
      showMap: true,
      showHours: true,
    },
  };
}

export async function createProspectAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return { ok: false, error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const street = (formData.get("street") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const state = (formData.get("state") as string)?.trim() ?? "";
  const zip = (formData.get("zip") as string)?.trim() ?? "";
  const addressParts = [street, city, state && zip ? `${state} ${zip}` : state || zip].filter(Boolean);
  const address = addressParts.join(", ");

  if (!name) return { ok: false, error: "Business name is required." };

  const slug = nameToSlug(name);
  if (!slug) return { ok: false, error: "Could not generate a valid slug from that name." };

  // Block duplicate slug — check both business store and prospect store
  const [existing, existingProspect] = await Promise.all([
    getBusinessBySlug(slug),
    getProspect(slug),
  ]);
  if (existing || existingProspect) {
    return {
      ok: false,
      error: `A business with that name already exists (slug "${slug}"). Check the leads list — it may already be there.`,
    };
  }

  // Block duplicate phone number
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch) {
      return {
        ok: false,
        error: `Phone ${phone} is already on file for "${phoneMatch.name}". Check the prospects list before adding again.`,
      };
    }
  }

  const business = prospectBusiness(slug, name, phone, address);
  await saveBusiness(business);

  const now = new Date().toISOString();
  try {
    await createProspect({
      slug,
      name,
      phone,
      address,
      status: "found",
      notes: [],
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    // Rollback: remove the business we just created so data stays consistent
    await deleteBusiness(slug).catch(() => {});
    throw err;
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "create_prospect", slug, detail: name });
  revalidatePath("/admin/leads");
  revalidatePath(`/${slug}`);

  redirect(`/admin/leads/${slug}`);
}

export async function updateProspectStatusAction(slug: string, status: ProspectStatus): Promise<{ ok: boolean; locked?: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  const existing = await getProspect(slug);

  // Once a lead is contacted, it's locked to that reseller.
  // Only the reseller who contacted it (or the Founder) can advance the stage.
  if (existing?.contactedBy && existing.contactedBy !== user.email && !isFounder(user)) {
    return { ok: false, locked: true };
  }

  const patch: Partial<Parameters<typeof updateProspect>[1]> & { status: ProspectStatus } = { status };

  // Record who first moved this lead to "contacted" — used for commission tracking.
  // Only set once; never overwrite an existing attribution.
  if (status === "contacted" && existing && !existing.contactedBy) {
    patch.contactedBy = user.email;
    patch.contactedByName = user.name;
    patch.contactedAt = new Date().toISOString();
  }

  await updateProspect(slug, patch);
  await logAudit({ userEmail: user.email, userName: user.name, action: "prospect_status", slug, detail: status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function updateProspectInfoAction(
  slug: string,
  data: { name: string; phone: string; address: string; category: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  const { name, phone, address, category } = data;
  if (!name.trim()) return { ok: false, error: "Name is required." };

  // Block if new phone belongs to a different prospect
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch && phoneMatch.slug !== slug) {
      return {
        ok: false,
        error: `Phone ${phone} is already on file for "${phoneMatch.name}".`,
      };
    }
  }

  // Update prospect record
  await updateProspect(slug, { name: name.trim(), phone: phone.trim(), address: address.trim() });

  // Keep business JSON in sync (name, phone, address, category)
  const biz = await getBusinessBySlug(slug);
  if (biz) {
    biz.businessInfo.name = name.trim();
    biz.businessInfo.phone = phone.trim();
    biz.businessInfo.address = address.trim();
    biz.businessInfo.emergencyPhone = phone.trim();
    biz.category = category.trim();
    await saveBusiness(biz);
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "update_prospect_info", slug, detail: name.trim() });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${slug}`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

export async function addProspectNoteAction(slug: string, text: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  const prospect = await getProspect(slug);
  if (!prospect) return { ok: false };

  const note = { id: `n-${Date.now()}`, text, createdAt: new Date().toISOString() };
  await updateProspect(slug, { notes: [note, ...prospect.notes] });
  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function updateProspectDomainsAction(
  slug: string,
  data: { domain1: string; domain2: string; domain3: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  await updateProspect(slug, {
    domain1: data.domain1.trim() || undefined,
    domain2: data.domain2.trim() || undefined,
    domain3: data.domain3.trim() || undefined,
  });

  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function createOwnerLoginAction(
  slug: string,
  data: { name: string; email: string; password: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  const { name, email, password } = data;
  if (!name.trim()) return { ok: false, error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "A valid email is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const biz = await getBusinessBySlug(slug);
  if (!biz) return { ok: false, error: `No business found with slug "${slug}".` };

  try {
    await createUser({ name: name.trim(), email: email.trim(), password, role: "owner", ownedSlug: slug });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create user." };
  }

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_user",
    slug,
    detail: `${email.trim()} (owner → ${slug})`,
  });
  revalidatePath(`/admin/leads/${slug}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteProspectAction(slug: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_prospect", slug });
  await deleteProspect(slug);
  await deleteBusiness(slug);

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}
