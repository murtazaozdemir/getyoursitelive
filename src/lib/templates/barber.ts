import {
  Scissors,
  Sparkles,
  Crown,
  Clock,
  Baby,
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
  haircut: Scissors,
  "mens-cut": Scissors,
  "kids-cut": Baby,
  fade: Sparkles,
  shave: Sparkles,
  beard: Crown,
  "hot-towel": Sparkles,
  lineup: Scissors,
  general: Wrench,
};

export const barberTemplate: VerticalTemplate = {
  id: "barber",
  label: "Barber Shop",
  categories: [
    "Barber shop",
    "Hair salon",
    "Beauty salon",
    "Men's hair salon",
  ],
  testimonialContextLabel: "Service",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
    const founded = new Date().getFullYear() - 8;
    const years = new Date().getFullYear() - founded;

    return {
      slug,
      category: "Barber shop",
      theme,
      businessInfo: {
        name,
        tagline: "Clean cuts. Classic service. No rush.",
        founded,
        phone,
        email: "",
        address,
        hours: "Mon-Sat: 9am-7pm",
        emergencyPhone: phone,
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: {
        mon: { open: "09:00", close: "19:00" },
        tue: { open: "09:00", close: "19:00" },
        wed: { open: "09:00", close: "19:00" },
        thu: { open: "09:00", close: "19:00" },
        fri: { open: "09:00", close: "19:00" },
        sat: { open: "09:00", close: "17:00" },
        sun: null,
      },
      hero: {
        eyebrowPrefix: `Serving the neighborhood since ${founded}`,
        headline: "Your Look, Our Craft.",
        lead: "Skilled barbers. Walk-ins welcome. Always a clean fade.",
        primaryCta: "See Our Services",
        secondaryCta: "Book an Appointment",
        whyTitle: "Why clients keep coming back",
        heroImage:
          "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Experienced barbers who listen.",
          "Walk-ins always welcome.",
          "Clean, comfortable shop.",
          "Fair prices, every time.",
        ],
      },
      about: {
        heading: "More Than Just a Haircut",
        narrative: `${name} has been the neighborhood go-to for over ${years} years. We take our time with every client — no rush, no assembly line. Just quality cuts and real conversation.`,
        bullets: [
          "Skilled barbers with years of experience",
          "Walk-ins welcome, appointments available",
          "Clean and comfortable environment",
        ],
        primaryImage:
          "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage:
          "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Expert Barbers", description: "Trained in classic and modern styles." },
          { title: "Walk-Ins Welcome", description: "No appointment needed — just come in." },
          { title: "Clean Shop", description: "Sanitized tools and a welcoming atmosphere." },
          { title: "Fair Prices", description: "Quality cuts at honest prices." },
        ],
      },
      stats: [
        { label: "Years in Business", value: years, suffix: "+" },
        { label: "Happy Clients", value: 800, suffix: "+" },
        { label: "Cuts This Year", value: 3000, suffix: "+" },
        { label: "Barbers on Staff", value: 3, suffix: "" },
      ],
      services: [
        {
          id: "mens-cut",
          name: "Men's Haircut",
          priceRange: "$20–$35",
          duration: "30 min",
          description: "Classic or modern cut tailored to your style.",
          features: ["Consultation", "Cut & style", "Hot towel finish", "Product recommendations"],
        },
        {
          id: "fade",
          name: "Fade & Taper",
          priceRange: "$25–$40",
          duration: "30–45 min",
          description: "Precision fades from skin to high, blended perfectly.",
          features: ["Skin, low, mid, or high fade", "Edge lineup", "Neck taper", "Style finish"],
        },
        {
          id: "beard",
          name: "Beard Trim & Shape",
          priceRange: "$15–$25",
          duration: "15–20 min",
          description: "Precise beard trimming, shaping, and lineup.",
          features: ["Trim to desired length", "Neckline cleanup", "Cheek line shape", "Beard oil finish"],
        },
        {
          id: "shave",
          name: "Hot Towel Shave",
          priceRange: "$30–$45",
          duration: "30 min",
          description: "Traditional straight razor shave with hot towels.",
          features: ["Hot towel prep", "Straight razor shave", "After-shave treatment", "Moisturizer"],
        },
        {
          id: "kids-cut",
          name: "Kids' Haircut",
          priceRange: "$15–$25",
          duration: "20 min",
          description: "Patient, friendly cuts for kids of all ages.",
          features: ["Age-appropriate styles", "Patient barbers", "Fun experience", "Lollipop included"],
        },
      ],
      deals: [
        {
          id: "d1",
          title: "First Visit Special",
          badge: "New Clients",
          originalPrice: "$35",
          price: "$20",
          description: "First haircut at a special rate. Walk in anytime.",
        },
        {
          id: "d2",
          title: "Father & Son Combo",
          badge: "Save",
          originalPrice: "$60",
          price: "$45",
          description: "Two cuts, one price. Come in together and save.",
        },
      ],
      pricing: [
        { id: "haircut", name: "Men's Haircut", price: "$25", note: "Cut, style, and hot towel", popular: true },
        { id: "beard", name: "Beard Trim", price: "$15", note: "Trim, shape, and oil", popular: false },
        { id: "combo", name: "Cut + Beard", price: "$35", note: "Full haircut plus beard trim", popular: false },
      ],
      teamMembers: [
        {
          name: "Tony",
          role: "Owner & Head Barber",
          experience: "12+ years",
          specialty: "Fades and classic cuts",
          image: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          name: "Marco",
          role: "Senior Barber",
          experience: "8+ years",
          specialty: "Beard grooming and designs",
          image: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
      ],
      testimonials: [
        {
          name: "James T.",
          context: "Fade & lineup",
          quote: "Best fade I've ever gotten. Tony takes his time and gets it right every time.",
        },
        {
          name: "David M.",
          context: "Beard trim",
          quote: "Clean shop, friendly staff, and my beard has never looked better. Highly recommend.",
        },
        {
          name: "Chris P.",
          context: "Kid's haircut",
          quote: "They were so patient with my 4-year-old. He actually enjoyed getting his hair cut for once.",
        },
      ],
      faqs: [
        {
          id: "f1",
          question: "Do I need an appointment?",
          answer: "Walk-ins are always welcome. For guaranteed wait-free service, book online or call ahead.",
        },
        {
          id: "f2",
          question: "How long does a haircut take?",
          answer: "Most cuts take 25–35 minutes. We don't rush — you get the time you need.",
        },
        {
          id: "f3",
          question: "Do you cut kids' hair?",
          answer: "Absolutely. Our barbers are patient and experienced with kids of all ages.",
        },
        {
          id: "f4",
          question: "What forms of payment do you accept?",
          answer: "Cash, credit cards, debit cards, and most mobile payment apps.",
        },
      ],
      photos: [
        { id: "p1", url: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Classic cut" },
        { id: "p2", url: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Precision fade" },
        { id: "p3", url: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Beard trim" },
        { id: "p4", url: "https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Hot towel shave" },
        { id: "p5", url: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Our shop" },
        { id: "p6", url: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Styled and ready" },
      ],
      emergency: {
        heading: "Last-Minute Appointment? Call Us.",
        description: "We fit walk-ins between appointments whenever we can.",
        ctaLabel: "Call Now",
      },
      contact: {
        heading: "Book Your Cut",
        description: "Walk in or schedule ahead — either way, you'll leave looking sharp.",
        bookButtonLabel: "Book Appointment",
        extraServiceOptions: ["General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        dealsLede: "Special offers for new and returning clients.",
        team: "Meet Our Barbers",
      }),
      navLabels: defaultNavLabels("Barbers"),
      visibility: prospectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Barber shop",
      theme,
      businessInfo: {
        name,
        tagline: "",
        founded: new Date().getFullYear(),
        phone: "",
        email: "",
        address: "",
        hours: "Mon-Sat: 9am-7pm",
        emergencyPhone: "",
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: defaultHoursScheduleWeekdayOnly(),
      hero: {
        eyebrowPrefix: "Your neighborhood barber since",
        headline: "Your look, our craft.",
        lead: "Walk-ins welcome. Appointments available.",
        primaryCta: "Our Services",
        secondaryCta: "Book Now",
        whyTitle: "Why clients choose us",
        heroImage: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Experienced barbers.",
          "Walk-ins always welcome.",
          "Clean, comfortable shop.",
          "Fair prices.",
        ],
      },
      about: {
        heading: `${name} - More Than Just a Haircut`,
        narrative: "Add a short paragraph about your shop.",
        bullets: [
          "Skilled barbers with years of experience",
          "Walk-ins welcome",
          "Clean and comfortable environment",
        ],
        primaryImage: "https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Expert Barbers", description: "Classic and modern styles." },
          { title: "Walk-Ins Welcome", description: "No appointment needed." },
          { title: "Clean Shop", description: "Sanitized tools, welcoming vibe." },
          { title: "Fair Prices", description: "Quality at honest prices." },
        ],
      },
      stats: [
        { label: "Years Experience", value: 10, suffix: "+" },
        { label: "Happy Clients", value: 500, suffix: "+" },
        { label: "Cuts Done", value: 2000, suffix: "+" },
        { label: "Barbers", value: 3, suffix: "" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Need a Walk-In? Come On By.",
        description: "No appointment needed. Walk-ins welcome during business hours.",
        ctaLabel: "Call Now",
      },
      contact: {
        heading: "Book Your Cut",
        description: "Walk in or schedule ahead.",
        bookButtonLabel: "Book Appointment",
        extraServiceOptions: ["General Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        team: "Meet Our Barbers",
        faq: "Frequently Asked Questions",
      }),
      navLabels: defaultNavLabels("Barbers"),
      visibility: blankVisibility(),
    };
  },
};
