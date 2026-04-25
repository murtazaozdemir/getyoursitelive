import { getD1 } from "@/lib/db-d1";

/**
 * Look up lat/lng for a US zip code.
 * Checks prospects table first (stored coords), then places_cache.
 */
export async function zipCoords(zip: string): Promise<{ lat: number; lng: number } | null> {
  const db = await getD1();
  const prospect = await db
    .prepare("SELECT lat, lng FROM prospects WHERE lat IS NOT NULL AND lng IS NOT NULL AND address LIKE ? LIMIT 1")
    .bind(`%${zip}%`)
    .first<{ lat: number; lng: number }>();
  if (prospect) return prospect;
  const cached = await db
    .prepare("SELECT lat, lng FROM places_cache WHERE lat IS NOT NULL AND lng IS NOT NULL AND zip = ? LIMIT 1")
    .bind(zip)
    .first<{ lat: number; lng: number }>();
  return cached ?? null;
}
