import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { getVisibleStates } from "@/lib/state-visibility";

export const metadata = {
  title: "Google Fields · Admin",
  robots: { index: false, follow: false },
};

interface FieldStat {
  field: string;
  dbColumn: string;
  type: string;
  filledCount: number;
  nullCount: number;
  avgLength: number | null;
  maxLength: number | null;
}

const GOOGLE_FIELDS: { field: string; dbColumn: string; type: string }[] = [
  { field: "googlePlaceId", dbColumn: "google_place_id", type: "TEXT" },
  { field: "googleRating", dbColumn: "google_rating", type: "REAL (0-5)" },
  { field: "googleReviewCount", dbColumn: "google_review_count", type: "INTEGER" },
  { field: "googleCategory", dbColumn: "google_category", type: "TEXT" },
  { field: "googleMapsUrl", dbColumn: "google_maps_url", type: "TEXT (URL)" },
  { field: "googleBusinessStatus", dbColumn: "google_business_status", type: "TEXT" },
  { field: "googlePriceLevel", dbColumn: "google_price_level", type: "TEXT" },
  { field: "googleEditorialSummary", dbColumn: "google_editorial_summary", type: "TEXT" },
  { field: "googleOpeningHours", dbColumn: "google_opening_hours", type: "TEXT (JSON)" },
  { field: "googleReviews", dbColumn: "google_reviews", type: "TEXT (JSON)" },
  { field: "googlePhotos", dbColumn: "google_photos", type: "TEXT (JSON)" },
  { field: "googleShortAddress", dbColumn: "google_short_address", type: "TEXT" },
  { field: "googleAddressComponents", dbColumn: "google_address_components", type: "TEXT (JSON)" },
  { field: "website", dbColumn: "website", type: "TEXT (URL)" },
  { field: "lat", dbColumn: "lat", type: "REAL" },
  { field: "lng", dbColumn: "lng", type: "REAL" },
];

export default async function GoogleFieldsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const db = await getD1();
  const visibleStateSet = await getVisibleStates();
  let stateFilter = "";
  if (visibleStateSet.size > 0) {
    const states = [...visibleStateSet].map((s) => `'${s}'`).join(",");
    stateFilter = ` WHERE UPPER(state) IN (${states})`;
  }

  const { results: totalRows } = await db
    .prepare(`SELECT COUNT(*) as total FROM prospects${stateFilter}`)
    .all<{ total: number }>();
  const totalProspects = totalRows[0]?.total ?? 0;

  // Field fill stats
  const fieldStats: FieldStat[] = [];
  for (const f of GOOGLE_FIELDS) {
    const isText = f.type.startsWith("TEXT");
    const whereClause = stateFilter || "";
    const query = isText
      ? `SELECT
           COUNT(CASE WHEN ${f.dbColumn} IS NOT NULL AND ${f.dbColumn} != '' THEN 1 END) as filled,
           COUNT(CASE WHEN ${f.dbColumn} IS NULL OR ${f.dbColumn} = '' THEN 1 END) as empty,
           CAST(AVG(CASE WHEN ${f.dbColumn} IS NOT NULL AND ${f.dbColumn} != '' THEN LENGTH(${f.dbColumn}) END) AS INTEGER) as avg_len,
           MAX(LENGTH(${f.dbColumn})) as max_len
         FROM prospects${whereClause}`
      : `SELECT
           COUNT(CASE WHEN ${f.dbColumn} IS NOT NULL THEN 1 END) as filled,
           COUNT(CASE WHEN ${f.dbColumn} IS NULL THEN 1 END) as empty,
           NULL as avg_len,
           NULL as max_len
         FROM prospects${whereClause}`;

    const { results } = await db.prepare(query).all<{
      filled: number;
      empty: number;
      avg_len: number | null;
      max_len: number | null;
    }>();
    const row = results[0];
    fieldStats.push({
      field: f.field,
      dbColumn: f.dbColumn,
      type: f.type,
      filledCount: row?.filled ?? 0,
      nullCount: row?.empty ?? 0,
      avgLength: row?.avg_len ?? null,
      maxLength: row?.max_len ?? null,
    });
  }

  // Total DB size
  const sizeQuery = GOOGLE_FIELDS.filter((f) => f.type.startsWith("TEXT"))
    .map((f) => `COALESCE(SUM(LENGTH(${f.dbColumn})), 0)`)
    .join(" + ");
  const { results: sizeRows } = await db
    .prepare(`SELECT (${sizeQuery}) as total_bytes FROM prospects${stateFilter}`)
    .all<{ total_bytes: number }>();
  const totalGoogleBytes = sizeRows[0]?.total_bytes ?? 0;

  const filledFields = fieldStats.filter((f) => f.filledCount > 0).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Google Fields We Store</h1>
          <p className="admin-lede">
            Every field fetched from Google Places API and stored per prospect in D1.
          </p>
        </div>
      </div>

      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalProspects.toLocaleString()}</span>
          <span className="admin-stat-label">Total Prospects</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{GOOGLE_FIELDS.length}</span>
          <span className="admin-stat-label">Fields Tracked</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{filledFields}</span>
          <span className="admin-stat-label">Fields With Data</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{formatBytes(totalGoogleBytes)}</span>
          <span className="admin-stat-label">Total Data Size</span>
        </div>
      </div>

      <div className="admin-page-nav">
        <Link href="/developer/google-maps-info">Google Maps Info</Link>
        <span className="admin-page-nav-sep">/</span>
        <Link href="/developer/categories">Categories &amp; Templates</Link>
        <span className="admin-page-nav-sep">/</span>
        <span className="admin-page-nav-current">Google Fields</span>
      </div>

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>DB Column</th>
              <th>Type</th>
              <th style={{ textAlign: "right" }}>Filled</th>
              <th style={{ textAlign: "right" }}>Empty</th>
              <th style={{ textAlign: "right" }}>Fill %</th>
              <th style={{ textAlign: "right" }}>Avg Size</th>
              <th style={{ textAlign: "right" }}>Max Size</th>
            </tr>
          </thead>
          <tbody>
            {fieldStats.map((f) => {
              const total = f.filledCount + f.nullCount;
              const pct = total > 0 ? Math.round((f.filledCount / total) * 100) : 0;
              return (
                <tr key={f.field}>
                  <td><code>{f.field}</code></td>
                  <td style={{ fontSize: 12, color: "#888" }}>{f.dbColumn}</td>
                  <td style={{ fontSize: 12 }}>{f.type}</td>
                  <td style={{ textAlign: "right" }}>{f.filledCount}</td>
                  <td style={{ textAlign: "right", color: "#999" }}>{f.nullCount}</td>
                  <td style={{ textAlign: "right" }}>
                    <span style={{ color: pct > 80 ? "#16a34a" : pct > 40 ? "#ca8a04" : "#dc2626" }}>
                      {pct}%
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>{f.avgLength != null ? formatBytes(f.avgLength) : "\u2014"}</td>
                  <td style={{ textAlign: "right" }}>{f.maxLength != null ? formatBytes(f.maxLength) : "\u2014"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
