/**
 * Batch seed prospects from a list.
 * Run: node scripts/seed-prospects.mjs
 *
 * Only adds businesses that don't already exist (checks slug + phone).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BUSINESSES_DIR = join(ROOT, "data", "businesses");
const PROSPECTS_FILE = join(ROOT, "data", "prospects.json");

// ── Businesses to add (no-website only, from Google search) ─────────────
const NEW_PROSPECTS = [
  { name: "DDM Auto Service",          phone: "(201) 249-7172", address: "Paterson, NJ" },
  { name: "KMG Auto Body LLC",         phone: "",               address: "Clifton, NJ" },
  { name: "Spark Auto Repairs Inc",    phone: "(973) 772-9440", address: "Clifton, NJ" },
  { name: "L & M Auto Repair",         phone: "(973) 340-8030", address: "Clifton, NJ" },
  { name: "A&K Excellence Auto Repair",phone: "(862) 600-7953", address: "Elmwood Park, NJ" },
  { name: "A To Zee Auto Servs LLC",   phone: "(973) 777-8668", address: "Clifton, NJ" },
  { name: "J Auto Mechanic LLC",       phone: "(973) 928-9368", address: "Clifton, NJ" },
  { name: "i&p Auto Repair",           phone: "(201) 762-2262", address: "Passaic, NJ" },
  { name: "Dynamic Auto Service",      phone: "(973) 782-5700", address: "Clifton, NJ" },
  { name: "Avo Jack Car Services Inc", phone: "(201) 845-0046", address: "Lodi, NJ" },
  { name: "J Morales Auto Service",    phone: "(973) 473-0000", address: "Clifton, NJ" },
  { name: "Car Kings Inc",             phone: "",               address: "Clifton, NJ" },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function nameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, "");
}

function prospectBusiness(slug, name, phone, address) {
  const founded = new Date().getFullYear() - 11;
  const years = new Date().getFullYear() - founded;
  return {
    slug,
    category: "Auto Repair",
    theme: "modern",
    businessInfo: {
      name, tagline: "Honest repairs. Real technicians. No surprises.",
      founded, phone, email: "", address, hours: "Mon-Fri: 8am-6pm, Sat: 8am-2pm",
      emergencyPhone: phone, logoUrl: "",
      social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
    },
    hoursSchedule: {
      mon: { open: "08:00", close: "18:00" }, tue: { open: "08:00", close: "18:00" },
      wed: { open: "08:00", close: "18:00" }, thu: { open: "08:00", close: "18:00" },
      fri: { open: "08:00", close: "18:00" }, sat: { open: "08:00", close: "14:00" },
      sun: null,
    },
    hero: {
      eyebrowPrefix: `Family-owned since ${founded}`,
      headline: "Expert Auto Repair You Can Trust.",
      lead: "ASE-certified technicians. Same-day service on most repairs. Clear pricing before we start.",
      primaryCta: "See Our Services", secondaryCta: "Request an Estimate",
      whyTitle: "Why customers keep coming back",
      heroImage: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyBullets: [
        "Photo-backed diagnostics — we show you what's wrong.",
        "Same-day turnaround on most repairs.",
        "24-month / 24,000-mile warranty on parts and labor.",
        "Friendly, plain-language explanations.",
      ],
    },
    about: {
      heading: "Where Expertise Meets Honesty",
      narrative: `${name} has been serving the local community for over ${years} years. We're a family-owned shop that treats every customer like a neighbor — because most of our customers are.`,
      bullets: ["Free digital inspections with photos and videos", "Written estimates before any work begins", "No surprise pricing — ever"],
      primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
      secondaryImage: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400",
      whyUsCards: [
        { title: "Honest Diagnostics", description: "We show photos of every issue before recommending repairs." },
        { title: "Same-Day Service", description: "Most repairs completed within 24 hours." },
        { title: "Real-Time Updates", description: "Text and email updates from check-in to pickup." },
        { title: "2-Year Warranty", description: "24,000-mile parts and labor protection on every job." },
      ],
    },
    stats: [
      { label: "Years in Business", value: years, suffix: "+" },
      { label: "Satisfied Customers", value: 1200, suffix: "+" },
      { label: "Repairs Completed", value: 6000, suffix: "+" },
      { label: "Certified Technicians", value: 4, suffix: "" },
    ],
    services: [
      { id: "diagnostic", name: "Engine Diagnostic", priceRange: "$79–$129", duration: "30–60 min", description: "Full-system diagnostic scan.", features: ["OBD-II scan", "Check engine code reading", "Written diagnostic report", "Repair recommendations"] },
      { id: "brakes", name: "Brake Repair", priceRange: "$129–$349", duration: "1–2 hours", description: "Complete brake service.", features: ["Pad and rotor replacement", "Caliper inspection", "Brake fluid flush", "Post-service test drive"] },
      { id: "oil", name: "Oil & Filter Change", priceRange: "$39–$79", duration: "20–30 min", description: "Keep your engine running clean.", features: ["Conventional or synthetic oil", "OEM-quality filter", "Fluid top-off", "Multi-point inspection"] },
      { id: "tires", name: "Tires & Alignment", priceRange: "$69–$229", duration: "45–90 min", description: "Tire mounting, balancing, rotation, and alignment.", features: ["Tire rotation and balance", "4-wheel alignment", "Tread depth check", "Pressure adjustment"] },
      { id: "inspection", name: "State Inspection", priceRange: "Included with service", duration: "30 min", description: "State safety and emissions inspection.", features: ["Full safety inspection", "Emissions test", "Courtesy pre-check", "Same-day results"] },
    ],
    deals: [
      { id: "d1", title: "Oil Change Special", badge: "Limited Time", originalPrice: "$79", price: "$49", description: "Full synthetic oil change with filter. Up to 5 quarts." },
      { id: "d2", title: "Brake Inspection", badge: "Free", originalPrice: "", price: "Free", description: "No-charge brake inspection with any service visit." },
    ],
    pricing: [
      { id: "oil-change", name: "Oil Change", price: "$49", note: "Synthetic blend + multi-point inspection", popular: false },
      { id: "brake-service", name: "Brake Service", price: "$189", note: "Pads, rotor inspection, safety check", popular: true },
      { id: "diagnostic", name: "Full Diagnostic", price: "$89", note: "Digital scan + road test report", popular: false },
    ],
    teamMembers: [
      { name: "Mike", role: "Owner & Lead Mechanic", experience: "15+ years", specialty: "Domestic and import repair", image: "https://images.pexels.com/photos/4489743/pexels-photo-4489743.jpeg?auto=compress&cs=tinysrgb&w=800" },
    ],
    testimonials: [
      { name: "John D.", vehicle: "2020 Toyota Camry", quote: "Best mechanic shop in the area. Upfront about the cost and finished faster than expected." },
      { name: "Maria L.", vehicle: "2018 Honda CR-V", quote: "Took my car in for a brake job. They showed me photos of the worn pads and explained everything. Fair price, great work." },
    ],
    faqs: [
      { id: "f1", question: "How long does an oil change take?", answer: "Most oil changes are done in 30–45 minutes." },
      { id: "f2", question: "Do I need an appointment?", answer: "Walk-ins are welcome, but scheduling online ensures minimal wait time." },
      { id: "f3", question: "What warranty do you offer?", answer: "All repairs come with a 24-month / 24,000-mile parts and labor warranty." },
    ],
    emergency: { heading: "Car Won't Start? We're Here for You.", description: "Emergency towing referrals and after-hours assistance available. Call us first.", ctaLabel: "Call Us Now" },
    contact: { heading: "Book Your Service", description: "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.", bookButtonLabel: "Request Service", extraServiceOptions: ["General Inspection", "Other"] },
    footer: { visitHeading: "Visit & Contact", servicesHeading: "Services", locationLabel: "Location", phoneLabel: "Phone", copyrightSuffix: "All rights reserved." },
    sectionTitles: { services: "Our Services", dealsEyebrow: "Current Specials", deals: "Deals this month", dealsLede: "Limited-time offers on common repairs.", pricing: "Transparent Pricing", team: "Meet Our Technicians", testimonials: "What Customers Say", faq: "Common Questions", dealsCta: "Claim this offer", pricingPopular: "Most Popular", pricingRegular: "No surprises" },
    navLabels: { home: "Home", about: "About", services: "Services", technicians: "Technicians", contact: "Contact" },
    visibility: {
      showHeroEyebrow: true, showHeroCtas: true, showHeroHeadline: true, showHeroLead: true,
      showHeroImage: true, showHeroCard: true, showAbout: true, showAboutWhyUs: true,
      showStats: true, showServices: true, showDeals: true, showPricing: true,
      showTeam: true, showTestimonials: true, showFaq: true, showEmergencyBanner: false,
      showBooking: true, showContactInfo: true, showMap: true, showHours: true,
    },
  };
}

// ── Run ──────────────────────────────────────────────────────────────────

const prospects = JSON.parse(readFileSync(PROSPECTS_FILE, "utf8"));
const existingSlugs = new Set(prospects.map(p => p.slug));
const existingPhones = new Set(prospects.map(p => normalizePhone(p.phone)).filter(p => p.length >= 7));

let added = 0, skipped = 0;

for (const biz of NEW_PROSPECTS) {
  const slug = nameToSlug(biz.name);
  const normPhone = normalizePhone(biz.phone);

  // Duplicate slug check
  if (existingSlugs.has(slug) || existsSync(join(BUSINESSES_DIR, `${slug}.json`))) {
    console.log(`SKIP (slug exists):  ${biz.name}`);
    skipped++;
    continue;
  }

  // Duplicate phone check
  if (normPhone.length >= 7 && existingPhones.has(normPhone)) {
    console.log(`SKIP (phone exists): ${biz.name} ${biz.phone}`);
    skipped++;
    continue;
  }

  // Write business JSON
  const business = prospectBusiness(slug, biz.name, biz.phone, biz.address);
  writeFileSync(join(BUSINESSES_DIR, `${slug}.json`), JSON.stringify(business, null, 2));

  // Add to prospects list
  const now = new Date().toISOString();
  const prospect = { slug, name: biz.name, phone: biz.phone, address: biz.address, status: "found", notes: [], createdAt: now, updatedAt: now };
  prospects.unshift(prospect);
  existingSlugs.add(slug);
  if (normPhone.length >= 7) existingPhones.add(normPhone);

  console.log(`ADDED: ${biz.name} → /${slug}`);
  added++;
}

writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));
console.log(`\nDone — ${added} added, ${skipped} skipped.`);
