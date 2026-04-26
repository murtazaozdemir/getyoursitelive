import { Wrench, type LucideIcon } from "lucide-react";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import type { VerticalTemplate } from "./types";
import {
  defaultHoursSchedule,
  defaultHoursScheduleWeekdayOnly,
  defaultFooter,
  defaultNavLabels,
  defaultSectionTitles,
  minimalProspectVisibility,
  blankVisibility,
} from "./shared";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  general: Wrench,
};

export const genericTemplate: VerticalTemplate = {
  id: "generic",
  label: "Local Business",
  categories: [],
  testimonialContextLabel: "Service",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
    const founded = new Date().getFullYear() - 5;

    return {
      slug,
      category: "Local business",
      theme,
      businessInfo: {
        name,
        tagline: "Honest service. Real professionals. No surprises.",
        founded,
        phone,
        email: "",
        address,
        hours: "Mon-Fri: 9am-5pm",
        emergencyPhone: phone,
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: defaultHoursSchedule(),
      hero: {
        eyebrowPrefix: `Serving the community since ${founded}`,
        headline: "Quality Service You Can Trust.",
        lead: "Experienced professionals. Fair pricing. No surprises.",
        primaryCta: "See Our Services",
        secondaryCta: "Request an Estimate",
        whyTitle: "Why customers keep coming back",
        heroImage:
          "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Honest, upfront pricing.",
          "Fast turnaround on most jobs.",
          "Quality work and materials.",
          "Friendly, professional service.",
        ],
      },
      about: {
        heading: "Where Expertise Meets Honesty",
        narrative: `${name} has been serving the local community.`,
        bullets: [
          "Quality work at fair prices",
          "Written estimates before any work begins",
          "No surprise pricing",
        ],
        primaryImage:
          "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage:
          "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Quality Work", description: "We take pride in every job." },
          { title: "Fair Pricing", description: "Competitive rates with no hidden fees." },
          { title: "Fast Service", description: "Quick turnaround without cutting corners." },
          { title: "Satisfaction Guaranteed", description: "We stand behind our work." },
        ],
      },
      stats: [
        { label: "Years in Business", value: 5, suffix: "+" },
        { label: "Satisfied Customers", value: 500, suffix: "+" },
        { label: "Jobs Completed", value: 2000, suffix: "+" },
        { label: "Team Members", value: 3, suffix: "" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Need Help? We're Here for You.",
        description: "Contact us for assistance.",
        ctaLabel: "Call Us Now",
      },
      contact: {
        heading: "Get in Touch",
        description: "Tell us what you need.",
        bookButtonLabel: "Contact Us",
        extraServiceOptions: ["General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles(),
      navLabels: defaultNavLabels(),
      visibility: minimalProspectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Local business",
      theme,
      businessInfo: {
        name,
        tagline: "",
        founded: new Date().getFullYear(),
        phone: "",
        email: "",
        address: "",
        hours: "Mon-Fri: 9am-5pm",
        emergencyPhone: "",
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: defaultHoursScheduleWeekdayOnly(),
      hero: {
        eyebrowPrefix: "Serving the community since",
        headline: "Quality service you can count on.",
        lead: "Experienced professionals ready to help.",
        primaryCta: "Our Services",
        secondaryCta: "Get in Touch",
        whyTitle: "Why customers choose us",
        heroImage: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Honest, upfront pricing.",
          "Fast turnaround.",
          "Quality work guaranteed.",
          "Friendly, professional staff.",
        ],
      },
      about: {
        heading: `${name} - Where Quality Meets Service`,
        narrative: "Add a short paragraph about your business — who you are, where you're based, what you stand for.",
        bullets: [
          "Quality work at fair prices",
          "Clear communication every step of the way",
          "No surprise pricing",
        ],
        primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Quality Work", description: "We take pride in every job." },
          { title: "Fair Pricing", description: "Competitive rates with no hidden fees." },
          { title: "Fast Service", description: "Quick turnaround without cutting corners." },
          { title: "Satisfaction Guaranteed", description: "We stand behind our work." },
        ],
      },
      stats: [
        { label: "Years Experience", value: 10, suffix: "+" },
        { label: "Happy Clients", value: 500, suffix: "+" },
        { label: "Jobs Done", value: 2000, suffix: "+" },
        { label: "Team Members", value: 3, suffix: "+" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Need Help? We're Here.",
        description: "Contact us anytime for assistance.",
        ctaLabel: "Call Now",
      },
      contact: {
        heading: "Get in Touch",
        description: "Tell us what you need and we'll get back to you quickly.",
        bookButtonLabel: "Send Message",
        extraServiceOptions: ["General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles(),
      navLabels: defaultNavLabels(),
      visibility: blankVisibility(),
    };
  },
};
