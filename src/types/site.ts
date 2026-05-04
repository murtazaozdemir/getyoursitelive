export type ThemeName = "industrial" | "modern" | "luxury" | "friendly" | "sunshine" | "garden" | "sky";

export interface BusinessInfo {
  name: string;
  tagline: string;
  founded: number;
  phone: string;
  email: string;
  address: string;
  hours: string;
  emergencyPhone: string;
  /** Optional custom logo URL — if empty, a default wrench icon is used. */
  logoUrl: string;
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
}

export interface ServiceItem {
  id: string;
  name: string;
  priceRange: string;
  duration: string;
  description: string;
  features: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  specialty: string;
  image: string;
}

export interface Testimonial {
  name: string;
  /** Contextual detail shown after the customer name — vehicle for auto shops,
   *  service type for others. Old data may still have a `vehicle` field;
   *  read-time migration in db.ts normalizes it to `context`. */
  context: string;
  quote: string;
}

export interface DealItem {
  id: string;
  title: string;
  description: string;
  price: string;            // e.g. "$39", "Free"
  originalPrice?: string;   // e.g. "$69" (rendered as strikethrough)
  badge?: string;           // e.g. "Limited time", "Spring special"
}

/** Hero section — the first thing visitors see. */
export interface HeroContent {
  eyebrowPrefix: string;       // short line above the headline (free text)
  headline: string;            // the main headline (free text, plain styling)
  lead: string;                // sub-headline paragraph
  primaryCta: string;          // first button label, e.g. "Explore Services"
  secondaryCta: string;        // second button label, e.g. "Request Estimate"
  whyTitle: string;            // heading of the credibility card
  whyBullets: string[];        // bullets shown in the credibility card
  heroImage: string;           // URL of the right-column photo
}

/** About section — longer narrative + "why us" cards. */
export interface AboutContent {
  heading: string;             // e.g. "{Name} - Where Expertise Meets Honesty"
  narrative: string;           // leading paragraph
  bullets: string[];           // the numbered differentiators list
  primaryImage: string;        // first image URL
  secondaryImage: string;      // second image URL
  whyUsCards: { title: string; description: string }[];  // 4 tiles under secondary image
}

/** One of the four stat cards shown below the hero. */
export interface StatItem {
  label: string;               // e.g. "Years Experience"
  value: number;               // e.g. 15
  suffix: string;              // e.g. "+"
}

/** Pricing card. */
export interface PricingCard {
  id: string;
  name: string;                // e.g. "Oil Change"
  price: string;               // e.g. "$49"
  note: string;                // e.g. "Synthetic blend + 27-point inspection"
  popular: boolean;            // highlights the card with accent styling
}

/** FAQ entry — question + answer pair. */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** Photo gallery item. */
export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
}

/** Emergency banner copy. */
export interface EmergencyContent {
  heading: string;             // e.g. "Car Won't Start? We're Here 24/7."
  description: string;
  ctaLabel: string;            // e.g. "Call Emergency Line"
}

/** Contact section copy. */
export interface ContactContent {
  heading: string;             // e.g. "Request Service"
  description: string;         // e.g. "Tell us what your vehicle needs..."
  bookButtonLabel: string;     // e.g. "Book Service" (submit button)
  /**
   * Extra options appended to the booking form's service dropdown after the
   * shop's actual services. A special value of "Other" (exact match) reveals
   * a free-text input for the customer to describe what they need.
   */
  extraServiceOptions: string[];
}

/** Footer section copy. */
export interface FooterContent {
  locationLabel: string;       // e.g. "Location"
  phoneLabel: string;          // e.g. "Phone"
  copyrightSuffix: string;     // e.g. "All rights reserved."
}

/** Navigation bar labels. Keys match the anchor section ids. */
export interface NavLabels {
  home: string;
  about: string;
  services: string;
  technicians: string;
  contact: string;
}

/** Titles shown above each major page section. Centralized so they can
 *  all be edited inline alongside the rest of the content. */
export interface SectionTitles {
  services: string;            // "Our Services"
  dealsEyebrow: string;        // "Current Specials"
  deals: string;               // "Deals this month"
  dealsLede: string;           // "Limited-time offers. Mention this page..."
  pricing: string;             // "Transparent Pricing"
  team: string;                // "Meet Our Technicians"
  testimonials: string;        // "What Customers Say"
  faq: string;                 // "Frequently Asked Questions"
  photos: string;              // "Our Work"
  dealsCta: string;            // "Claim this offer"
  pricingPopular: string;      // "Popular"
  pricingRegular: string;      // "No surprises"
}
