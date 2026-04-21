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

// Map common auto-service IDs to Lucide icon components.
// Falls back to a generic Wrench icon for unknown IDs.
const ICON_MAP: Record<string, LucideIcon> = {
  diagnostic:   Gauge,
  diagnostics:  Gauge,
  brakes:       Disc3,
  brake:        Disc3,
  oil:          Droplets,
  transmission: Cog,
  ac:           Snowflake,
  hvac:         Snowflake,
  tires:        Circle,
  tire:         Circle,
  alignment:    Activity,
  inspection:   ClipboardCheck,
  general:      Wrench,
};

/**
 * Render the icon element for a given service id.
 * Returning JSX (rather than a component reference) keeps us clear of
 * React 19's `react-hooks/static-components` rule, which fires when
 * components are "created" during render.
 */
export function ServiceIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  const Icon = ICON_MAP[id.toLowerCase()] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}
