import type { HoursSchedule, BusinessVisibility } from "@/lib/business-types";
import type {
  FooterContent,
  NavLabels,
  SectionTitles,
} from "@/types/site";

export function defaultHoursSchedule(): HoursSchedule {
  return {
    mon: { open: "08:00", close: "18:00" },
    tue: { open: "08:00", close: "18:00" },
    wed: { open: "08:00", close: "18:00" },
    thu: { open: "08:00", close: "18:00" },
    fri: { open: "08:00", close: "18:00" },
    sat: { open: "08:00", close: "14:00" },
    sun: null,
  };
}

export function defaultHoursScheduleWeekdayOnly(): HoursSchedule {
  return {
    mon: { open: "08:00", close: "18:00" },
    tue: { open: "08:00", close: "18:00" },
    wed: { open: "08:00", close: "18:00" },
    thu: { open: "08:00", close: "18:00" },
    fri: { open: "08:00", close: "18:00" },
    sat: null,
    sun: null,
  };
}

export function defaultFooter(): FooterContent {
  return {
    locationLabel: "Location",
    phoneLabel: "Phone",
    copyrightSuffix: "All rights reserved.",
  };
}

export function defaultNavLabels(teamWord = "Team"): NavLabels {
  return {
    home: "Home",
    about: "About",
    services: "Services",
    technicians: teamWord,
    contact: "Contact",
  };
}

export function defaultSectionTitles(overrides?: Partial<SectionTitles>): SectionTitles {
  return {
    services: "Our Services",
    dealsEyebrow: "Current Specials",
    deals: "Deals this month",
    dealsLede: "Limited-time offers.",
    pricing: "Transparent Pricing",
    team: "Meet Our Team",
    testimonials: "What Customers Say",
    faq: "Common Questions",
    photos: "Our Work",
    dealsCta: "Claim this offer",
    pricingPopular: "Most Popular",
    pricingRegular: "No surprises",
    ...overrides,
  };
}

export function prospectVisibility(): BusinessVisibility {
  return {
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
    showBooking: false,
    showContactInfo: true,
    showMap: true,
    showHours: true,
  };
}

export function blankVisibility(): BusinessVisibility {
  return {
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
    showPhotos: false,
    showEmergencyBanner: false,
    showBooking: false,
    showContactInfo: true,
    showMap: true,
    showHours: true,
  };
}

export function minimalProspectVisibility(): BusinessVisibility {
  return {
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
    showPhotos: false,
    showEmergencyBanner: false,
    showBooking: false,
    showContactInfo: true,
    showMap: true,
    showHours: true,
  };
}
