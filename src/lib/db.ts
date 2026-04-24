import type { Business, BusinessVisibility } from "@/lib/business-types";
import { getD1 } from "@/lib/db-d1";

// Re-export types so existing callers can still do `import { Business } from "@/lib/db"`.
export type { Business, BusinessVisibility };

// ---------------------------------------------------------------
// Row type returned by D1
// ---------------------------------------------------------------

interface BusinessRow {
  slug: string;
  name: string;
  category: string;
  theme: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function rowToBusiness(row: BusinessRow): Business {
  return JSON.parse(row.content) as Business;
}

// ---------------------------------------------------------------
// Public API — queries
// ---------------------------------------------------------------

/**
 * Look up a business by its URL slug.
 * Returns null if no business with that slug exists.
 */
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM businesses WHERE slug = ?")
    .bind(slug)
    .first<BusinessRow>();
  return row ? rowToBusiness(row) : null;
}

/**
 * List all businesses (for the landing page or admin).
 * Returns minimal info — no JSON parsing needed.
 */
export async function listBusinesses(): Promise<
  Array<{ slug: string; name: string; category: string; address: string }>
> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT slug, name, category, content FROM businesses ORDER BY name")
    .all<{ slug: string; name: string; category: string; content: string }>();

  return results.map((row) => {
    const biz = JSON.parse(row.content) as Business;
    return {
      slug: row.slug,
      name: row.name,
      category: row.category,
      address: biz.businessInfo.address,
    };
  });
}

/**
 * List all slugs (for static generation / sitemap).
 */
export async function getAllSlugs(): Promise<string[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT slug FROM businesses ORDER BY slug")
    .all<{ slug: string }>();
  return results.map((r) => r.slug);
}

// ---------------------------------------------------------------
// Public API — mutations (used by admin)
// ---------------------------------------------------------------

export async function saveBusiness(business: Business): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO businesses (slug, name, category, theme, content, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         name       = excluded.name,
         category   = excluded.category,
         theme      = excluded.theme,
         content    = excluded.content,
         updated_at = excluded.updated_at`,
    )
    .bind(
      business.slug,
      business.businessInfo.name,
      business.category ?? "Auto Repair",
      business.theme ?? "modern",
      JSON.stringify(business),
      now,
      now,
    )
    .run();
}

export async function deleteBusiness(slug: string): Promise<void> {
  const db = await getD1();
  await db.prepare("DELETE FROM businesses WHERE slug = ?").bind(slug).run();
}
