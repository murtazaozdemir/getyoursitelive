import "server-only";
import type { Business, BusinessVisibility } from "@/lib/business-types";
import { getStorage, readJson, writeJson } from "@/lib/storage";

// Re-export types so existing callers can still do `import { Business } from "@/lib/db"`.
export type { Business, BusinessVisibility };

// ---------------------------------------------------------------
// Storage key conventions
// ---------------------------------------------------------------

const BUSINESS_KEY = (slug: string) => `businesses/${slug}.json`;
const BUSINESSES_PREFIX = "businesses";

// ---------------------------------------------------------------
// Public API — queries
// ---------------------------------------------------------------

/**
 * Look up a business by its URL slug.
 * Returns null if no business with that slug exists.
 */
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const storage = await getStorage();
  return readJson<Business>(storage, BUSINESS_KEY(slug));
}

/**
 * List all businesses (for the landing page or admin).
 * Returns minimal info, not the full data.
 */
export async function listBusinesses(): Promise<
  Array<{ slug: string; name: string; category: string; address: string }>
> {
  const storage = await getStorage();
  const keys = await storage.list(BUSINESSES_PREFIX);

  const rows = await Promise.all(
    keys
      .filter((k) => k.endsWith(".json"))
      .map(async (k) => {
        const biz = await readJson<Business>(storage, k);
        if (!biz) return null;
        return {
          slug: biz.slug,
          name: biz.businessInfo.name,
          category: biz.category,
          address: biz.businessInfo.address,
        };
      }),
  );

  return rows
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * List all slugs (for static generation / sitemap).
 */
export async function getAllSlugs(): Promise<string[]> {
  const storage = await getStorage();
  const keys = await storage.list(BUSINESSES_PREFIX);
  return keys
    .filter((k) => k.endsWith(".json"))
    .map((k) => k.replace(/^businesses\//, "").replace(/\.json$/, ""));
}

// ---------------------------------------------------------------
// Public API — mutations (used by admin)
// ---------------------------------------------------------------

export async function saveBusiness(business: Business): Promise<void> {
  const storage = await getStorage();
  await writeJson(storage, BUSINESS_KEY(business.slug), business);
}

export async function deleteBusiness(slug: string): Promise<void> {
  const storage = await getStorage();
  await storage.delete(BUSINESS_KEY(slug));
}
