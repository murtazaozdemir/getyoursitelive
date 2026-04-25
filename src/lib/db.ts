import type { Business, BusinessVisibility } from "@/lib/business-types";
import { getD1 } from "@/lib/db-d1";
import { getTemplateForCategory } from "@/lib/templates/registry";

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
  try {
    const biz = JSON.parse(row.content) as Business;
    // Read-time migration: rename legacy `vehicle` → `context` in testimonials
    if (biz.testimonials?.length) {
      biz.testimonials = biz.testimonials.map((t) => {
        const raw = t as unknown as Record<string, unknown>;
        if ("vehicle" in raw && !("context" in raw)) {
          return { name: t.name, context: raw.vehicle as string, quote: t.quote };
        }
        return t;
      });
    }

    // Template defaults: fill missing fields from the vertical template.
    // This means new prospects only need name/address/phone in the DB —
    // everything else falls back to template content at render time.
    const template = getTemplateForCategory(row.category);
    const defaults = template.buildProspectBusiness(
      row.slug,
      row.name,
      biz.businessInfo?.phone ?? "",
      biz.businessInfo?.address ?? "",
    );

    // Fill missing sections from template defaults.
    // If the section is missing entirely, use the template's version.
    // Individual fields within a section are filled only if empty.
    if (!biz.hero) {
      biz.hero = defaults.hero;
    } else {
      const h = biz.hero;
      const d = defaults.hero;
      if (!h.headline) h.headline = d.headline;
      if (!h.eyebrowPrefix) h.eyebrowPrefix = d.eyebrowPrefix;
      if (!h.lead) h.lead = d.lead;
      if (!h.primaryCta) h.primaryCta = d.primaryCta;
      if (!h.secondaryCta) h.secondaryCta = d.secondaryCta;
      if (!h.whyTitle) h.whyTitle = d.whyTitle;
      if (!h.whyBullets?.length) h.whyBullets = d.whyBullets;
      if (!h.heroImage) h.heroImage = d.heroImage;
    }

    if (!biz.about) {
      biz.about = defaults.about;
    } else {
      const a = biz.about;
      const d = defaults.about;
      if (!a.heading) a.heading = d.heading;
      if (!a.narrative) a.narrative = d.narrative;
      if (!a.bullets?.length) a.bullets = d.bullets;
      if (!a.primaryImage) a.primaryImage = d.primaryImage;
      if (!a.secondaryImage) a.secondaryImage = d.secondaryImage;
      if (!a.whyUsCards?.length) a.whyUsCards = d.whyUsCards;
    }

    if (!biz.services?.length) {
      biz.services = defaults.services;
    }

    return biz;
  } catch {
    console.error(`[db] corrupt business JSON for slug=${row.slug}`);
    throw new Error(`Business data corrupted: ${row.slug}`);
  }
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
      business.category ?? "Car repair and maintenance service",
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
