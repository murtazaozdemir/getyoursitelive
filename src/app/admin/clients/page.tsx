import Link from "next/link";
import { redirect } from "next/navigation";
import { listBusinesses } from "@/lib/db";
import { listProspects } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findUserById } from "@/lib/users";
import { getVisibleStates } from "@/lib/state-visibility";
import { FilterSortBar } from "@/app/admin/filter-bar";
import { parseAddress, unique } from "@/lib/address-utils";
import { zipCoords } from "@/lib/geo";

/** Haversine distance in miles between two lat/lng points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type SortKey = "createdAt" | "name" | "status" | "category" | "city" | "state" | "zip" | "distance";

function BizCard({
  biz,
  prospect,
  distance,
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
  distance?: number;
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
        {distance != null && (
          <p className="admin-biz-card-meta" style={{ fontWeight: 600, color: "var(--accent, #b45309)" }}>
            {Math.round(distance)} mi away
          </p>
        )}
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

export default async function ClientsPage({
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

  // Look up admin's zip for distance sorting
  const fullUser = await findUserById(user.id);
  const adminHasZip = !!fullUser?.zip;
  const origin = adminHasZip ? await zipCoords(fullUser!.zip!) : null;

  const sortBy = (params.sortBy ?? (adminHasZip ? "distance" : "name")) as SortKey;
  const sortDir = (params.sortDir ?? (sortBy === "distance" ? "asc" : "asc")) as "asc" | "desc";

  const [all, prospects] = await Promise.all([listBusinesses(), listProspects()]);
  const visibleStateSet = await getVisibleStates();
  const prospectBySlug = Object.fromEntries(prospects.map((p) => [p.slug, p]));

  // Only businesses that are paying clients (paid/delivered) or have no prospect record
  // Also filter by visible states
  const clients = all.filter((b) => {
    const p = prospectBySlug[b.slug];
    if (!(!p || p.status === "paid" || p.status === "delivered")) return false;
    // Apply state visibility filter
    if (visibleStateSet.size > 0) {
      const { state } = parseAddress(b.address);
      if (!state || !visibleStateSet.has(state.toUpperCase())) return false;
    }
    return true;
  });

  // Enrich with parsed address parts + distance
  const enriched = clients.map((b) => {
    const { city, state, zip } = parseAddress(b.address);
    const p = prospectBySlug[b.slug];
    let _distance: number | undefined;
    if (origin && p?.lat != null && p?.lng != null) {
      _distance = haversine(origin.lat, origin.lng, p.lat, p.lng);
    }
    return { ...b, _city: city, _state: state, _zip: zip, _distance };
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

  // Build geo tuples for cascading client-side filter logic
  const geoTuplesMap = new Map<string, { city: string; state: string; zip: string }>();
  for (const b of enriched) {
    const key = `${b._city}|${b._state}|${b._zip}`;
    if (!geoTuplesMap.has(key) && (b._city || b._state || b._zip)) {
      geoTuplesMap.set(key, { city: b._city, state: b._state, zip: b._zip });
    }
  }
  const geoTuples = [...geoTuplesMap.values()];

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
    if (sortBy === "distance") {
      const da = a._distance ?? 999999;
      const db = b._distance ?? 999999;
      return sortDir === "asc" ? da - db : db - da;
    }
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
      {!adminHasZip && (
        <div className="admin-banner admin-banner--warn">
          Add your zip code in <Link href="/admin/account" className="admin-link">My Account</Link> to sort clients by distance.
        </div>
      )}
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
        geoTuples={geoTuples}
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
                <BizCard key={biz.slug} biz={biz} prospect={prospectBySlug[biz.slug]} distance={biz._distance} />
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
                  <BizCard key={biz.slug} biz={biz} prospect={prospectBySlug[biz.slug]} distance={biz._distance} showWarnings={false} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
