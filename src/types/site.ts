export type ThemeName = "industrial" | "modern" | "luxury" | "friendly";

export interface BusinessInfo {
  name: string;
  tagline: string;
  founded: number;
  phone: string;
  email: string;
  address: string;
  hours: string;
  emergencyPhone: string;
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
  vehicle: string;
  quote: string;
}
