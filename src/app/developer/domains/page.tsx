import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { getVisibleStates } from "@/lib/state-visibility";
import { DomainsView } from "./domains-view";

export const metadata = {
  title: "Domain Generator · Admin",
  robots: { index: false, follow: false },
};

export interface ProspectNoDomain {
  slug: string;
  shortId: number | null;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  googleCategory: string;
  domain1: string;
  domain2: string;
  domain3: string;
}

export default async function DomainsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const db = await getD1();

  // Get all prospects missing at least one domain
  const { results } = await db
    .prepare(
      `SELECT slug, short_id, name, phone, address, city, state,
              google_category,
              COALESCE(domain1, '') as domain1,
              COALESCE(domain2, '') as domain2,
              COALESCE(domain3, '') as domain3
       FROM prospects
       WHERE domain1 IS NULL OR domain1 = ''
          OR domain2 IS NULL OR domain2 = ''
          OR domain3 IS NULL OR domain3 = ''
       ORDER BY created_at DESC`,
    )
    .all<{
      slug: string;
      short_id: number | null;
      name: string;
      phone: string;
      address: string;
      city: string | null;
      state: string | null;
      google_category: string | null;
      domain1: string;
      domain2: string;
      domain3: string;
    }>();

  // Filter by visible states
  const visibleStateSet = await getVisibleStates();

  const prospects: ProspectNoDomain[] = results
    .filter((r) => {
      if (visibleStateSet.size === 0) return true;
      return r.state ? visibleStateSet.has(r.state.toUpperCase()) : false;
    })
    .map((r) => ({
      slug: r.slug,
      shortId: r.short_id,
      name: r.name,
      phone: r.phone,
      address: r.address,
      city: r.city ?? "",
      state: r.state ?? "",
      googleCategory: r.google_category ?? "",
      domain1: r.domain1,
      domain2: r.domain2,
      domain3: r.domain3,
    }));

  const states = [...new Set(prospects.map((p) => p.state).filter(Boolean))].sort();
  const cities = [...new Set(prospects.map((p) => p.city).filter(Boolean))].sort();

  // Count total prospects for context
  const totalRow = await db
    .prepare("SELECT COUNT(*) as total FROM prospects")
    .first<{ total: number }>();
  const totalProspects = totalRow?.total ?? 0;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Domain Generator</h1>
          <p className="admin-lede">
            Generate available .com domain suggestions for prospects missing them.
            Filter by location, then generate in bulk or one at a time.
          </p>
        </div>
      </div>

      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{prospects.length}</span>
          <span className="admin-stat-label">Missing domains</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{totalProspects - prospects.length}</span>
          <span className="admin-stat-label">Have domains</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{states.length}</span>
          <span className="admin-stat-label">States</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{cities.length}</span>
          <span className="admin-stat-label">Cities</span>
        </div>
      </div>

      <DomainsView
        prospects={prospects}
        states={states}
        cities={cities}
      />
    </div>
  );
}
