import {
  Activity,
  Circle,
  Cog,
  Disc3,
  Droplets,
  Snowflake,
  ClipboardCheck,
  Gauge,
  Wrench,
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
  diagnostic: Gauge,
  diagnostics: Gauge,
  brakes: Disc3,
  brake: Disc3,
  oil: Droplets,
  transmission: Cog,
  ac: Snowflake,
  hvac: Snowflake,
  tires: Circle,
  tire: Circle,
  alignment: Activity,
  inspection: ClipboardCheck,
  general: Wrench,
};

export const autoRepairTemplate: VerticalTemplate = {
  id: "auto-repair",
  label: "Auto Repair Shop",
  categories: [
    "Car repair and maintenance service",
    "Car Repair & Maintenance",
    "Auto Repair",
    "Auto Sales & Repair",
    "Auto Tune Up",
    "Mobile Mechanic",
    "Scooter & Moto Repair",
    "Tire shop",
    "Auto repair shop",
    "Mechanic",
    "Transmission shop",
    "Brake shop",
    "Oil change service",
    "Muffler shop",
    "Auto electrical service",
    "Auto glass shop",
    "Auto air conditioning service",
    "Truck repair shop",
    "Diesel engine repair service",
    "Auto radiator repair service",
  ],
  testimonialContextLabel: "Vehicle",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
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
      hoursSchedule: defaultHoursSchedule(),
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
          "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
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
          context: "2020 Toyota Camry",
          quote: "Best mechanic shop in the area. Upfront about the cost and finished faster than expected. Will definitely be back.",
        },
        {
          name: "Maria L.",
          context: "2018 Honda CR-V",
          quote: "Took my car in for a brake job. They showed me photos of the worn pads and explained everything. Fair price, great work.",
        },
        {
          name: "Carlos R.",
          context: "2017 Ford F-150",
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
          answer: "Walk-ins are welcome, but scheduling online ensures minimal wait time.",
        },
        {
          id: "f3",
          question: "What warranty do you offer?",
          answer: "All repairs come with a 24-month / 24,000-mile parts and labor warranty.",
        },
        {
          id: "f4",
          question: "Do you offer loaner cars?",
          answer: "Yes — call ahead and we'll arrange a loaner for longer repairs.",
        },
      ],
      photos: [],
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
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        dealsLede: "Limited-time offers on common repairs.",
        team: "Meet Our Technicians",
      }),
      navLabels: defaultNavLabels("Technicians"),
      visibility: prospectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Car repair and maintenance service",
      theme,
      businessInfo: {
        name,
        tagline: "",
        founded: new Date().getFullYear(),
        phone: "",
        email: "",
        address: "",
        hours: "Mon-Fri: 8am-6pm",
        emergencyPhone: "",
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: defaultHoursScheduleWeekdayOnly(),
      hero: {
        eyebrowPrefix: "Family-owned since",
        headline: "Expert care for your vehicle.",
        lead: "Same-day service, clear communication, and repairs performed by ASE-certified technicians.",
        primaryCta: "Explore Services",
        secondaryCta: "Request Estimate",
        whyTitle: "Why our customers choose us",
        heroImage: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Photo-backed diagnostics before any repair.",
          "Same-day turnaround on most repairs.",
          "24-month / 24,000-mile warranty on parts and labor.",
          "Friendly advisors who explain options in plain language.",
        ],
      },
      about: {
        heading: `${name} - Where Expertise Meets Honesty`,
        narrative: "Add a short paragraph about your shop — who you are, where you're based, what you stand for.",
        bullets: [
          "Free digital inspections with photos and videos",
          "Written warranties on parts and labor",
          "No surprise pricing before work begins",
        ],
        primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Honest Diagnostics", description: "We show photos of every issue before recommending repairs." },
          { title: "Same-Day Service", description: "Most repairs are completed in 24 hours." },
          { title: "Digital Updates", description: "Text and email progress reports from check-in to pickup." },
          { title: "2-Year Warranty", description: "24,000-mile parts and labor protection included." },
        ],
      },
      stats: [
        { label: "Years Experience", value: 15, suffix: "+" },
        { label: "Happy Clients", value: 1000, suffix: "+" },
        { label: "Services Done", value: 5000, suffix: "+" },
        { label: "Expert Technicians", value: 3, suffix: "+" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Car Won't Start? We're Here 24/7.",
        description: "Emergency towing, after-hours repairs, and loaner car options available.",
        ctaLabel: "Call Emergency Line",
      },
      contact: {
        heading: "Request Service",
        description: "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.",
        bookButtonLabel: "Book Service",
        extraServiceOptions: ["General Inspection", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        dealsLede: "Limited-time offers. Mention this page when you book.",
        team: "Meet Our Technicians",
        faq: "Frequently Asked Questions",
      }),
      navLabels: defaultNavLabels("Technicians"),
      visibility: blankVisibility(),
    };
  },
};
