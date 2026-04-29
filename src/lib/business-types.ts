/**
 * Shared type definitions for business data.
 * Kept separate from db.ts (which is server-only) so client components
 * can import these types without triggering server-only guards.
 */
import type {
  AboutContent,
  BusinessInfo,
  ContactContent,
  DealItem,
  EmergencyContent,
  FaqItem,
  FooterContent,
  HeroContent,
  NavLabels,
  PhotoItem,
  PricingCard,
  SectionTitles,
  ServiceItem,
  StatItem,
  TeamMember,
  Testimonial,
  ThemeName,
} from "@/types/site";

export interface BusinessVisibility {
  showTopbar: boolean;           // address + phone banner above the header
  showHeroEyebrow: boolean;    // "Family-owned since …" pill at top of hero
  showHeroHeadline: boolean;   // the big headline
  showHeroLead: boolean;       // the sub-headline paragraph
  showHeroCtas: boolean;       // the two hero buttons (Explore / Request Estimate)
  showHeroImage: boolean;      // right-column photo in the hero
  showHeroCard: boolean;       // "Why our customers choose us" card in the hero
  showAbout: boolean;          // About "story" row (image + heading + narrative + bullets)
  showAboutWhyUs: boolean;     // About "why-us cards" row (image + 4 cards)
  showStats: boolean;
  showServices: boolean;
  showDeals: boolean;
  showPricing: boolean;
  showTeam: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
  showPhotos: boolean;         // photo gallery section
  showEmergencyBanner: boolean;
  showBooking: boolean;        // the left-column request-service form
  showContactInfo: boolean;    // the right-column address/phone/email (excl. map)
  showMap: boolean;            // Google Maps iframe in Contact Info
  showHours: boolean;          // hours list nested inside Contact Info
}

/**
 * Structured weekly schedule for computing "currently open" status.
 * `null` for a day means the business is closed that day.
 * Times are 24-hour "HH:MM" in the business's local timezone.
 */
export type DaySchedule = { open: string; close: string } | null;
export interface HoursSchedule {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
}

export interface Business {
  slug: string;
  /**
   * Business category. Uses exact Google Maps naming, e.g.
   * "Car repair and maintenance service". Other categories are shown
   * in the admin but excluded from the
   * auto repair pipeline.
   */
  category: string;
  /** Short 2-3 sentence description of the business, sourced from Google Maps. */
  description?: string;
  theme: ThemeName;
  businessInfo: BusinessInfo;
  hoursSchedule: HoursSchedule;

  // Section content (page order, top → bottom)
  hero: HeroContent;
  about: AboutContent;
  stats: StatItem[];
  services: ServiceItem[];
  deals: DealItem[];
  pricing: PricingCard[];
  teamMembers: TeamMember[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  photos: PhotoItem[];
  emergency: EmergencyContent;
  contact: ContactContent;
  footer: FooterContent;
  sectionTitles: SectionTitles;
  navLabels: NavLabels;

  visibility: BusinessVisibility;
}
