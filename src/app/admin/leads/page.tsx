import type React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { listProspects, PIPELINE_STAGES, type Prospect } from "@/lib/prospects";
import { listBusinesses } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findUserById, isDeveloper } from "@/lib/users";
import { FilterSortBar } from "@/app/admin/filter-bar";
import { LeadCards } from "./lead-cards";
import { ViewToggle } from "./view-toggle";
import { BackfillButton } from "./backfill-button";
import type { LeadCardData } from "./print-utils";
import { parseAddress, unique } from "@/lib/address-utils";
import { zipCoords } from "@/lib/geo";

/** Haversine distance in miles between two lat/lng points */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function dataChips(p: Prospect) {
  const allDomains = p.domain1?.trim() && p.domain2?.trim() && p.domain3?.trim();
  const anyDomain = p.domain1?.trim() || p.domain2?.trim() || p.domain3?.trim();
  const hasAddress = !!p.address?.trim();
  const chips: { label: string; cls: string }[] = [];
  if (!allDomains || !hasAddress) {
    if (!hasAddress) chips.push({ label: "Address missing", cls: "prospect-chip--warn" });
    if (!anyDomain) chips.push({ label: "Domains missing", cls: "prospect-chip--warn" });
    else if (!allDomains) chips.push({ label: "Domains incomplete", cls: "prospect-chip--warn" });
  }
  return chips;
}

function statusBadge(status: Prospect["status"]) {
  const map: Record<string, string> = {
    found: "prospect-badge--found",
    contacted: "prospect-badge--contacted",
    interested: "prospect-badge--interested",
    paid: "prospect-badge--paid",
    delivered: "prospect-badge--delivered",
  };
  return map[status] ?? "";
}

function statusLabel(status: Prospect["status"]) {
  return PIPELINE_STAGES.find((s) => s.status === status)?.label ?? status;
}

type SortKey = "createdAt" | "name" | "status" | "category" | "city" | "state" | "zip" | "distance";

type EnrichedProspect = Prospect & {
  _city: string;
  _state: string;
  _zip: string;
  _category: string;
  _distance?: number;
};

function applySort(
  list: EnrichedProspect[],
  sortBy: SortKey,
  sortDir: "asc" | "desc",
) {
  return [...list].sort((a, b) => {
    if (sortBy === "distance") {
      const da = a._distance ?? 999999;
      const db = b._distance ?? 999999;
      return sortDir === "asc" ? da - db : db - da;
    }
    let va = "";
    let vb = "";
    if (sortBy === "name") { va = a.name; vb = b.name; }
    else if (sortBy === "status") { va = a.status; vb = b.status; }
    else if (sortBy === "category") { va = a._category; vb = b._category; }
    else if (sortBy === "city") { va = a._city; vb = b._city; }
    else if (sortBy === "state") { va = a._state; vb = b._state; }
    else if (sortBy === "zip") { va = a._zip; vb = b._zip; }
    else { va = a.createdAt; vb = b.createdAt; }
    const cmp = va.localeCompare(vb);
    return sortDir === "asc" ? cmp : -cmp;
  });
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

  const params = await searchParams;
  const view = params.view === "cards" ? "cards" : "pipeline";
  const search = params.search ?? "";
  const filterStatus = params.filterStatus ?? "";
  const filterCity = params.filterCity ?? "";
  const filterState = params.filterState ?? "";
  const filterZip = params.filterZip ?? "";
  const filterCategory = params.filterCategory ?? "";
  const filterData = params.filterData ?? "";
  const distanceZip = params.distanceZip ?? "";

  // Look up full user record for address fields
  const fullUser = await findUserById(user.id);
  const adminHasZip = !!fullUser?.zip;
  const userAddressParts = [fullUser?.street, fullUser?.city, fullUser?.state, fullUser?.zip].filter(Boolean) as string[];
  const userAddress = userAddressParts.length > 0 ? userAddressParts.join(", ") : null;
  const userHomeCoords = adminHasZip ? await zipCoords(fullUser!.zip!) : null;
  const userHome = userHomeCoords && userAddress
    ? { lat: userHomeCoords.lat, lng: userHomeCoords.lng, name: fullUser?.name ?? user.name, address: userAddress }
    : null;

  const senderInfo = (fullUser?.company && userAddress)
    ? { company: fullUser.company, name: fullUser.name, address: userAddress, email: fullUser.email }
    : null;

  // Default sort by distance when admin has a zip code and no explicit sort param
  const sortBy = (params.sortBy ?? (adminHasZip ? "distance" : "createdAt")) as SortKey;
  const sortDir = (params.sortDir ?? (sortBy === "distance" ? "asc" : "desc")) as "asc" | "desc";

  const [allProspects, allBiz] = await Promise.all([listProspects(), listBusinesses()]);
  const bizBySlug = Object.fromEntries(allBiz.map((b) => [b.slug, b]));

  // "Found" leads are shared — all admins see them.
  // Once a lead moves past "found", only the admin who contacted them sees it
  // (unless you're the founder, who sees everything).
  const developer = isDeveloper(user);
  const active = allProspects.filter((p) => {
    if (p.status === "found") return true;
    if (developer) return true;
    return p.contactedBy === user.email;
  });

  // Use admin's zip as default origin for distance; manual distanceZip overrides
  const originZip = distanceZip || fullUser?.zip || "";
  const origin = originZip ? await zipCoords(originZip) : null;

  // Enrich with parsed address + category + distance
  const enriched: EnrichedProspect[] = active.map((p) => {
    // Prefer DB columns; fall back to parsing address for legacy data
    const parsed = parseAddress(p.address);
    const city = p.city || parsed.city;
    const state = p.state || parsed.state;
    const zip = p.zip || parsed.zip;
    const category = bizBySlug[p.slug]?.category ?? "Car repair and maintenance service";
    let dist: number | undefined;
    if (origin && p.lat != null && p.lng != null) {
      dist = haversine(origin.lat, origin.lng, p.lat, p.lng);
    }
    return { ...p, _city: city, _state: state, _zip: zip, _category: category, _distance: dist };
  });

  // Collect unique values for dropdowns — cascading: each dropdown
  // only shows values that match the other active geo filters.
  const geoMatch = (p: EnrichedProspect, skipField: "city" | "state" | "zip") => {
    if (skipField !== "city" && filterCity && p._city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (skipField !== "state" && filterState && p._state.toUpperCase() !== filterState.toUpperCase()) return false;
    if (skipField !== "zip" && filterZip && p._zip !== filterZip) return false;
    return true;
  };
  const allCities = unique(enriched.filter((p) => geoMatch(p, "city")).map((p) => p._city).filter(Boolean));
  const allStates = unique(enriched.filter((p) => geoMatch(p, "state")).map((p) => p._state).filter(Boolean));
  const allZips = unique(enriched.filter((p) => geoMatch(p, "zip")).map((p) => p._zip).filter(Boolean));
  const allCategories = unique(enriched.map((p) => p._category).filter(Boolean));

  // Build geo tuples for cascading client-side filter logic
  const geoTuplesMap = new Map<string, { city: string; state: string; zip: string }>();
  for (const p of enriched) {
    const key = `${p._city}|${p._state}|${p._zip}`;
    if (!geoTuplesMap.has(key) && (p._city || p._state || p._zip)) {
      geoTuplesMap.set(key, { city: p._city, state: p._state, zip: p._zip });
    }
  }
  const geoTuples = [...geoTuplesMap.values()];

  // Apply filters
  const searchLower = search.toLowerCase();
  const filtered = enriched.filter((p) => {
    if (search) {
      const haystack = `${p.name} ${p.phone ?? ""} ${p.address ?? ""} ${p.slug}`.toLowerCase();
      if (!haystack.includes(searchLower)) return false;
    }
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterCity && p._city.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterState && p._state.toUpperCase() !== filterState.toUpperCase()) return false;
    if (filterZip && p._zip !== filterZip) return false;
    if (filterCategory && p._category !== filterCategory) return false;
    if (filterData) {
      const anyDomain = p.domain1?.trim() || p.domain2?.trim() || p.domain3?.trim();
      const allDomains = p.domain1?.trim() && p.domain2?.trim() && p.domain3?.trim();
      if (filterData === "domains-missing" && anyDomain) return false;
      if (filterData === "domains-incomplete" && (!anyDomain || allDomains)) return false;
      if (filterData === "has-domains" && !allDomains) return false;
      if (filterData === "no-website" && p.website?.trim()) return false;
      if (filterData === "has-website" && !p.website?.trim()) return false;
    }
    return true;
  });

  // Apply sort
  const prospects = applySort(filtered, sortBy, sortDir);

  // For pipeline view, group by status (after filter+sort)
  const byStatus = Object.fromEntries(
    PIPELINE_STAGES.map(({ status }) => [
      status,
      prospects.filter((p) => p.status === status),
    ]),
  ) as Record<Prospect["status"], typeof prospects>;

  return (
    <div className="admin-page">
      <BackfillButton />
      {!adminHasZip && (
        <div className="admin-banner admin-banner--warn">
          Add your zip code in <Link href="/admin/account" className="admin-link">My Account</Link> to sort leads by distance.
        </div>
      )}
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 className="admin-h1" style={{ margin: 0 }}>Leads</h1>
            <ViewToggle view={view} />
          </div>
          <p className="admin-lede">
            {prospects.length} of {active.length} active lead{active.length !== 1 ? "s" : ""}.
            {" "}Paid leads move to Clients automatically.
          </p>
        </div>
        <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
          + Add lead
        </Link>
      </div>

      <FilterSortBar
        showSearch
        showStatus
        showDataFilter
        search={search}
        statuses={PIPELINE_STAGES.map((s) => ({ value: s.status, label: s.label }))}
        cities={allCities}
        states={allStates}
        zips={allZips}
        categories={allCategories}
        geoTuples={geoTuples}
        filterStatus={filterStatus}
        filterCity={filterCity}
        filterState={filterState}
        filterZip={filterZip}
        filterCategory={filterCategory}
        filterData={filterData}
        distanceZip={distanceZip}
        sortBy={sortBy}
        sortDir={sortDir}
      />

      {active.length === 0 ? (
        <div className="admin-empty">
          <p>No leads yet. Add your first one.</p>
          <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
            Add lead
          </Link>
        </div>
      ) : prospects.length === 0 ? (
        <div className="admin-empty">
          <p>No leads match your filters.</p>
        </div>
      ) : view === "pipeline" ? (
        /* ── PIPELINE VIEW ────────────────────────────────────── */
        <div className="prospect-pipeline">
          {PIPELINE_STAGES.map(({ status, label }) => (
            <div key={status} className="prospect-column">
              <div className="prospect-column-header">
                <span className={`prospect-badge ${statusBadge(status)}`}>{label}</span>
                <span className="prospect-column-count">{byStatus[status].length}</span>
              </div>
              <div className="prospect-column-cards">
                {byStatus[status].length === 0 ? (
                  <div className="prospect-empty-col">Empty</div>
                ) : (
                  byStatus[status].map((p) => {
                    const chips = dataChips(p);
                    return (
                      <Link key={p.slug} href={`/admin/leads/${p.slug}`} className="prospect-card">
                        <p className="prospect-card-name">{highlightText(p.name, search)}</p>
                        {p.phone && <p className="prospect-card-meta">{highlightText(p.phone, search)}</p>}
                        {p.address && <p className="prospect-card-meta">{highlightText(p.address, search)}</p>}
                        {p._distance != null && (
                          <p className="prospect-card-meta" style={{ fontWeight: 600, color: "var(--accent, #b45309)" }}>
                            {Math.round(p._distance)} mi away
                          </p>
                        )}
                        {chips.length > 0 && (
                          <div className="prospect-card-chips">
                            {chips.map((c) => (
                              <span key={c.label} className={`prospect-chip ${c.cls}`}>{c.label}</span>
                            ))}
                          </div>
                        )}
                        {p.contactedByName && (
                          <p className="prospect-card-meta" style={{ marginTop: 6, fontSize: 12, fontStyle: "italic" }}>
                            Contacted by {p.contactedByName}
                          </p>
                        )}
                        {p.notes.length > 0 && (
                          <p className="prospect-card-notes">
                            {p.notes.length} note{p.notes.length !== 1 ? "s" : ""}
                          </p>
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── CARDS VIEW ───────────────────────────────────────── */
        <LeadCards
          prospects={prospects.map((p): LeadCardData => ({
            slug: p.slug,
            name: p.name,
            phone: p.phone,
            address: p.address,
            status: p.status,
            statusLabel: statusLabel(p.status),
            statusBadgeClass: statusBadge(p.status),
            distance: p._distance,
            chips: dataChips(p),
            contactedByName: p.contactedByName,
            notesCount: p.notes.length,
            lat: p.lat,
            lng: p.lng,
          }))}
          userHome={userHome}
          senderInfo={senderInfo}
        />
      )}
    </div>
  );
}
