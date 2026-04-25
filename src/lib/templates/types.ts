import type { Business } from "@/lib/business-types";
import type { ThemeName } from "@/types/site";
import type { LucideIcon } from "lucide-react";

export interface VerticalTemplate {
  id: string;
  label: string;
  categories: string[];
  testimonialContextLabel: string;
  serviceIcons: Record<string, LucideIcon>;
  buildProspectBusiness(slug: string, name: string, phone: string, address: string): Business;
  buildBlankBusiness(slug: string, name: string, theme: ThemeName): Business;
}
