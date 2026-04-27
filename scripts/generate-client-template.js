#!/usr/bin/env node
/**
 * Generate Client Template
 *
 * Reads the platform's auto-repair template data and produces a complete
 * client template package — the same package we'd deploy to a client's
 * Cloudflare account.
 *
 * Usage:
 *   node scripts/generate-client-template.js <business-name> <phone> <address> <output-dir> [worker-url]
 *
 * Example:
 *   node scripts/generate-client-template.js "Seed Reply Auto" "(555) 123-4567" "123 Main Street, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.getyoursitelive.workers.dev/api
 */

const fs = require("fs");
const path = require("path");

// ─── Platform template data (mirrors auto-repair.ts buildProspectBusiness) ───

function buildProspectBusiness(slug, name, phone, address) {
  const theme = "modern";
  const founded = new Date().getFullYear() - 11;
  const years = new Date().getFullYear() - founded;

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
      eyebrowPrefix: `Family-owned since ${founded}`,
      headline: "Expert Auto Repair You Can Trust.",
      lead: "ASE-certified technicians. Same-day service on most repairs. Clear pricing before we start.",
      primaryCta: "See Our Services",
      secondaryCta: "Request an Estimate",
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
      bullets: [
        "Free digital inspections with photos and videos",
        "Written estimates before any work begins",
        "No surprise pricing — ever",
      ],
      primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
      secondaryImage: "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
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
      { id: "diagnostic", name: "Engine Diagnostic", priceRange: "$79–$129", duration: "30–60 min", description: "Full-system diagnostic scan to identify warning lights and performance issues.", features: ["OBD-II scan", "Check engine code reading", "Written diagnostic report", "Repair recommendations"] },
      { id: "brakes", name: "Brake Repair", priceRange: "$129–$349", duration: "1–2 hours", description: "Complete brake service — pads, rotors, calipers, fluid. Safe stopping power restored.", features: ["Pad and rotor replacement", "Caliper inspection", "Brake fluid flush", "Post-service test drive"] },
      { id: "oil", name: "Oil & Filter Change", priceRange: "$39–$79", duration: "20–30 min", description: "Keep your engine running clean with quality oil and a new filter.", features: ["Conventional or synthetic oil", "OEM-quality filter", "Fluid top-off", "Multi-point inspection"] },
      { id: "tires", name: "Tires & Alignment", priceRange: "$69–$229", duration: "45–90 min", description: "Tire mounting, balancing, rotation, and alignment.", features: ["Tire rotation and balance", "4-wheel alignment", "Tread depth check", "Pressure adjustment"] },
      { id: "inspection", name: "State Inspection", priceRange: "Included with service", duration: "30 min", description: "State safety and emissions inspection. Fast turnaround.", features: ["Full safety inspection", "Emissions test", "Courtesy pre-check", "Same-day results"] },
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
    // Platform key: teamMembers → client template key: team
    teamMembers: [
      { name: "Mike", role: "Owner & Lead Mechanic", experience: "15+ years", specialty: "Domestic and import repair", image: "https://images.pexels.com/photos/4489743/pexels-photo-4489743.jpeg?auto=compress&cs=tinysrgb&w=800" },
      { name: "Sarah", role: "Senior Technician", experience: "10+ years", specialty: "Diagnostics and brake systems", image: "https://images.pexels.com/photos/4489730/pexels-photo-4489730.jpeg?auto=compress&cs=tinysrgb&w=800" },
    ],
    testimonials: [
      { name: "John D.", context: "2020 Toyota Camry", quote: "Best mechanic shop in the area. Upfront about the cost and finished faster than expected. Will definitely be back." },
      { name: "Maria L.", context: "2018 Honda CR-V", quote: "Took my car in for a brake job. They showed me photos of the worn pads and explained everything. Fair price, great work." },
      { name: "Carlos R.", context: "2017 Ford F-150", quote: "Finally a mechanic I can trust. They didn't try to upsell me on anything I didn't need. Highly recommend." },
    ],
    photos: [
      { id: "p1", url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Engine diagnostics" },
      { id: "p2", url: "https://images.pexels.com/photos/3642618/pexels-photo-3642618.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Brake inspection" },
      { id: "p3", url: "https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Under the hood" },
      { id: "p4", url: "https://images.pexels.com/photos/4489767/pexels-photo-4489767.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Professional service" },
      { id: "p5", url: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Our shop" },
      { id: "p6", url: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Quality parts" },
    ],
    faqs: [
      { id: "f1", question: "How long does an oil change take?", answer: "Most oil changes are done in 30–45 minutes. We'll text you when your car is ready." },
      { id: "f2", question: "Do I need an appointment?", answer: "Walk-ins are welcome, but scheduling online ensures minimal wait time." },
      { id: "f3", question: "What warranty do you offer?", answer: "All repairs come with a 24-month / 24,000-mile parts and labor warranty." },
      { id: "f4", question: "Do you offer loaner cars?", answer: "Yes — call ahead and we'll arrange a loaner for longer repairs." },
    ],
    emergency: {
      heading: "Car Won't Start? We're Here for You.",
      description: "Emergency towing referrals and after-hours assistance available. Call us first.",
      ctaLabel: "Call Us Now",
    },
    contact: {
      heading: "Book Your Service",
      description: "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.",
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
      photos: "Our Work",
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
      showPhotos: true,
      showEmergencyBanner: false,
      showBooking: true,
      showContactInfo: true,
      showMap: true,
      showHours: true,
    },
  };
}

// ─── Transform platform Business → client template JSON ───

function platformToClientTemplate(business) {
  // Deep clone
  const ct = JSON.parse(JSON.stringify(business));

  // Key mapping: teamMembers → team
  if (ct.teamMembers) {
    ct.team = ct.teamMembers;
    delete ct.teamMembers;
  }

  // Strip booking form fields from contact (client template has no email sending)
  if (ct.contact) {
    delete ct.contact.bookButtonLabel;
    delete ct.contact.extraServiceOptions;
    // Simplify contact heading for info-only display
    if (ct.contact.heading === "Book Your Service") {
      ct.contact.heading = "Contact Us";
    }
    if (ct.contact.description && ct.contact.description.includes("confirm timing and pricing")) {
      ct.contact.description = "Get in touch — we'd love to hear from you.";
    }
  }

  // Strip description field (platform-only, from Google Maps)
  delete ct.description;

  return ct;
}

// ─── Copy directory recursively ───

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".wrangler") continue;
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Main ───

function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("Usage: node generate-client-template.js <name> <phone> <address> <output-dir> [worker-url]");
    console.error('Example: node generate-client-template.js "Seed Reply Auto" "(555) 123-4567" "123 Main Street, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.getyoursitelive.workers.dev/api');
    process.exit(1);
  }

  const [name, phone, address, outputDir, workerUrl] = args;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  console.log(`\nGenerating client template for "${name}"...`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Output: ${outputDir}\n`);

  // 1. Build business data from platform template
  const platformBusiness = buildProspectBusiness(slug, name, phone, address);

  // 2. Transform to client template format
  const clientContent = platformToClientTemplate(platformBusiness);

  // 3. Source = client-template static files
  const templateSource = path.resolve(__dirname, "../../client-template");
  if (!fs.existsSync(templateSource)) {
    console.error(`ERROR: Client template source not found at ${templateSource}`);
    process.exit(1);
  }

  // 4. Copy static site files
  console.log("Copying site files...");
  copyDirSync(path.join(templateSource, "site"), path.join(outputDir, "site"));

  // 4b. Write config.js with the correct API_BASE
  const apiBase = workerUrl || "/api";
  const configContent = `/**
 * Shared config — loaded by all pages.
 *
 * API_BASE points to the Worker API.
 * - Same domain (Worker route on Pages): use "/api"
 * - Separate Worker subdomain: use full Worker URL
 */
const API_BASE = "${apiBase}";
`;
  fs.writeFileSync(path.join(outputDir, "site/js/config.js"), configContent);
  console.log(`Writing config.js with API_BASE = "${apiBase}"...`);

  // 5. Copy worker files
  console.log("Copying worker files...");
  copyDirSync(path.join(templateSource, "worker"), path.join(outputDir, "worker"));

  // 6. Write the generated content JSON
  console.log("Writing sample-content.json...");
  const contentPath = path.join(outputDir, "sample-content.json");
  fs.writeFileSync(contentPath, JSON.stringify(clientContent, null, 2) + "\n");

  // 7. Copy supporting files
  for (const file of [".gitignore", "CLAUDE.md", "SECURITY.md", "SECURITY-AUDIT1.md", "SECURITY-AUDIT2.md", "AUDIT.md"]) {
    const src = path.join(templateSource, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outputDir, file));
    }
  }

  console.log("\nClient template generated successfully!");
  console.log(`  Output directory: ${outputDir}`);
  console.log(`  Content JSON: ${contentPath}`);
  console.log(`\nNext steps:`);
  if (!workerUrl) {
    console.log(`  1. Re-run with worker-url param once Worker is deployed, OR manually update ${outputDir}/site/js/config.js`);
  }
  console.log(`  ${workerUrl ? "1" : "2"}. Deploy worker/ to client's Cloudflare account`);
  console.log(`  ${workerUrl ? "2" : "3"}. Deploy site/ to Cloudflare Pages`);
  console.log(`  ${workerUrl ? "3" : "4"}. Seed KV with: wrangler kv:key put --binding CONTENT content '$(cat ${contentPath})' --remote\n`);
}

main();
