import {
  Droplets,
  Wrench,
  Flame,
  ShowerHead,
  PipetteIcon,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import type { VerticalTemplate } from "./types";
import {
  defaultHoursSchedule,
  defaultHoursScheduleWeekdayOnly,
  defaultFooter,
  defaultNavLabels,
  defaultSectionTitles,
  prospectVisibility,
  blankVisibility,
} from "./shared";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  drain: PipetteIcon,
  "drain-cleaning": PipetteIcon,
  leak: Droplets,
  "leak-repair": Droplets,
  "water-heater": Flame,
  "hot-water": Flame,
  fixture: ShowerHead,
  faucet: ShowerHead,
  bathroom: ShowerHead,
  pipe: Wrench,
  "pipe-repair": Wrench,
  sewer: PipetteIcon,
  heating: Thermometer,
  general: Wrench,
};

export const plumberTemplate: VerticalTemplate = {
  id: "plumber",
  label: "Plumber",
  categories: [
    "Plumber",
    "Plumbing service",
    "Drain cleaning service",
    "Water heater installation service",
    "Septic system service",
    "Sewer service",
  ],
  testimonialContextLabel: "Service",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
    const founded = new Date().getFullYear() - 12;
    const years = new Date().getFullYear() - founded;

    return {
      slug,
      category: "Plumber",
      theme,
      businessInfo: {
        name,
        tagline: "Licensed plumbers. Fair rates. No surprises.",
        founded,
        phone,
        email: "",
        address,
        hours: "Mon-Fri: 7am-6pm, Sat: 8am-2pm",
        emergencyPhone: phone,
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: {
        mon: { open: "07:00", close: "18:00" },
        tue: { open: "07:00", close: "18:00" },
        wed: { open: "07:00", close: "18:00" },
        thu: { open: "07:00", close: "18:00" },
        fri: { open: "07:00", close: "18:00" },
        sat: { open: "08:00", close: "14:00" },
        sun: null,
      },
      hero: {
        eyebrowPrefix: `Trusted since ${founded}`,
        headline: "Reliable Plumbing You Can Count On.",
        lead: "Licensed professionals. Upfront pricing. Fast response times.",
        primaryCta: "See Our Services",
        secondaryCta: "Request a Quote",
        whyTitle: "Why homeowners trust us",
        heroImage:
          "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Licensed and insured plumbers.",
          "Upfront pricing — no surprises.",
          "Same-day service available.",
          "Clean worksite guaranteed.",
        ],
      },
      about: {
        heading: "Plumbing Done Right, Every Time",
        narrative: `${name} has served homeowners and businesses for over ${years} years. We fix it right the first time — no shortcuts, no hidden fees. Just honest plumbing from people who care.`,
        bullets: [
          "Licensed and fully insured",
          "Upfront pricing before work begins",
          "We clean up after every job",
        ],
        primaryImage:
          "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage:
          "https://images.pexels.com/photos/6816829/pexels-photo-6816829.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Licensed Pros", description: "Every plumber on our team is fully licensed." },
          { title: "Upfront Pricing", description: "We quote before we start. No surprise bills." },
          { title: "Fast Response", description: "Same-day and emergency service available." },
          { title: "Clean Work", description: "We leave your home cleaner than we found it." },
        ],
      },
      stats: [
        { label: "Years in Business", value: years, suffix: "+" },
        { label: "Jobs Completed", value: 4000, suffix: "+" },
        { label: "Happy Homeowners", value: 2000, suffix: "+" },
        { label: "Licensed Plumbers", value: 4, suffix: "" },
      ],
      services: [
        {
          id: "drain-cleaning",
          name: "Drain Cleaning",
          priceRange: "$99–$249",
          duration: "1–2 hours",
          description: "Clogged sinks, tubs, or floor drains cleared with professional equipment.",
          features: ["Camera inspection", "Mechanical or hydro clearing", "Preventive tips", "Warranty on service"],
        },
        {
          id: "leak-repair",
          name: "Leak Repair",
          priceRange: "$149–$399",
          duration: "1–3 hours",
          description: "Find and fix leaks in pipes, fixtures, and supply lines.",
          features: ["Leak detection", "Pipe repair or replacement", "Water damage assessment", "Drywall access repair"],
        },
        {
          id: "water-heater",
          name: "Water Heater Service",
          priceRange: "$199–$1200",
          duration: "2–4 hours",
          description: "Repair or replace tank and tankless water heaters.",
          features: ["Diagnosis and repair", "New installation", "Tankless upgrades", "Code-compliant work"],
        },
        {
          id: "fixture",
          name: "Fixture Installation",
          priceRange: "$99–$299",
          duration: "1–2 hours",
          description: "Install or replace faucets, toilets, garbage disposals, and more.",
          features: ["Faucet replacement", "Toilet install", "Garbage disposal", "Supply line upgrade"],
        },
        {
          id: "sewer",
          name: "Sewer Line Service",
          priceRange: "$299–$2000+",
          duration: "Half day",
          description: "Sewer line inspection, cleaning, and repair.",
          features: ["Video camera inspection", "Rooter service", "Trenchless repair options", "Full line replacement"],
        },
      ],
      deals: [
        {
          id: "d1",
          title: "Drain Cleaning Special",
          badge: "This Month",
          originalPrice: "$199",
          price: "$99",
          description: "Single drain clearing with camera inspection included.",
        },
        {
          id: "d2",
          title: "Free Estimate",
          badge: "Always",
          originalPrice: "",
          price: "Free",
          description: "No-obligation estimate on any plumbing job. Call or book online.",
        },
      ],
      pricing: [
        { id: "drain", name: "Drain Cleaning", price: "$99", note: "Single drain + camera check", popular: true },
        { id: "leak", name: "Leak Repair", price: "$149+", note: "Diagnosis included", popular: false },
        { id: "water-heater", name: "Water Heater Install", price: "$799+", note: "Includes old unit removal", popular: false },
      ],
      teamMembers: [
        {
          name: "Dave",
          role: "Owner & Master Plumber",
          experience: "20+ years",
          specialty: "Residential and commercial plumbing",
          image: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          name: "Jake",
          role: "Licensed Plumber",
          experience: "8+ years",
          specialty: "Drain cleaning and water heaters",
          image: "https://images.pexels.com/photos/6816829/pexels-photo-6816829.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
      ],
      testimonials: [
        {
          name: "Karen W.",
          context: "Emergency leak repair",
          quote: "They came out the same day and fixed a burst pipe under the sink. Professional, clean, and fair price.",
        },
        {
          name: "Tom S.",
          context: "Water heater replacement",
          quote: "Old water heater died on a Saturday. They had a new one installed by Monday morning. Great communication throughout.",
        },
        {
          name: "Linda F.",
          context: "Drain cleaning",
          quote: "Kitchen drain was completely clogged. They cleared it and showed me the camera footage. Very thorough.",
        },
      ],
      faqs: [
        {
          id: "f1",
          question: "Do you offer emergency service?",
          answer: "Yes — call our emergency line for after-hours and weekend plumbing emergencies.",
        },
        {
          id: "f2",
          question: "Are you licensed and insured?",
          answer: "Every plumber on our team is fully licensed and insured.",
        },
        {
          id: "f3",
          question: "Do you give free estimates?",
          answer: "Yes — we provide free, no-obligation estimates on all plumbing work.",
        },
        {
          id: "f4",
          question: "What areas do you serve?",
          answer: "We serve the local area and surrounding communities. Call to confirm coverage for your location.",
        },
      ],
      emergency: {
        heading: "Plumbing Emergency? Call Now.",
        description: "Burst pipes, major leaks, and sewer backups — we respond fast.",
        ctaLabel: "Call Emergency Line",
      },
      contact: {
        heading: "Request a Quote",
        description: "Tell us about your plumbing issue and we'll get back to you quickly.",
        bookButtonLabel: "Request Service",
        extraServiceOptions: ["Emergency Service", "General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        dealsLede: "Current specials on common plumbing services.",
        team: "Meet Our Plumbers",
      }),
      navLabels: defaultNavLabels("Plumbers"),
      visibility: prospectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Plumber",
      theme,
      businessInfo: {
        name,
        tagline: "",
        founded: new Date().getFullYear(),
        phone: "",
        email: "",
        address: "",
        hours: "Mon-Fri: 7am-6pm",
        emergencyPhone: "",
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: defaultHoursScheduleWeekdayOnly(),
      hero: {
        eyebrowPrefix: "Trusted plumbers since",
        headline: "Reliable plumbing you can count on.",
        lead: "Licensed professionals. Fair prices.",
        primaryCta: "Our Services",
        secondaryCta: "Get a Quote",
        whyTitle: "Why homeowners trust us",
        heroImage: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Licensed and insured.",
          "Upfront pricing.",
          "Same-day service.",
          "Clean worksite.",
        ],
      },
      about: {
        heading: `${name} - Plumbing Done Right`,
        narrative: "Add a short paragraph about your plumbing business.",
        bullets: [
          "Licensed and fully insured",
          "Upfront pricing",
          "Clean up after every job",
        ],
        primaryImage: "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/6816829/pexels-photo-6816829.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Licensed Pros", description: "Fully licensed plumbers." },
          { title: "Upfront Pricing", description: "Quote before we start." },
          { title: "Fast Response", description: "Same-day service available." },
          { title: "Clean Work", description: "We clean up after ourselves." },
        ],
      },
      stats: [
        { label: "Years Experience", value: 10, suffix: "+" },
        { label: "Jobs Completed", value: 1000, suffix: "+" },
        { label: "Happy Homeowners", value: 500, suffix: "+" },
        { label: "Plumbers", value: 3, suffix: "" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      emergency: {
        heading: "Plumbing Emergency? Call Now.",
        description: "We respond fast to burst pipes, major leaks, and sewer backups.",
        ctaLabel: "Call Emergency Line",
      },
      contact: {
        heading: "Request a Quote",
        description: "Tell us about your plumbing issue.",
        bookButtonLabel: "Request Service",
        extraServiceOptions: ["Emergency Service", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        team: "Meet Our Plumbers",
        faq: "Frequently Asked Questions",
      }),
      navLabels: defaultNavLabels("Plumbers"),
      visibility: blankVisibility(),
    };
  },
};
