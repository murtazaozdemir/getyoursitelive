import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { DuplicatesView } from "./duplicates-view";

export const metadata = {
  title: "Duplicate Cleaner · Admin",
  robots: { index: false, follow: false },
};

interface DupeGroup {
  key: string;
  type: "place_id" | "phone" | "name_address";
  prospects: {
    slug: string;
    shortId: number | null;
    name: string;
    phone: string;
    address: string;
    googlePlaceId: string | null;
    googleCategory: string | null;
    googleRating: number | null;
    googleReviewCount: number | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export default async function DuplicatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const db = await getD1();
  const groups: DupeGroup[] = [];

  // 1. Duplicate Google Place IDs (exact same business added twice)
  const { results: placeIdDupes } = await db
    .prepare(
      `SELECT google_place_id, COUNT(*) as cnt
       FROM prospects
       WHERE google_place_id IS NOT NULL AND google_place_id != ''
       GROUP BY google_place_id
       HAVING cnt > 1
       ORDER BY cnt DESC
       LIMIT 100`,
    )
    .all<{ google_place_id: string; cnt: number }>();

  for (const row of placeIdDupes) {
    const { results: prospects } = await db
      .prepare(
        `SELECT slug, short_id, name, phone, address, google_place_id,
                google_category, google_rating, google_review_count,
                status, created_at, updated_at
         FROM prospects
         WHERE google_place_id = ?
         ORDER BY created_at ASC`,
      )
      .bind(row.google_place_id)
      .all<{
        slug: string;
        short_id: number | null;
        name: string;
        phone: string;
        address: string;
        google_place_id: string | null;
        google_category: string | null;
        google_rating: number | null;
        google_review_count: number | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>();

    groups.push({
      key: row.google_place_id,
      type: "place_id",
      prospects: prospects.map((p) => ({
        slug: p.slug,
        shortId: p.short_id,
        name: p.name,
        phone: p.phone,
        address: p.address,
        googlePlaceId: p.google_place_id,
        googleCategory: p.google_category,
        googleRating: p.google_rating,
        googleReviewCount: p.google_review_count,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  }

  // 2. Duplicate normalized phones (different Place ID but same phone)
  const { results: phoneDupes } = await db
    .prepare(
      `SELECT phone_normalized, COUNT(*) as cnt
       FROM prospects
       WHERE phone_normalized != '' AND LENGTH(phone_normalized) >= 7
       GROUP BY phone_normalized
       HAVING cnt > 1
       ORDER BY cnt DESC
       LIMIT 100`,
    )
    .all<{ phone_normalized: string; cnt: number }>();

  for (const row of phoneDupes) {
    const { results: prospects } = await db
      .prepare(
        `SELECT slug, short_id, name, phone, address, google_place_id,
                google_category, google_rating, google_review_count,
                status, created_at, updated_at
         FROM prospects
         WHERE phone_normalized = ?
         ORDER BY created_at ASC`,
      )
      .bind(row.phone_normalized)
      .all<{
        slug: string;
        short_id: number | null;
        name: string;
        phone: string;
        address: string;
        google_place_id: string | null;
        google_category: string | null;
        google_rating: number | null;
        google_review_count: number | null;
        status: string;
        created_at: string;
        updated_at: string;
      }>();

    // Skip if already covered by a place_id group
    const slugs = prospects.map((p) => p.slug);
    const alreadyCovered = groups.some(
      (g) => g.type === "place_id" && g.prospects.some((p) => slugs.includes(p.slug)),
    );
    if (alreadyCovered) continue;

    groups.push({
      key: row.phone_normalized,
      type: "phone",
      prospects: prospects.map((p) => ({
        slug: p.slug,
        shortId: p.short_id,
        name: p.name,
        phone: p.phone,
        address: p.address,
        googlePlaceId: p.google_place_id,
        googleCategory: p.google_category,
        googleRating: p.google_rating,
        googleReviewCount: p.google_review_count,
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
    });
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Duplicate Cleaner</h1>
          <p className="admin-lede">
            Prospects that share a Google Place ID or phone number. Review and delete duplicates.
          </p>
        </div>
      </div>

      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{groups.length}</span>
          <span className="admin-stat-label">Duplicate groups</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {groups.reduce((sum, g) => sum + g.prospects.length - 1, 0)}
          </span>
          <span className="admin-stat-label">Extra records to clean</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {groups.filter((g) => g.type === "place_id").length}
          </span>
          <span className="admin-stat-label">Same Place ID</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">
            {groups.filter((g) => g.type === "phone").length}
          </span>
          <span className="admin-stat-label">Same phone</span>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="admin-empty" style={{ marginTop: "2rem" }}>
          <p>No duplicates found. Database is clean.</p>
        </div>
      ) : (
        <DuplicatesView groups={groups} />
      )}
    </div>
  );
}
