import Link from "next/link";
import { redirect } from "next/navigation";
import { listBusinesses } from "@/lib/db";
import { listProspects } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { FilterSortBar } from "@/app/admin/filter-bar";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const US_STATES = new Set([
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL",
  "IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE",
  "NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD",
  "TN","TX","UT","VT","VA","WA","WV","WI","WY",
]);

function looksLikeStreet(s: string): boolean {
  return /^\d/.test(s) || /\b(st|ave|blvd|rd|dr|ln|ct|way|hwy|pkwy|suite|ste|tower)\b/i.test(s);
}

function parseAddress(address?: string) {
  if (!address?.trim()) return { city: "", state: "", zip: "" };
  const parts = address.split(",").map((s) => s.trim());

  let state = "";
  let zip = "";
  let statePartIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    const tokens = parts[i].split(/\s+/);
    const stateToken = tokens.find((t) => US_STATES.has(t.toUpperCase()));
    if (stateToken) {
      state = stateToken.toUpperCase();
      const zipToken = tokens.find((t) => /^\d{5}/.test(t));
      zip = zipToken ?? "";
      statePartIndex = i;
      break;
    }
  }

  let city = "";
  if (statePartIndex > 0) {
    for (let i = statePartIndex - 1; i >= 0; i--) {
      if (!looksLikeStreet(parts[i])) {
        city = parts[i];
        break;
      }
    }
  }

  return { city, state, zip };
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)].filter(Boolean).sort() as T[];
}

type SortKey = "createdAt" | "name" | "status" | "category" | "city" | "state" | "zip";

function BizCard({
  biz,
  prospect,
  showWarnings = true,
}: {
  biz: { slug: string; name: string; category: string; address: string };
  prospect?: {
    domain1?: string;
    domain2?: string;
    domain3?: string;
    proposalSentAt?: string;
    contactedByName?: string;
    contactedBy?: string;
  } | undefined;
  showWarnings?: boolean;
}) {
  const hasAddress = !!biz.address?.trim();
  const anyDomain = prospect?.domain1?.trim() || prospect?.domain2?.trim() || prospect?.domain3?.trim();
  const isAutoRepair = !biz.category || biz.category === "Car repair and maintenance service";

  return (
    <li className="admin-biz-card">
      <div className="admin-biz-card-body">
        <p className="admin-biz-card-slug">/{biz.slug}</p>
        <h2 className="admin-biz-card-name">{biz.name}</h2>
        <p className="admin-biz-card-meta">
          {biz.category}
          {hasAddress && <> &middot; {biz.address}</>}
        </p>
        <div className="admin-biz-card-chips">
          {!isAutoRepair && (
            <span className="prospect-chip prospect-chip--muted">{biz.category}</span>
          )}
          {showWarnings && !hasAddress && (
            <span className="prospect-chip prospect-chip--warn">No address</span>
          )}
          {showWarnings && isAutoRepair && !anyDomain && (
            <span className="prospect-chip prospect-chip--warn">No domain</span>
          )}
        </div>
        {prospect?.contactedBy && (
          <p className="admin-biz-card-meta" style={{ marginTop: 8 }}>
            💳 {prospect.contactedByName ?? prospect.contactedBy}
          </p>
        )}
      </div>
      <div className="admin-biz-card-actions">
        {prospect && (
          <Link href={`/admin/leads/${biz.slug}`} className="admin-btn admin-btn--primary">
            Lead info
          </Link>
        )}
        <Link href={`/${biz.slug}`} className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
          Preview Site
        </Link>
        {isAutoRepair && prospect?.proposalSentAt && (
          <Link
            href={`/admin/proposal/${biz.slug}`}
            className="admin-btn admin-btn--ghost"
            target="_blank"
            rel="noreferrer"
            title="View the proposal that was sent to this client"
          >
            Proposal sent {fmtDate(prospect.proposalSentAt)}
          </Link>
        )}
      </div>
    </li>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "owner" && user.ownedSlug) {
    redirect(`/${user.ownedSlug}/admin/edit`);
  }

  if (!canManageBusinesses(user)) {
    return (
      <div className="admin-page">
        <h1 className="admin-h1">Not authorized</h1>
        <p className="admin-lede">The platform admin dashboard is for administrators only.</p>
      </div>
    );
  }

  const params: Record<string, string | undefined> = await (searchParams ?? Promise.resolve({}));
  const filterCity = params.filterCity ?? "";
  const filterState = params.filterState ?? "";
  const filterZip = params.filterZip ?? "";
  const filterCategory = params.filterCategory ?? "";
  const sortBy = (params.sortBy ?? "name") as SortKey;
  const sortDir = (params.sortDir === "desc" ? "desc" : "asc") as "asc" | "desc";

  const [all, prospects] = await Promise.all([listBusinesses(), listProspects()]);
  const prospectBySlug = Object.fromEntries(prospects.map((p) => [p.slug, p]));

  // Only businesses that are paying clients (paid/delivered) or have no prospect record
  const clients = all.filter((b) => {
    const p = prospectBySlug[b.slug];
    return !p || p.status === "paid" || p.status === "delivered";
  });

  // Enrich with parsed address parts
  const enriched = clients.map((b) => {
    const { city, state, zip } = parseAddress(b.address);
    return { ...b, _city: city, _state: state, _zip: zip };
  });

  // Collect unique values for dropdowns — cascading geo filters
  const geoMatch = (b: typeof enriched[0], skipField: "city" | "state" | "zip") => {
    if (skipField !== "city" && filterCity && b._city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (skipField !== "state" && filterState && b._state.toUpperCase() !== filterState.toUpperCase()) return false;
    if (skipField !== "zip" && filterZip && b._zip !== filterZip) return false;
    return true;
  };
  const allCities = unique(enriched.filter((b) => geoMatch(b, "city")).map((b) => b._city).filter(Boolean));
  const allStates = unique(enriched.filter((b) => geoMatch(b, "state")).map((b) => b._state).filter(Boolean));
  const allZips = unique(enriched.filter((b) => geoMatch(b, "zip")).map((b) => b._zip).filter(Boolean));
  const allCategories = unique(enriched.map((b) => b.category).filter(Boolean));

  // Apply filters
  const filtered = enriched.filter((b) => {
    if (filterCity && b._city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterState && b._state.toUpperCase() !== filterState.toUpperCase()) return false;
    if (filterZip && b._zip !== filterZip) return false;
    if (filterCategory && b.category !== filterCategory) return false;
    return true;
  });

  // Apply sort
  const sorted = [...filtered].sort((a, b) => {
    let va = "";
    let vb = "";
    if (sortBy === "name") { va = a.name; vb = b.name; }
    else if (sortBy === "category") { va = a.category ?? ""; vb = b.category ?? ""; }
    else if (sortBy === "city") { va = a._city; vb = b._city; }
    else if (sortBy === "state") { va = a._state; vb = b._state; }
    else if (sortBy === "zip") { va = a._zip; vb = b._zip; }
    else { va = a.name; vb = b.name; }
    const cmp = va.localeCompare(vb);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const autoRepair = sorted.filter((b) => !b.category || b.category === "Car repair and maintenance service");
  const other = sorted.filter((b) => b.category && b.category !== "Car repair and maintenance service");

  const totalClients = clients.filter((b) => !b.category || b.category === "Car repair and maintenance service").length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <h1 className="admin-h1">Clients</h1>
          <p className="admin-lede">
            {totalClients} paying {totalClients === 1 ? "client" : "clients"}.
            {clients.filter((b) => b.category && b.category !== "Car repair and maintenance service").length > 0 && (
              <> {clients.filter((b) => b.category && b.category !== "Car repair and maintenance service").length} other businesses below.</>
            )}
            {" "}Leads become clients once marked Paid in the pipeline.
          </p>
        </div>
        <Link href="/admin/business/new" className="admin-btn admin-btn--primary">
          + New business
        </Link>
      </div>

      <FilterSortBar
        cities={allCities}
        states={allStates}
        zips={allZips}
        categories={allCategories}
        filterCity={filterCity}
        filterState={filterState}
        filterZip={filterZip}
        filterCategory={filterCategory}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {clients.length === 0 ? (
        <div className="admin-empty">
          <p>No paying clients yet. Mark a lead as Paid in the pipeline to see them here.</p>
          <Link href="/admin/leads" className="admin-btn admin-btn--primary">
            Go to Lead Pipeline
          </Link>
        </div>
      ) : sorted.length === 0 ? (
        <div className="admin-empty">
          <p>No clients match your filters.</p>
        </div>
      ) : (
        <>
          {autoRepair.length > 0 && (
            <ul className="admin-biz-grid">
              {autoRepair.map((biz) => (
                <BizCard key={biz.slug} biz={biz} prospect={prospectBySlug[biz.slug]} />
              ))}
            </ul>
          )}

          {other.length > 0 && (
            <>
              <div className="admin-section-divider">
                <span>Other businesses — not in auto repair pipeline</span>
              </div>
              <ul className="admin-biz-grid">
                {other.map((biz) => (
                  <BizCard key={biz.slug} biz={biz} prospect={prospectBySlug[biz.slug]} showWarnings={false} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
