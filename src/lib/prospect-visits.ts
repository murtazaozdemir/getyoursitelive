import { getD1 } from "@/lib/db-d1";

/**
 * Tracks visits to prospect preview sites (/{slug}).
 * Every visit is recorded — no deduplication.
 * Developer can view all visits in /admin/visits.
 */

export interface ProspectVisit {
  id: string;
  slug: string;
  businessName: string;
  ip: string;
  userAgent: string;
  referrer: string;
  visitedAt: string;
}

interface VisitRow {
  id: string;
  slug: string;
  business_name: string;
  ip: string;
  user_agent: string;
  referrer: string;
  visited_at: string;
}

function rowToVisit(row: VisitRow): ProspectVisit {
  return {
    id: row.id,
    slug: row.slug,
    businessName: row.business_name,
    ip: row.ip,
    userAgent: row.user_agent,
    referrer: row.referrer,
    visitedAt: row.visited_at,
  };
}

/**
 * Log a visit to a prospect's preview site.
 * Fire-and-forget — errors are silently caught.
 */
export async function logProspectVisit(data: {
  slug: string;
  businessName: string;
  ip: string;
  userAgent: string;
  referrer: string;
}): Promise<void> {
  try {
    const db = await getD1();
    const id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const visitedAt = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO prospect_visits (id, slug, business_name, ip, user_agent, referrer, visited_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, data.slug, data.businessName, data.ip, data.userAgent, data.referrer, visitedAt)
      .run();
  } catch {
    // Visit logging must never crash the page render
  }
}

/**
 * Get recent prospect visits, newest first.
 */
export async function getProspectVisits(limit = 200): Promise<ProspectVisit[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT * FROM prospect_visits ORDER BY visited_at DESC LIMIT ?")
    .bind(limit)
    .all<VisitRow>();
  return results.map(rowToVisit);
}

/**
 * Get visits for a specific slug.
 */
export async function getProspectVisitsForSlug(slug: string, limit = 100): Promise<ProspectVisit[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT * FROM prospect_visits WHERE slug = ? ORDER BY visited_at DESC LIMIT ?")
    .bind(slug, limit)
    .all<VisitRow>();
  return results.map(rowToVisit);
}

/**
 * Get visit count per slug (for summary view).
 */
export async function getVisitCounts(): Promise<Array<{ slug: string; businessName: string; count: number; lastVisit: string }>> {
  const db = await getD1();
  const { results } = await db
    .prepare(
      `SELECT slug, business_name, COUNT(*) as visit_count, MAX(visited_at) as last_visit
       FROM prospect_visits
       GROUP BY slug
       ORDER BY last_visit DESC`,
    )
    .all<{ slug: string; business_name: string; visit_count: number; last_visit: string }>();
  return results.map((r) => ({
    slug: r.slug,
    businessName: r.business_name,
    count: r.visit_count,
    lastVisit: r.last_visit,
  }));
}
