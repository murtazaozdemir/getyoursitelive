import { getBusinessBySlug } from "@/lib/db";
import { getProspect } from "@/lib/prospects";

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate a unique slug from a business name + optional location.
 *
 * Strategy:
 * 1. Base slug from name: "abc-auto"
 * 2. If collision, append city: "abc-auto-clifton"
 * 3. If still collision, append state: "abc-auto-clifton-nj"
 * 4. If still collision, append random 4-char suffix: "abc-auto-clifton-nj-x7k2"
 */
export async function generateUniqueSlug(
  name: string,
  city?: string,
  state?: string,
): Promise<string> {
  const base = nameToSlug(name);
  if (!base) throw new Error("Could not generate a valid slug from that name.");

  // Try base slug first
  if (!(await slugExists(base))) return base;

  // Append city
  if (city) {
    const withCity = `${base}-${nameToSlug(city)}`;
    if (withCity !== base && !(await slugExists(withCity))) return withCity;

    // Append state
    if (state) {
      const withState = `${withCity}-${nameToSlug(state)}`;
      if (withState !== withCity && !(await slugExists(withState))) return withState;
    }
  }

  // Random suffix as last resort
  for (let i = 0; i < 5; i++) {
    const suffix = Math.random().toString(36).slice(2, 6);
    const candidate = `${base}-${suffix}`;
    if (!(await slugExists(candidate))) return candidate;
  }

  throw new Error(`Could not generate unique slug for "${name}" after multiple attempts.`);
}

async function slugExists(slug: string): Promise<boolean> {
  const [biz, prospect] = await Promise.all([
    getBusinessBySlug(slug),
    getProspect(slug),
  ]);
  return !!(biz || prospect);
}
