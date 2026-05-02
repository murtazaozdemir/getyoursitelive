import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { getVisibleStates } from "@/lib/state-visibility";
import { isCategoryMapped } from "@/lib/templates/registry";

export const metadata = {
  title: "Google Maps Info · Admin",
  robots: { index: false, follow: false },
};

export default async function GoogleMapsInfoPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const db = await getD1();
  const visibleStateSet = await getVisibleStates();

  // Build state filter
  let stateFilter = "";
  if (visibleStateSet.size > 0) {
    const states = [...visibleStateSet].map((s) => `'${s}'`).join(",");
    stateFilter = ` AND UPPER(state) IN (${states})`;
  }

  const { results: totalRows } = await db
    .prepare(`SELECT COUNT(*) as total FROM prospects WHERE 1=1${stateFilter}`)
    .all<{ total: number }>();
  const totalProspects = totalRows[0]?.total ?? 0;

  const { results: categoryRows } = await db
    .prepare(
      `SELECT google_category, COUNT(*) as count
       FROM prospects
       WHERE google_category IS NOT NULL AND google_category != ''${stateFilter}
       GROUP BY google_category
       ORDER BY count DESC`
    )
    .all<{ google_category: string; count: number }>();

  const distinctCategories = categoryRows.length;
  const mapped = categoryRows.filter((r) => isCategoryMapped(r.google_category));
  const unmapped = categoryRows.filter((r) => !isCategoryMapped(r.google_category));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Google Maps Info</h1>
          <p className="admin-lede">
            Overview of Google Places data across {totalProspects.toLocaleString()} prospects.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="admin-stats-row" style={{ marginBottom: "2rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalProspects.toLocaleString()}</span>
          <span className="admin-stat-label">Total Prospects</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{distinctCategories}</span>
          <span className="admin-stat-label">Distinct Categories</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{mapped.length}</span>
          <span className="admin-stat-label">Mapped Categories</span>
        </div>
        <div className="admin-stat-card admin-stat-card--warn">
          <span className="admin-stat-value">{unmapped.length}</span>
          <span className="admin-stat-label">Unmapped Categories</span>
        </div>
      </div>

      <div className="admin-page-nav">
        <span className="admin-page-nav-current">Google Maps Info</span>
        <span className="admin-page-nav-sep">/</span>
        <Link href="/developer/categories">Categories &amp; Templates</Link>
        <span className="admin-page-nav-sep">/</span>
        <Link href="/developer/google-fields">Google Fields</Link>
      </div>

      {/* Unmapped categories alert */}
      {unmapped.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 className="admin-h2" style={{ marginBottom: "0.75rem" }}>Unmapped Prospect Categories</h2>
          <p style={{ fontSize: 14, color: "#666", marginBottom: "1rem" }}>
            These categories from your actual prospects fall back to the generic template.
          </p>
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Google Category</th>
                  <th style={{ textAlign: "right" }}>Prospects</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {unmapped.map((r) => (
                  <tr key={r.google_category}>
                    <td><code>{r.google_category}</code></td>
                    <td style={{ textAlign: "right" }}>{r.count}</td>
                    <td style={{ fontSize: 12, color: "#666" }}>
                      Map to an existing template or create a new one
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
