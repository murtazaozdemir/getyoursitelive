import { BusinessInfo, ServiceItem, TeamMember, Testimonial } from "@/types/site";

export const businessInfo: BusinessInfo = {
  name: "Precision Auto Care",
  tagline: "Expert Hands. Honest Service. Since 2009.",
  founded: 2009,
  phone: "(555) 832-4826",
  emergencyPhone: "(555) 832-4800",
  email: "service@precisionautocare.com",
  address: "1234 Main Street, Springfield, IL 62701",
  hours: "Mon-Fri: 7am-7pm, Sat: 8am-4pm, Sun: Closed",
  social: {
    facebook: "https://facebook.com/precisionauto",
    instagram: "https://instagram.com/precisionauto",
    linkedin: "https://linkedin.com/company/precisionauto",
    youtube: "https://youtube.com/@precisionauto",
  },
};

export const services: ServiceItem[] = [
  {
    id: "diagnostic",
    name: "Complete Diagnostic",
    priceRange: "$89-$149",
    duration: "45-60 min",
    description:
      "Pinpoint warning lights and hidden drivability issues with a full-system digital scan and technician-led road test.",
    features: [
      "Factory-level scan tool report",
      "Check engine and emissions diagnosis",
      "Photo-backed inspection notes",
      "Clear repair priority plan",
    ],
  },
  {
    id: "brakes",
    name: "Brake Service",
    priceRange: "$149-$399",
    duration: "1-2 hours",
    description:
      "Restore confident stopping power with precision brake work for pads, rotors, hydraulics, and electronic brake systems.",
    features: [
      "Premium ceramic pad options",
      "Rotor resurfacing or replacement",
      "Brake fluid condition test",
      "Noise and vibration correction",
    ],
  },
  {
    id: "oil",
    name: "Oil Change",
    priceRange: "$49-$89",
    duration: "30 min",
    description:
      "Protect your engine with the right synthetic blend and an expert 27-point check every visit.",
    features: [
      "Synthetic blend or full synthetic",
      "Premium filter replacement",
      "Fluid top-off and tire pressure set",
      "27-point safety inspection",
    ],
  },
  {
    id: "transmission",
    name: "Transmission Service",
    priceRange: "$199-$349",
    duration: "1.5-2 hours",
    description:
      "Prevent costly failures with proactive transmission maintenance, fluid exchange, and shift-quality diagnostics.",
    features: [
      "Fluid exchange and filter service",
      "Leak and seal inspection",
      "Shift adaptation check",
      "Road-tested performance verification",
    ],
  },
  {
    id: "ac",
    name: "AC Repair",
    priceRange: "$129-$599",
    duration: "1-3 hours",
    description:
      "Stay cool in Illinois summers with leak detection, recharge service, and component-level AC repairs.",
    features: [
      "Refrigerant recovery and recharge",
      "UV dye leak detection",
      "Compressor and condenser checks",
      "Cabin airflow performance test",
    ],
  },
  {
    id: "tires",
    name: "Tire Service",
    priceRange: "$79-$249",
    duration: "45-90 min",
    description:
      "Extend tire life and improve handling with accurate balancing, alignment checks, and on-the-spot repairs.",
    features: [
      "Rotation and computer balancing",
      "Flat repair and pressure reset",
      "Alignment angle inspection",
      "Tread-depth and wear analysis",
    ],
  },
];

export const teamMembers: TeamMember[] = [
  {
    name: "Mike Thompson",
    role: "Master Technician",
    experience: "18+ years",
    specialty: "BMW and European systems specialist",
    image:
      "https://images.unsplash.com/photo-1612277795421-9bc7706a4a41?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Sarah Chen",
    role: "Lead Diagnostic Specialist",
    experience: "12+ years",
    specialty: "Hybrid and electric drivability expert",
    image:
      "https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Carlos Rivera",
    role: "Transmission Expert",
    experience: "22+ years",
    specialty: "Third-generation mechanic and rebuild lead",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Amanda Brooks",
    role: "Service Advisor",
    experience: "8+ years",
    specialty: "Customer communication and repair planning",
    image:
      "https://images.unsplash.com/photo-1601412436009-d964bd02edbc?auto=format&fit=crop&w=1200&q=80",
  },
];

export const testimonials: Testimonial[] = [
  {
    name: "Jason Miller",
    vehicle: "2018 Honda Accord",
    quote:
      "They showed me brake photos before touching anything, gave a clear quote, and had me back on the road by lunch.",
  },
  {
    name: "Nicole Ramirez",
    vehicle: "2020 Toyota RAV4",
    quote:
      "Our AC failed the day before a family trip. Precision diagnosed the leak quickly and fixed it same day.",
  },
  {
    name: "Darren Woods",
    vehicle: "2016 Ford F-150",
    quote:
      "Transmission shifts were rough for weeks. Their team explained every step and solved it without upselling.",
  },
];
