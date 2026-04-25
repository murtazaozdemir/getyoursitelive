import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isFounder } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { getTemplateForCategory, isCategoryMapped } from "@/lib/templates/registry";

export const metadata = {
  title: "Google Maps Info · Admin",
  robots: { index: false, follow: false },
};

interface CategoryRow {
  google_category: string;
  count: number;
}

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

export default async function GoogleMapsInfoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isFounder(user)) redirect("/admin");

  const db = await getD1();

  // 1. Get all distinct categories with counts
  const { results: categoryRows } = await db
    .prepare(
      `SELECT google_category, COUNT(*) as count
       FROM prospects
       WHERE google_category IS NOT NULL AND google_category != ''
       GROUP BY google_category
       ORDER BY count DESC`
    )
    .all<CategoryRow>();

  // 2. Get total prospect count
  const { results: totalRows } = await db
    .prepare("SELECT COUNT(*) as total FROM prospects")
    .all<{ total: number }>();
  const totalProspects = totalRows[0]?.total ?? 0;

  // 3. Get field fill stats
  const fieldStats: FieldStat[] = [];
  for (const f of GOOGLE_FIELDS) {
    const isText = f.type.startsWith("TEXT");
    const query = isText
      ? `SELECT
           COUNT(CASE WHEN ${f.dbColumn} IS NOT NULL AND ${f.dbColumn} != '' THEN 1 END) as filled,
           COUNT(CASE WHEN ${f.dbColumn} IS NULL OR ${f.dbColumn} = '' THEN 1 END) as empty,
           CAST(AVG(CASE WHEN ${f.dbColumn} IS NOT NULL AND ${f.dbColumn} != '' THEN LENGTH(${f.dbColumn}) END) AS INTEGER) as avg_len,
           MAX(LENGTH(${f.dbColumn})) as max_len
         FROM prospects`
      : `SELECT
           COUNT(CASE WHEN ${f.dbColumn} IS NOT NULL THEN 1 END) as filled,
           COUNT(CASE WHEN ${f.dbColumn} IS NULL THEN 1 END) as empty,
           NULL as avg_len,
           NULL as max_len
         FROM prospects`;

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

  // 4. Get total DB size estimate for Google fields
  const sizeQuery = GOOGLE_FIELDS.filter((f) => f.type.startsWith("TEXT"))
    .map((f) => `COALESCE(SUM(LENGTH(${f.dbColumn})), 0)`)
    .join(" + ");
  const { results: sizeRows } = await db
    .prepare(`SELECT (${sizeQuery}) as total_bytes FROM prospects`)
    .all<{ total_bytes: number }>();
  const totalGoogleBytes = sizeRows[0]?.total_bytes ?? 0;

  const mapped = categoryRows.filter((r) => isCategoryMapped(r.google_category));
  const unmapped = categoryRows.filter((r) => !isCategoryMapped(r.google_category));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Google Maps Info</h1>
          <p className="admin-lede">
            All Google Places data fetched across {totalProspects} prospects.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <SummaryCard label="Total Prospects" value={totalProspects} />
        <SummaryCard label="Distinct Categories" value={categoryRows.length} />
        <SummaryCard label="Mapped Categories" value={mapped.length} />
        <SummaryCard label="Unmapped Categories" value={unmapped.length} accent={unmapped.length > 0} />
        <SummaryCard label="Google Data Size" value={formatBytes(totalGoogleBytes)} />
      </div>

      {/* Unmapped categories (alert) */}
      {unmapped.length > 0 && (
        <div style={{ background: "#fef3cd", border: "1px solid #e6c200", borderRadius: 8, padding: "1rem 1.25rem", marginBottom: "2rem" }}>
          <strong style={{ color: "#856404" }}>Unmapped Categories</strong>
          <p style={{ color: "#856404", margin: "0.25rem 0 0.75rem", fontSize: 14 }}>
            These Google categories fall back to the generic template. Consider creating templates or mapping them to existing ones.
          </p>
          <table className="audit-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Google Category</th>
                <th style={{ textAlign: "right" }}>Prospects</th>
                <th>Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {unmapped.map((r) => (
                <tr key={r.google_category}>
                  <td><code>{r.google_category}</code></td>
                  <td style={{ textAlign: "right" }}>{r.count}</td>
                  <td style={{ fontSize: 12, color: "#666" }}>
                    Add to an existing template&apos;s <code>categories[]</code> or create a new template
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mapped categories */}
      <h2 className="admin-h2" style={{ marginBottom: "0.75rem" }}>Categories &amp; Templates</h2>
      <div className="audit-table-wrap" style={{ marginBottom: "2rem" }}>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Google Category</th>
              <th>Template</th>
              <th style={{ textAlign: "right" }}>Prospects</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {categoryRows.map((r) => {
              const isM = isCategoryMapped(r.google_category);
              const tmpl = getTemplateForCategory(r.google_category);
              return (
                <tr key={r.google_category}>
                  <td><code>{r.google_category}</code></td>
                  <td>{tmpl.label}</td>
                  <td style={{ textAlign: "right" }}>{r.count}</td>
                  <td>
                    <span
                      className={isM ? "audit-badge audit-badge--default" : "audit-badge audit-badge--warn"}
                    >
                      {isM ? "Mapped" : "Unmapped"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Field stats */}
      <h2 className="admin-h2" style={{ marginBottom: "0.75rem" }}>Google Fields We Store</h2>
      <p style={{ fontSize: 14, color: "#666", marginBottom: "1rem" }}>
        Every field fetched from Google Places API and stored per prospect in D1.
      </p>
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
                  <td style={{ textAlign: "right" }}>{f.avgLength != null ? formatBytes(f.avgLength) : "—"}</td>
                  <td style={{ textAlign: "right" }}>{f.maxLength != null ? formatBytes(f.maxLength) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "#fef3cd" : "#f8f8f8",
      border: accent ? "1px solid #e6c200" : "1px solid #e5e5e5",
      borderRadius: 8,
      padding: "1rem 1.25rem",
    }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: accent ? "#856404" : "#111" }}>
        {value}
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
