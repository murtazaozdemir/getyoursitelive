import { Wrench } from "lucide-react";
import { getTemplateForCategory } from "@/lib/templates/registry";

// Default icon map used when no category is provided (auto-repair fallback)
const DEFAULT_ICONS = getTemplateForCategory("Car repair and maintenance service").serviceIcons;

/**
 * Render the icon element for a given service id.
 * Returning JSX (rather than a component reference) keeps us clear of
 * React 19's `react-hooks/static-components` rule, which fires when
 * components are "created" during render.
 */
export function ServiceIcon({
  id,
  category,
  className,
}: {
  id: string;
  category?: string;
  className?: string;
}) {
  const icons = category
    ? getTemplateForCategory(category).serviceIcons
    : DEFAULT_ICONS;
  const Icon = icons[id.toLowerCase()] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}
