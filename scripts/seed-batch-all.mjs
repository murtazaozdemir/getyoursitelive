/**
 * Seed all confirmed no-website businesses from batches A–E (Google search images 9–13).
 * Run: node scripts/seed-batch-all.mjs
 *
 * Skips duplicates by slug and phone. Won't add businesses without a confirmed address.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BUSINESSES_DIR = join(ROOT, "data", "businesses");
const PROSPECTS_FILE = join(ROOT, "data", "prospects.json");

// ── All confirmed businesses from batches A–E ────────────────────────────────
const NEW_PROSPECTS = [
  // Batch A (image 9)
  { name: "Guevara's Auto Repair",       phone: "(973) 247-9933", address: "110 3rd Ave, Paterson, NJ 07514" },
  { name: "Oscanoa Auto Repair",          phone: "(973) 790-8028", address: "89 N 8th St, Paterson, NJ 07522" },
  { name: "Vito's Auto Repair",           phone: "(973) 773-1191", address: "50 Arnot St, Lodi, NJ 07644" },
  { name: "THM Auto Repair",              phone: "(973) 742-2400", address: "194 Getty Ave, Paterson, NJ 07503" },
  { name: "Top Flight Motor Works",       phone: "(973) 653-5311", address: "112 E Railway Ave, Paterson, NJ 07503" },
  { name: "Peter Auto Repair",            phone: "(973) 546-0185", address: "758 River Dr, Garfield, NJ 07026" },
  { name: "Lopez Auto Repair",            phone: "(973) 473-5120", address: "129 River Dr, Passaic, NJ 07055" },
  { name: "Saddle Brook Auto Center",     phone: "(201) 791-2071", address: "458 Fairlawn Pkwy, Saddle Brook, NJ 07663" },
  { name: "Frank Jr Auto Repair",         phone: "(973) 247-4220", address: "204 Montgomery St, Paterson, NJ 07501" },
  { name: "Nagi Auto Repair",             phone: "(973) 772-1110", address: "249 Outwater Ln, Garfield, NJ 07026" },
  { name: "Chesters Auto Repair",         phone: "(973) 340-6060", address: "45 Monroe St, Garfield, NJ 07026" },
  { name: "J & N Auto Repair",            phone: "(973) 345-9862", address: "257 20th Ave, Paterson, NJ 07501" },

  // Batch B (image 10)
  { name: "Nouri's Auto Repair",          phone: "(973) 881-1476", address: "503 21st Ave, Paterson, NJ 07513" },
  { name: "Zoilito Turbo Mechanic Center",phone: "",               address: "262 Midland Ave, Garfield, NJ 07026" },
  { name: "Captan Auto Repairs LLC",      phone: "(973) 473-1979", address: "490 N Main St, Lodi, NJ 07644" },
  { name: "Duran's Auto & Inspection Center", phone: "(973) 332-7832", address: "197 Madison St, Paterson, NJ 07501" },
  { name: "CJM Auto Sales & Repair",      phone: "(973) 577-2722", address: "100 Central Ave, Clifton, NJ 07011" },
  { name: "Fermin Auto Repair",           phone: "(973) 688-8881", address: "565 E 32nd St, Paterson, NJ 07513" },
  { name: "Zizzo's Auto Repair",          phone: "(973) 720-0926", address: "489 Haledon Ave, Haledon, NJ 07508" },
  { name: "Sergio Auto Tech LLC",         phone: "(973) 754-0175", address: "200 E 16th St, Paterson, NJ 07524" },
  { name: "MPH Auto Service",             phone: "(201) 456-8795", address: "379 River Dr, Garfield, NJ 07026" },
  { name: "L.G Auto Repair",              phone: "(973) 653-5474", address: "42 Summer St, Paterson, NJ 07524" },
  { name: "La Tranca Auto Repair",        phone: "(973) 782-5274", address: "193 Straight St, Paterson, NJ 07501" },
  { name: "Steve's Auto & Truck",         phone: "(201) 262-0005", address: "169 E Midland Ave, Paramus, NJ 07652" },
  { name: "Frank Auto Services",          phone: "(862) 264-7629", address: "180 16th Ave, Paterson, NJ 07501" },

  // Batch C (image 11)
  { name: "Iggy's Auto Repair",           phone: "(973) 278-9494", address: "582 McBride Ave, Woodland Park, NJ 07424" },
  { name: "Viejo Auto Service",           phone: "(973) 777-1103", address: "217 Paterson Ave, Wallington, NJ 07057" },
  { name: "Motorsport Auto Repair",       phone: "(973) 742-7007", address: "1031 Market St, Paterson, NJ 07513" },
  { name: "Duran Auto Service & Tire",    phone: "(973) 357-8187", address: "601 Madison Ave, Paterson, NJ 07514" },
  { name: "ANC Auto Repair",              phone: "(201) 440-0701", address: "163 Central Ave, Rochelle Park, NJ 07662" },
  { name: "Berna's Auto Service",         phone: "(973) 460-9460", address: "805 Main Ave, Passaic, NJ 07055" },
  { name: "Lexington Service Garage",     phone: "(973) 340-4677", address: "353 Lexington Ave, Clifton, NJ 07011" },
  { name: "A & C Auto Inc",              phone: "(973) 772-1195", address: "1 Belmont Ave, Garfield, NJ 07026" },

  // Batch D (image 12)
  { name: "Muscle Auto Repair",           phone: "(973) 928-3900", address: "292 Broadway, Passaic, NJ 07055" },
  { name: "O.M.F Auto Repairs",           phone: "(201) 546-8939", address: "160 Gregg St, Lodi, NJ 07644" },
  { name: "Morales Auto Repair",          phone: "(973) 653-5611", address: "650 Market St, Paterson, NJ 07513" },
  { name: "Jorge & Jack Enterprises",     phone: "(973) 772-0496", address: "35 Crooks Ave, Clifton, NJ 07011" },
  { name: "S&S Auto Repair LLC",          phone: "(973) 773-0010", address: "34 Victor St, Lodi, NJ 07644" },
  { name: "Sanchez Auto Services LLC",    phone: "(973) 609-4586", address: "101 E Railway Ave, Paterson, NJ 07503" },
  { name: "Leo & Ray's Auto Repairs",     phone: "(201) 791-6270", address: "4-10 Saddle River Rd, Fair Lawn, NJ 07410" },
  { name: "Frank Car Depot Auto Repair",  phone: "(201) 386-0066", address: "510 Union Ave, Belleville, NJ 07109" },

  // Batch E (image 13)
  { name: "Jm Manuel's Auto Services",    phone: "(973) 330-9864", address: "595 Paulison Ave, Clifton, NJ 07011" },
  { name: "South Side Garage Inc",        phone: "(973) 594-1103", address: "171 River Rd, Clifton, NJ 07014" },
  { name: "9th Avenue Auto Repair & Tire",phone: "(973) 881-7331", address: "276 9th Ave, Paterson, NJ 07524" },
  { name: "R A Auto Services",            phone: "(973) 742-9330", address: "87 Jersey St, Paterson, NJ 07501" },
  { name: "Data Auto Electric LLC",       phone: "(908) 583-4735", address: "583 E 18th St, Paterson, NJ 07514" },
  { name: "Big Brother Auto Repair",      phone: "(973) 932-3073", address: "166 Burhans Ave, Paterson, NJ 07522" },
  { name: "Rob's Automotive",             phone: "(973) 471-7348", address: "13 Rennie Pl, Lodi, NJ 07644" },
  { name: "Belmont Auto Tech",            phone: "(973) 689-6911", address: "199 Belmont Ave, Haledon, NJ 07508" },
  { name: "Town Auto Mechanic LLC",       phone: "(201) 457-0225", address: "152 Railroad Ave, Hackensack, NJ 07601" },
  { name: "Advanced Automotive",          phone: "(973) 881-7277", address: "803 Market St, Paterson, NJ 07513" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

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
      narrative: `${name} has been serving the local community for over ${years} years. We're a family-owned shop that treats every customer like a neighbor — because most of our customers are. No upsells, no guesswork. Just honest work and fair prices.`,
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

// ── Run ──────────────────────────────────────────────────────────────────────

const prospects = JSON.parse(readFileSync(PROSPECTS_FILE, "utf8"));
const existingSlugs = new Set(prospects.map(p => p.slug));
const existingPhones = new Set(prospects.map(p => normalizePhone(p.phone)).filter(p => p.length >= 7));

let added = 0, skipped = 0;

for (const biz of NEW_PROSPECTS) {
  const slug = nameToSlug(biz.name);
  const normPhone = normalizePhone(biz.phone);

  if (existingSlugs.has(slug) || existsSync(join(BUSINESSES_DIR, `${slug}.json`))) {
    console.log(`SKIP (slug exists):  ${biz.name}`);
    skipped++;
    continue;
  }

  if (normPhone.length >= 7 && existingPhones.has(normPhone)) {
    console.log(`SKIP (phone exists): ${biz.name} ${biz.phone}`);
    skipped++;
    continue;
  }

  const business = prospectBusiness(slug, biz.name, biz.phone, biz.address);
  writeFileSync(join(BUSINESSES_DIR, `${slug}.json`), JSON.stringify(business, null, 2));

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
