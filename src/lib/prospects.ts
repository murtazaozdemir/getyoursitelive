import { getD1 } from "@/lib/db-d1";

export type ProspectStatus = "found" | "contacted" | "interested" | "paid" | "delivered";

export const PIPELINE_STAGES: { status: ProspectStatus; label: string }[] = [
  { status: "found", label: "Found" },
  { status: "contacted", label: "Contacted" },
  { status: "interested", label: "Interested" },
  { status: "paid", label: "Paid" },
  { status: "delivered", label: "Delivered" },
];

export interface ProspectNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Prospect {
  slug: string;
  shortId?: number;
  name: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  status: ProspectStatus;
  notes: ProspectNote[];
  domain1?: string;
  domain2?: string;
  domain3?: string;
  proposalSentAt?: string;
  proposalSentBy?: string;
  contactedBy?: string;
  contactedByName?: string;
  contactedAt?: string;
  contactMethod?: string;
  website?: string;
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewCount?: number;
  googleCategory?: string;
  googleMapsUrl?: string;
  googleBusinessStatus?: string;
  googlePriceLevel?: string;
  googleEditorialSummary?: string;
  googleOpeningHours?: string;
  googleReviews?: string;
  googlePhotos?: string;
  googleShortAddress?: string;
  googleAddressComponents?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------
// D1 row → Prospect
// ---------------------------------------------------------------

interface ProspectRow {
  slug: string;
  short_id: number | null;
  name: string;
  phone: string;
  phone_normalized: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  status: string;
  notes: string;
  domain1: string | null;
  domain2: string | null;
  domain3: string | null;
  proposal_sent_at: string | null;
  proposal_sent_by: string | null;
  contacted_by: string | null;
  contacted_by_name: string | null;
  contacted_at: string | null;
  contact_method: string | null;
  website: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_category: string | null;
  google_maps_url: string | null;
  google_business_status: string | null;
  google_price_level: string | null;
  google_editorial_summary: string | null;
  google_opening_hours: string | null;
  google_reviews: string | null;
  google_photos: string | null;
  google_short_address: string | null;
  google_address_components: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
}

function rowToProspect(row: ProspectRow): Prospect {
  return {
    slug: row.slug,
    shortId: row.short_id ?? undefined,
    name: row.name,
    phone: row.phone,
    address: row.address,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    zip: row.zip ?? undefined,
    status: row.status as ProspectStatus,
    notes: JSON.parse(row.notes) as ProspectNote[],
    domain1: row.domain1 ?? undefined,
    domain2: row.domain2 ?? undefined,
    domain3: row.domain3 ?? undefined,
    proposalSentAt: row.proposal_sent_at ?? undefined,
    proposalSentBy: row.proposal_sent_by ?? undefined,
    contactedBy: row.contacted_by ?? undefined,
    contactedByName: row.contacted_by_name ?? undefined,
    contactedAt: row.contacted_at ?? undefined,
    contactMethod: row.contact_method ?? undefined,
    website: row.website ?? undefined,
    googlePlaceId: row.google_place_id ?? undefined,
    googleRating: row.google_rating ?? undefined,
    googleReviewCount: row.google_review_count ?? undefined,
    googleCategory: row.google_category ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    googleBusinessStatus: row.google_business_status ?? undefined,
    googlePriceLevel: row.google_price_level ?? undefined,
    googleEditorialSummary: row.google_editorial_summary ?? undefined,
    googleOpeningHours: row.google_opening_hours ?? undefined,
    googleReviews: row.google_reviews ?? undefined,
    googlePhotos: row.google_photos ?? undefined,
    googleShortAddress: row.google_short_address ?? undefined,
    googleAddressComponents: row.google_address_components ?? undefined,
    lat: row.lat ?? undefined,
    lng: row.lng ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Strip all non-digit characters for phone comparison */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// ---------------------------------------------------------------
// Queries
// ---------------------------------------------------------------

export async function listProspects(): Promise<Prospect[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT * FROM prospects ORDER BY created_at DESC")
    .all<ProspectRow>();
  return results.map(rowToProspect);
}

export async function getProspect(slug: string): Promise<Prospect | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE slug = ?")
    .bind(slug)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

export async function getProspectByShortId(shortId: number): Promise<Prospect | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE short_id = ?")
    .bind(shortId)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

export async function findProspectByPlaceId(placeId: string): Promise<Prospect | null> {
  if (!placeId) return null;
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE google_place_id = ?")
    .bind(placeId)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

export async function findProspectByPhone(phone: string): Promise<Prospect | null> {
  const normalized = normalizePhone(phone);
  if (normalized.length < 7) return null;
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE phone_normalized = ?")
    .bind(normalized)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

/** Check which phones already exist in the DB. Returns set of normalized phones found. */
export async function findExistingPlaceIds(placeIds: string[]): Promise<Set<string>> {
  const db = await getD1();
  const valid = placeIds.filter(Boolean);
  const found = new Set<string>();

  for (let i = 0; i < valid.length; i += 50) {
    const chunk = valid.slice(i, i + 50);
    const placeholders = chunk.map(() => "?").join(",");
    const { results } = await db
      .prepare(`SELECT google_place_id FROM prospects WHERE google_place_id IN (${placeholders})`)
      .bind(...chunk)
      .all<{ google_place_id: string }>();
    for (const r of results) found.add(r.google_place_id);
  }

  return found;
}

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export async function createProspect(prospect: Omit<Prospect, "shortId">): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  // D1 doesn't count subqueries in VALUES as bound values, so compute short_id first
  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(short_id), 0) + 1 AS next_id FROM prospects")
    .first<{ next_id: number }>();
  const nextShortId = maxRow?.next_id ?? 1;

  await db
    .prepare(
      `INSERT INTO prospects (
        slug, short_id, name, phone, phone_normalized, address, city, state, zip, status, notes,
        domain1, domain2, domain3,
        proposal_sent_at, proposal_sent_by,
        contacted_by, contacted_by_name, contacted_at,
        website,
        google_place_id, google_rating, google_review_count, google_category, google_maps_url,
        google_business_status, google_price_level, google_editorial_summary,
        google_opening_hours, google_reviews, google_photos,
        google_short_address, google_address_components,
        lat, lng,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      prospect.slug,
      nextShortId,
      prospect.name,
      prospect.phone,
      normalizePhone(prospect.phone),
      prospect.address,
      prospect.city ?? null,
      prospect.state ?? null,
      prospect.zip ?? null,
      prospect.status,
      JSON.stringify(prospect.notes),
      prospect.domain1 ?? null,
      prospect.domain2 ?? null,
      prospect.domain3 ?? null,
      prospect.proposalSentAt ?? null,
      prospect.proposalSentBy ?? null,
      prospect.contactedBy ?? null,
      prospect.contactedByName ?? null,
      prospect.contactedAt ?? null,
      prospect.website ?? null,
      prospect.googlePlaceId ?? null,
      prospect.googleRating ?? null,
      prospect.googleReviewCount ?? null,
      prospect.googleCategory ?? null,
      prospect.googleMapsUrl ?? null,
      prospect.googleBusinessStatus ?? null,
      prospect.googlePriceLevel ?? null,
      prospect.googleEditorialSummary ?? null,
      prospect.googleOpeningHours ?? null,
      prospect.googleReviews ?? null,
      prospect.googlePhotos ?? null,
      prospect.googleShortAddress ?? null,
      prospect.googleAddressComponents ?? null,
      prospect.lat ?? null,
      prospect.lng ?? null,
      prospect.createdAt ?? now,
      prospect.updatedAt ?? now,
    )
    .run();
}

export async function updateProspect(slug: string, patch: Partial<Prospect>): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  // Build SET clause dynamically from the patch fields
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];

  const fieldMap: Record<string, string> = {
    name: "name",
    phone: "phone",
    address: "address",
    city: "city",
    state: "state",
    zip: "zip",
    status: "status",
    notes: "notes",
    domain1: "domain1",
    domain2: "domain2",
    domain3: "domain3",
    proposalSentAt: "proposal_sent_at",
    proposalSentBy: "proposal_sent_by",
    contactedBy: "contacted_by",
    contactedByName: "contacted_by_name",
    contactedAt: "contacted_at",
    contactMethod: "contact_method",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in patch) {
      sets.push(`${col} = ?`);
      const val = patch[key as keyof Prospect];
      // notes is a JSON array
      values.push(key === "notes" ? JSON.stringify(val) : (val ?? null));
    }
  }

  // Keep phone_normalized in sync when phone changes
  if ("phone" in patch && patch.phone !== undefined) {
    sets.push("phone_normalized = ?");
    values.push(normalizePhone(patch.phone));
  }

  values.push(slug);
  await db
    .prepare(`UPDATE prospects SET ${sets.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();
}

export async function updateProspectGoogleData(
  slug: string,
  data: {
    city?: string;
    state?: string;
    zip?: string;
    website?: string;
    googlePlaceId?: string;
    googleRating?: number | null;
    googleReviewCount?: number;
    googleCategory?: string;
    googleMapsUrl?: string;
    googleBusinessStatus?: string;
    googlePriceLevel?: string;
    googleEditorialSummary?: string;
    googleOpeningHours?: string;
    googleReviews?: string;
    googlePhotos?: string;
    googleShortAddress?: string;
    googleAddressComponents?: string;
    lat?: number | null;
    lng?: number | null;
  },
): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];

  const fieldMap: [string, string][] = [
    ["city", "city"],
    ["state", "state"],
    ["zip", "zip"],
    ["website", "website"],
    ["googlePlaceId", "google_place_id"],
    ["googleRating", "google_rating"],
    ["googleReviewCount", "google_review_count"],
    ["googleCategory", "google_category"],
    ["googleMapsUrl", "google_maps_url"],
    ["googleBusinessStatus", "google_business_status"],
    ["googlePriceLevel", "google_price_level"],
    ["googleEditorialSummary", "google_editorial_summary"],
    ["googleOpeningHours", "google_opening_hours"],
    ["googleReviews", "google_reviews"],
    ["googlePhotos", "google_photos"],
    ["googleShortAddress", "google_short_address"],
    ["googleAddressComponents", "google_address_components"],
    ["lat", "lat"],
    ["lng", "lng"],
  ];

  for (const [key, col] of fieldMap) {
    if ((data as Record<string, unknown>)[key] !== undefined) {
      sets.push(`${col} = ?`);
      values.push((data as Record<string, unknown>)[key] ?? null);
    }
  }

  values.push(slug);
  await db
    .prepare(`UPDATE prospects SET ${sets.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();
}

export async function deleteProspect(slug: string): Promise<void> {
  const db = await getD1();
  await db.prepare("DELETE FROM prospects WHERE slug = ?").bind(slug).run();
}
