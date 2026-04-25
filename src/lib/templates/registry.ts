import type { VerticalTemplate } from "./types";
import { autoRepairTemplate } from "./auto-repair";
import { autoBodyTemplate } from "./auto-body";
import { barberTemplate } from "./barber";
import { restaurantTemplate } from "./restaurant";
import { plumberTemplate } from "./plumber";
import { genericTemplate } from "./generic";

const ALL_TEMPLATES: VerticalTemplate[] = [
  autoRepairTemplate,
  autoBodyTemplate,
  barberTemplate,
  restaurantTemplate,
  plumberTemplate,
];

const categoryIndex = new Map<string, VerticalTemplate>();
for (const t of ALL_TEMPLATES) {
  for (const cat of t.categories) {
    categoryIndex.set(cat.toLowerCase(), t);
  }
}

export function getTemplateForCategory(category: string): VerticalTemplate {
  return categoryIndex.get(category.toLowerCase()) ?? genericTemplate;
}

export function isCategoryMapped(category: string): boolean {
  return categoryIndex.has(category.toLowerCase());
}

export function getAllTemplates(): VerticalTemplate[] {
  return ALL_TEMPLATES;
}

export function getAllCategories(): string[] {
  const cats: string[] = [];
  for (const t of ALL_TEMPLATES) {
    cats.push(...t.categories);
  }
  cats.push("Other");
  return cats;
}
