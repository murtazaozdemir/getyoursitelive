import {
  UtensilsCrossed,
  Wine,
  Salad,
  Beef,
  CakeSlice,
  Coffee,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import type { VerticalTemplate } from "./types";
import {
  defaultFooter,
  defaultNavLabels,
  defaultSectionTitles,
  prospectVisibility,
  blankVisibility,
} from "./shared";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  dinner: UtensilsCrossed,
  lunch: UtensilsCrossed,
  breakfast: Coffee,
  brunch: Coffee,
  appetizers: Salad,
  salads: Salad,
  entrees: Beef,
  steaks: Beef,
  desserts: CakeSlice,
  drinks: Wine,
  wine: Wine,
  bar: Wine,
  catering: UtensilsCrossed,
  general: Wrench,
};

export const restaurantTemplate: VerticalTemplate = {
  id: "restaurant",
  label: "Restaurant",
  categories: [
    "Restaurant",
    "Pizza restaurant",
    "Italian restaurant",
    "Mexican restaurant",
    "Chinese restaurant",
    "Thai restaurant",
    "Indian restaurant",
    "Japanese restaurant",
    "Sushi restaurant",
    "Seafood restaurant",
    "Steak house",
    "Diner",
    "Cafe",
    "Coffee shop",
    "Bakery",
    "Fast food restaurant",
    "Food truck",
    "Deli",
    "Sandwich shop",
  ],
  testimonialContextLabel: "Visit",
  serviceIcons: SERVICE_ICONS,

  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business {
    const theme: ThemeName = "modern";
    const founded = new Date().getFullYear() - 7;
    const years = new Date().getFullYear() - founded;

    return {
      slug,
      category: "Restaurant",
      theme,
      businessInfo: {
        name,
        tagline: "Fresh food. Real flavors. Every day.",
        founded,
        phone,
        email: "",
        address,
        hours: "Mon-Sun: 11am-10pm",
        emergencyPhone: phone,
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: {
        mon: { open: "11:00", close: "22:00" },
        tue: { open: "11:00", close: "22:00" },
        wed: { open: "11:00", close: "22:00" },
        thu: { open: "11:00", close: "22:00" },
        fri: { open: "11:00", close: "23:00" },
        sat: { open: "11:00", close: "23:00" },
        sun: { open: "11:00", close: "21:00" },
      },
      hero: {
        eyebrowPrefix: `A local favorite since ${founded}`,
        headline: "Great Food, Made Fresh.",
        lead: "Quality ingredients. Cooked with care. Served with a smile.",
        primaryCta: "See Our Menu",
        secondaryCta: "Make a Reservation",
        whyTitle: "Why diners love us",
        heroImage:
          "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Fresh ingredients, made to order.",
          "Warm, welcoming atmosphere.",
          "Friendly staff who care.",
          "Fair prices on every plate.",
        ],
      },
      about: {
        heading: "Where Good Food Brings People Together",
        narrative: `${name} has been serving the neighborhood for over ${years} years. Every dish is made with fresh ingredients and real passion. We believe food should be honest — no shortcuts, no pretense.`,
        bullets: [
          "Fresh, quality ingredients every day",
          "Something for every taste",
          "Family-friendly atmosphere",
        ],
        primaryImage:
          "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage:
          "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Fresh Daily", description: "Ingredients sourced fresh every morning." },
          { title: "Made to Order", description: "Every dish prepared when you order it." },
          { title: "Family Friendly", description: "Welcoming to groups and families of all sizes." },
          { title: "Great Value", description: "Generous portions at fair prices." },
        ],
      },
      stats: [
        { label: "Years Open", value: years, suffix: "+" },
        { label: "Happy Diners", value: 5000, suffix: "+" },
        { label: "Menu Items", value: 40, suffix: "+" },
        { label: "Kitchen Staff", value: 5, suffix: "" },
      ],
      services: [
        {
          id: "lunch",
          name: "Lunch",
          priceRange: "$10–$18",
          duration: "11am–3pm",
          description: "Midday favorites from salads to sandwiches to full entrees.",
          features: ["Daily specials", "Quick service", "Dine-in or takeout", "Group-friendly"],
        },
        {
          id: "dinner",
          name: "Dinner",
          priceRange: "$15–$30",
          duration: "5pm–close",
          description: "Full dinner service with appetizers, entrees, and desserts.",
          features: ["Chef specials nightly", "Full bar available", "Reservations recommended", "Private dining option"],
        },
        {
          id: "catering",
          name: "Catering",
          priceRange: "Custom quote",
          duration: "Flexible",
          description: "Let us cater your next event — from small gatherings to large parties.",
          features: ["Custom menus", "Delivery available", "Setup and cleanup", "Dietary accommodations"],
        },
      ],
      deals: [
        {
          id: "d1",
          title: "Weekday Lunch Special",
          badge: "Mon–Fri",
          originalPrice: "$18",
          price: "$12",
          description: "Entree + drink combo, Monday through Friday, 11am–3pm.",
        },
        {
          id: "d2",
          title: "Family Night",
          badge: "Thursdays",
          originalPrice: "",
          price: "Kids Eat Free",
          description: "Kids under 12 eat free with every adult entree on Thursdays.",
        },
      ],
      pricing: [
        { id: "lunch", name: "Lunch Entree", price: "$12", note: "Salad or soup included", popular: true },
        { id: "dinner", name: "Dinner Entree", price: "$22", note: "Bread basket + side", popular: false },
        { id: "dessert", name: "Desserts", price: "$8", note: "House-made daily", popular: false },
      ],
      teamMembers: [
        {
          name: "Chef Ana",
          role: "Head Chef",
          experience: "15+ years",
          specialty: "Mediterranean and seasonal cuisine",
          image: "https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        {
          name: "Luis",
          role: "General Manager",
          experience: "10+ years",
          specialty: "Hospitality and guest experience",
          image: "https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
      ],
      testimonials: [
        {
          name: "Sarah K.",
          context: "Dinner for two",
          quote: "Amazing food and even better service. The pasta was the best I've had outside of Italy.",
        },
        {
          name: "Mike R.",
          context: "Family dinner",
          quote: "Great place for families. Kids loved the food, and the staff was incredibly patient and friendly.",
        },
        {
          name: "Priya T.",
          context: "Takeout order",
          quote: "Ordered takeout on a Friday night — everything arrived hot and tasted incredible. Will be ordering again.",
        },
      ],
      faqs: [
        {
          id: "f1",
          question: "Do you take reservations?",
          answer: "Yes — call or book online. Walk-ins are welcome but reservations guarantee your table.",
        },
        {
          id: "f2",
          question: "Do you offer takeout or delivery?",
          answer: "Yes to both. Order by phone or through our website.",
        },
        {
          id: "f3",
          question: "Can you accommodate dietary restrictions?",
          answer: "Absolutely. We offer vegetarian, vegan, and gluten-free options. Let your server know.",
        },
        {
          id: "f4",
          question: "Do you cater events?",
          answer: "Yes — from small gatherings to large parties. Call us to discuss a custom menu.",
        },
      ],
      photos: [
        { id: "p1", url: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Fresh from the kitchen" },
        { id: "p2", url: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Our dining room" },
        { id: "p3", url: "https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Signature dish" },
        { id: "p4", url: "https://images.pexels.com/photos/2253643/pexels-photo-2253643.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Dessert selection" },
        { id: "p5", url: "https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Bar area" },
        { id: "p6", url: "https://images.pexels.com/photos/2544829/pexels-photo-2544829.jpeg?auto=compress&cs=tinysrgb&w=800", caption: "Chef at work" },
      ],
      emergency: {
        heading: "Large Party? Let Us Know Ahead.",
        description: "Call to arrange seating for groups of 8 or more.",
        ctaLabel: "Call Us",
      },
      contact: {
        heading: "Make a Reservation",
        description: "Book a table or inquire about catering and events.",
        bookButtonLabel: "Reserve a Table",
        extraServiceOptions: ["Catering Inquiry", "Private Event", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        services: "Our Menu",
        dealsLede: "Weekly specials and limited-time offers.",
        team: "Meet Our Team",
      }),
      navLabels: defaultNavLabels("Team"),
      visibility: prospectVisibility(),
    };
  },

  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business {
    return {
      slug,
      category: "Restaurant",
      theme,
      businessInfo: {
        name,
        tagline: "",
        founded: new Date().getFullYear(),
        phone: "",
        email: "",
        address: "",
        hours: "Mon-Sun: 11am-10pm",
        emergencyPhone: "",
        logoUrl: "",
        social: { facebook: "", instagram: "", linkedin: "", youtube: "" },
      },
      hoursSchedule: {
        mon: { open: "11:00", close: "22:00" },
        tue: { open: "11:00", close: "22:00" },
        wed: { open: "11:00", close: "22:00" },
        thu: { open: "11:00", close: "22:00" },
        fri: { open: "11:00", close: "23:00" },
        sat: { open: "11:00", close: "23:00" },
        sun: { open: "11:00", close: "21:00" },
      },
      hero: {
        eyebrowPrefix: "Serving the community since",
        headline: "Great food, made fresh.",
        lead: "Quality ingredients. Cooked with care.",
        primaryCta: "See Our Menu",
        secondaryCta: "Reserve a Table",
        whyTitle: "Why diners love us",
        heroImage: "https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyBullets: [
          "Fresh ingredients daily.",
          "Warm atmosphere.",
          "Friendly service.",
          "Fair prices.",
        ],
      },
      about: {
        heading: `${name} - Where Good Food Brings People Together`,
        narrative: "Add a short paragraph about your restaurant.",
        bullets: [
          "Fresh, quality ingredients",
          "Something for every taste",
          "Family-friendly atmosphere",
        ],
        primaryImage: "https://images.pexels.com/photos/1058277/pexels-photo-1058277.jpeg?auto=compress&cs=tinysrgb&w=1400",
        secondaryImage: "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1400",
        whyUsCards: [
          { title: "Fresh Daily", description: "Ingredients sourced fresh every morning." },
          { title: "Made to Order", description: "Every dish prepared when you order." },
          { title: "Family Friendly", description: "Welcoming to all." },
          { title: "Great Value", description: "Generous portions, fair prices." },
        ],
      },
      stats: [
        { label: "Years Open", value: 5, suffix: "+" },
        { label: "Happy Diners", value: 1000, suffix: "+" },
        { label: "Menu Items", value: 30, suffix: "+" },
        { label: "Staff", value: 5, suffix: "" },
      ],
      services: [],
      deals: [],
      pricing: [],
      teamMembers: [],
      testimonials: [],
      faqs: [],
      photos: [],
      emergency: {
        heading: "Large Party? Call Ahead.",
        description: "We accommodate groups with advance notice.",
        ctaLabel: "Call Us",
      },
      contact: {
        heading: "Make a Reservation",
        description: "Book a table or ask about events.",
        bookButtonLabel: "Reserve a Table",
        extraServiceOptions: ["Catering Inquiry", "Other"],
      },
      footer: defaultFooter(),
      sectionTitles: defaultSectionTitles({
        services: "Our Menu",
        team: "Meet Our Team",
        faq: "Frequently Asked Questions",
      }),
      navLabels: defaultNavLabels("Team"),
      visibility: blankVisibility(),
    };
  },
};
