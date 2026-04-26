import {
  Car,
  Paintbrush,
  Shield,
  Hammer,
  Scan,
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
  collision: Hammer,
  "collision-repair": Hammer,
  paint: Paintbrush,
  painting: Paintbrush,
  dent: Car,
  "dent-repair": Car,
  "paintless-dent": Car,
  pdr: Car,
  frame: Shield,
  "frame-straightening": Shield,
  estimate: Scan,
  "free-estimate": Scan,
  insurance: Shield,
  scratch: Paintbrush,
  bumper: Car,
  restoration: Wrench,
  general: Wrench,
};

export const autoBodyTemplate: VerticalTemplate = {
  id: "auto-body",
  label: "Auto Body Shop",
  categories: [
    "Auto body shop",
    "Auto Body",
    "Car detailing service",
    "Car Detailing",
    "Auto painting service",
  ],
  testimonialContextLabel: "Vehicle",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
    const founded = new Date().getFullYear() - 14;
    const years = new Date().getFullYear() - founded;

    return {
      slug,
      category: "Auto body shop",
      theme,
      businessInfo: {
        name,
        tagline: "Expert collision repair. Factory-quality finish. Every time.",
        founded,
        phone,
        email: "",
        address,
        hours: "Mon-Fri: 8am-6pm, Sat: 8am-1pm",
        emergencyPhone: phone,
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: {
        ...defaultHoursSchedule(),
        sat: { open: "08:00", close: "13:00" },
      },
      hero: {
        eyebrowPrefix: `Trusted since ${founded}`,
        headline: "Your Car Deserves to Look New Again.",
        lead: "Certified collision repair. Insurance-approved. Lifetime warranty on all bodywork.",
        primaryCta: "See Our Services",
        secondaryCta: "Get a Free Estimate",
        whyTitle: "Why drivers choose us",
        heroImage:
          "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "I-CAR Gold certified technicians.",
          "We work with all insurance companies.",
          "Lifetime warranty on paint and bodywork.",
          "Free estimates — no obligation.",
        ],
      },
      about: {
        heading: "Collision Repair Done Right",
        narrative: `${name} has been restoring vehicles to factory condition for over ${years} years. From minor dents to full collision rebuilds, we use the same materials and techniques the manufacturers use. Your car leaves looking like it was never in an accident.`,
        bullets: [
          "Factory-matched paint with computerized color matching",
          "Written lifetime warranty on all bodywork",
          "Direct insurance billing — we handle the paperwork",
        ],
        primaryImage:
          "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage:
          "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Certified Technicians", description: "I-CAR Gold trained — the highest industry standard." },
          { title: "Insurance Approved", description: "We work with every major insurance carrier." },
          { title: "Lifetime Warranty", description: "Our paint and bodywork are guaranteed for life." },
          { title: "Free Estimates", description: "Detailed, no-obligation estimates on every job." },
        ],
      },
      stats: [
        { label: "Years in Business", value: years, suffix: "+" },
        { label: "Vehicles Restored", value: 8000, suffix: "+" },
        { label: "Insurance Partners", value: 20, suffix: "+" },
        { label: "Certified Technicians", value: 5, suffix: "" },
      ],
      services: [
        {
          id: "collision-repair",
          name: "Collision Repair",
          priceRange: "Insurance or custom quote",
          duration: "3–10 business days",
          description: "Full structural and cosmetic repair after an accident. We restore your car to pre-collision condition.",
          features: ["Frame straightening", "Panel replacement", "Structural welding", "Final safety inspection"],
        },
        {
          id: "paint",
          name: "Auto Painting",
          priceRange: "$500–$3,000+",
          duration: "3–7 business days",
          description: "From spot touch-ups to full-vehicle repaints. Computerized color matching for a factory finish.",
          features: ["Computerized color matching", "Base/clear coat system", "Prep and primer", "Buffing and polish"],
        },
        {
          id: "dent-repair",
          name: "Dent Repair",
          priceRange: "$75–$300 per panel",
          duration: "Same day–2 days",
          description: "Remove dents, dings, and hail damage. Paintless dent repair when possible to preserve factory paint.",
          features: ["Paintless dent repair (PDR)", "Conventional dent repair", "Hail damage restoration", "Door ding removal"],
        },
        {
          id: "frame",
          name: "Frame Straightening",
          priceRange: "Custom quote",
          duration: "5–10 business days",
          description: "Precision frame and unibody straightening using computerized measuring systems.",
          features: ["Computerized frame measurement", "Hydraulic straightening", "Alignment verification", "Structural integrity check"],
        },
        {
          id: "scratch",
          name: "Scratch & Scuff Repair",
          priceRange: "$100–$500",
          duration: "Same day–2 days",
          description: "Buff out surface scratches or repaint deeper scuffs. Quick turnaround, factory-quality result.",
          features: ["Surface scratch buffing", "Deep scratch repaint", "Clear coat restoration", "Color-matched touch-up"],
        },
        {
          id: "bumper",
          name: "Bumper Repair & Replacement",
          priceRange: "$200–$800",
          duration: "1–3 business days",
          description: "Repair cracked, dented, or scraped bumpers. Replacement with OEM or aftermarket parts available.",
          features: ["Crack and hole repair", "Scuff and scrape fix", "Full bumper replacement", "Color-matched paint"],
        },
      ],
      deals: [
        {
          id: "d1",
          title: "Free Collision Estimate",
          badge: "Always Free",
          originalPrice: "",
          price: "Free",
          description: "Detailed written estimate on any collision or body damage. No appointment needed.",
        },
        {
          id: "d2",
          title: "Paintless Dent Repair Special",
          badge: "This Month",
          originalPrice: "$150",
          price: "$75",
          description: "Single-panel paintless dent repair. Perfect for door dings and minor dents.",
        },
      ],
      pricing: [
        { id: "dent", name: "Dent Repair (per panel)", price: "$75+", note: "Paintless when possible", popular: true },
        { id: "scratch", name: "Scratch Repair", price: "$100+", note: "Buff or repaint, same-day available", popular: false },
        { id: "bumper", name: "Bumper Repair", price: "$200+", note: "Repair or replace, color-matched", popular: false },
      ],
      teamMembers: [
        {
          name: "Ray",
          role: "Owner & Master Body Technician",
          experience: "20+ years",
          specialty: "Collision repair and frame straightening",
          image: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          name: "Alex",
          role: "Paint Specialist",
          experience: "12+ years",
          specialty: "Custom paint and color matching",
          image: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
      ],
      testimonials: [
        {
          name: "Brian K.",
          context: "2021 Toyota RAV4 — rear-end collision",
          quote: "Got rear-ended and the back end was crushed. They fixed everything perfectly — you can't tell it was ever in an accident. Insurance process was painless too.",
        },
        {
          name: "Jessica M.",
          context: "2019 BMW 3 Series — side swipe",
          quote: "Someone sideswiped my car in a parking lot. The paint match is flawless. They even detailed the car before returning it. First class.",
        },
        {
          name: "Andre T.",
          context: "2022 Ford Bronco — hail damage",
          quote: "Had about 30 dents from a hailstorm. They did paintless dent repair on every one. Saved me thousands compared to a full repaint.",
        },
      ],
      faqs: [
        {
          id: "f1",
          question: "Do you work with my insurance company?",
          answer: "Yes — we work with every major insurance carrier. We'll handle the paperwork, communicate directly with your adjuster, and make sure you're covered.",
        },
        {
          id: "f2",
          question: "How long does collision repair take?",
          answer: "Most repairs take 3–10 business days depending on the severity. We'll give you a clear timeline when you drop off and keep you updated throughout.",
        },
        {
          id: "f3",
          question: "Do you offer a warranty on your work?",
          answer: "Yes — all paint and bodywork comes with a written lifetime warranty. If there's ever an issue with our repair, we'll fix it at no cost.",
        },
        {
          id: "f4",
          question: "Can you match my car's exact paint color?",
          answer: "Absolutely. We use computerized color matching to get the exact factory color code. The repaired area blends seamlessly with the rest of the vehicle.",
        },
        {
          id: "f5",
          question: "Do I need an appointment for an estimate?",
          answer: "No — walk in anytime during business hours. We'll inspect the damage and give you a detailed written estimate on the spot.",
        },
      ],
      photos: [
        { id: "p1", url: "https://images.pexels.com/photos/1409999/pexels-photo-1409999.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Paint booth finish" },
        { id: "p2", url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Precision bodywork" },
        { id: "p3", url: "https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Detail work" },
        { id: "p4", url: "https://images.pexels.com/photos/4489767/pexels-photo-4489767.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Collision repair" },
        { id: "p5", url: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Our facility" },
        { id: "p6", url: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Quality materials" },
      ],
      emergency: {
        heading: "Just Had an Accident? We Can Help.",
        description: "Call us right from the scene. We'll guide you through the next steps and can arrange towing to our shop.",
        ctaLabel: "Call Us Now",
      },
      contact: {
        heading: "Get a Free Estimate",
        description: "Tell us about the damage and we'll get back to you with a quote — or just walk in.",
        bookButtonLabel: "Request Estimate",
        extraServiceOptions: ["Insurance Claim", "General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        dealsLede: "Current specials on body and paint work.",
        team: "Meet Our Technicians",
      }),
      navLabels: defaultNavLabels("Technicians"),
      visibility: prospectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Auto body shop",
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
        eyebrowPrefix: "Trusted body shop since",
        headline: "Your car deserves to look new again.",
        lead: "Certified collision repair. Insurance-approved. Lifetime warranty.",
        primaryCta: "Our Services",
        secondaryCta: "Free Estimate",
        whyTitle: "Why drivers choose us",
        heroImage: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Certified technicians.",
          "All insurance companies accepted.",
          "Lifetime warranty on bodywork.",
          "Free estimates.",
        ],
      },
      about: {
        heading: `${name} - Collision Repair Done Right`,
        narrative: "Add a short paragraph about your body shop.",
        bullets: [
          "Factory-matched paint",
          "Lifetime warranty on bodywork",
          "Insurance billing handled for you",
        ],
        primaryImage: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Certified Technicians", description: "I-CAR Gold trained professionals." },
          { title: "Insurance Approved", description: "We work with all carriers." },
          { title: "Lifetime Warranty", description: "Paint and body guaranteed for life." },
          { title: "Free Estimates", description: "No-obligation, walk in anytime." },
        ],
      },
      stats: [
        { label: "Years Experience", value: 10, suffix: "+" },
        { label: "Vehicles Restored", value: 2000, suffix: "+" },
        { label: "Insurance Partners", value: 15, suffix: "+" },
        { label: "Technicians", value: 4, suffix: "" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Just Had an Accident? Call Us.",
        description: "We'll guide you through the next steps and arrange towing if needed.",
        ctaLabel: "Call Now",
      },
      contact: {
        heading: "Get a Free Estimate",
        description: "Walk in or describe the damage and we'll quote you.",
        bookButtonLabel: "Request Estimate",
        extraServiceOptions: ["Insurance Claim", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        team: "Meet Our Technicians",
        faq: "Frequently Asked Questions",
      }),
      navLabels: defaultNavLabels("Technicians"),
      visibility: blankVisibility(),
    };
  },
};
