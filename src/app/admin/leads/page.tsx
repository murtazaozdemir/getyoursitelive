import Link from "next/link";
import { redirect } from "next/navigation";
import { listProspects, PIPELINE_STAGES, type Prospect } from "@/lib/prospects";
import { listBusinesses } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { FilterSortBar } from "@/app/admin/filter-bar";
import zipcodes from "zipcodes";

function parseAddress(address?: string) {
  if (!address?.trim()) return { city: "", state: "", zip: "" };
  const parts = address.split(",").map((s) => s.trim());
  // Last part is always "STATE ZIP" (e.g. "DC 20012" or "NJ 07011")
  const lastPart = parts[parts.length - 1] ?? "";
  const stateZip = lastPart.split(/\s+/);
  if (parts.length >= 3) {
    // "123 Main St, City, ST 07011"
    return {
      city: parts[parts.length - 2] ?? "",
      state: stateZip[0] ?? "",
      zip: stateZip[1] ?? "",
    };
  }
  if (parts.length === 2) {
    // "City, ST 07011" (no street)
    return {
      city: parts[0] ?? "",
      state: stateZip[0] ?? "",
      zip: stateZip[1] ?? "",
    };
  }
  return { city: "", state: "", zip: "" };
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

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)].filter(Boolean).sort() as T[];
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
  const filterStatus = params.filterStatus ?? "";
  const filterCity = params.filterCity ?? "";
  const filterState = params.filterState ?? "";
  const filterZip = params.filterZip ?? "";
  const filterCategory = params.filterCategory ?? "";
  const filterData = params.filterData ?? "";
  const distanceZip = params.distanceZip ?? "";
  const sortBy = (params.sortBy ?? "createdAt") as SortKey;
  const sortDir = (params.sortDir === "asc" ? "asc" : "desc") as "asc" | "desc";

  const [allProspects, allBiz] = await Promise.all([listProspects(), listBusinesses()]);
  const bizBySlug = Object.fromEntries(allBiz.map((b) => [b.slug, b]));

  // Only active leads (not graduated to clients)
  const active = allProspects.filter((p) => p.status !== "paid" && p.status !== "delivered");

  // Look up origin coordinates if distance zip provided
  const originInfo = distanceZip ? zipcodes.lookup(distanceZip) : undefined;

  // Enrich with parsed address + category + distance
  const enriched: EnrichedProspect[] = active.map((p) => {
    const { city, state, zip } = parseAddress(p.address);
    const category = bizBySlug[p.slug]?.category ?? "Car repair and maintenance service";
    let dist: number | undefined;
    if (originInfo && zip) {
      const miles = zipcodes.distance(distanceZip, zip);
      if (miles != null) dist = miles;
    }
    return { ...p, _city: city, _state: state, _zip: zip, _category: category, _distance: dist };
  });

  // Collect unique values for dropdowns
  const allCities = unique(enriched.map((p) => p._city).filter(Boolean));
  const allStates = unique(enriched.map((p) => p._state).filter(Boolean));
  const allZips = unique(enriched.map((p) => p._zip).filter(Boolean));
  const allCategories = unique(enriched.map((p) => p._category).filter(Boolean));

  // Apply filters
  const filtered = enriched.filter((p) => {
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
    PIPELINE_STAGES.filter(({ status }) => status !== "paid" && status !== "delivered").map(({ status }) => [
      status,
      prospects.filter((p) => p.status === status),
    ]),
  ) as Record<Prospect["status"], typeof prospects>;

  const activeStatuses = PIPELINE_STAGES.filter(
    ({ status }) => status !== "paid" && status !== "delivered",
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <h1 className="admin-h1">Leads</h1>
          <p className="admin-lede">
            {prospects.length} of {active.length} active lead{active.length !== 1 ? "s" : ""}.
            {" "}Paid leads move to Clients automatically.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="admin-view-toggle">
            <Link
              href={`/admin/leads?view=pipeline`}
              className={`admin-view-toggle-btn${view === "pipeline" ? " admin-view-toggle-btn--active" : ""}`}
            >
              Pipeline
            </Link>
            <Link
              href={`/admin/leads?view=cards`}
              className={`admin-view-toggle-btn${view === "cards" ? " admin-view-toggle-btn--active" : ""}`}
            >
              Cards
            </Link>
          </div>
          <Link href="/admin/leads/search" className="admin-btn admin-btn--ghost">
            Zip search
          </Link>
          <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
            + Add lead
          </Link>
        </div>
      </div>

      <FilterSortBar
        showStatus
        showDataFilter
        statuses={activeStatuses.map((s) => ({ value: s.status, label: s.label }))}
        cities={allCities}
        states={allStates}
        zips={allZips}
        categories={allCategories}
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
          {activeStatuses.map(({ status, label }) => (
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
                        <p className="prospect-card-name">{p.name}</p>
                        {p.phone && <p className="prospect-card-meta">{p.phone}</p>}
                        {p.address && <p className="prospect-card-meta">{p.address}</p>}
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
        <ul className="admin-biz-grid">
          {prospects.map((p) => {
            const chips = dataChips(p);
            return (
              <li key={p.slug} className="admin-biz-card">
                <div className="admin-biz-card-body">
                  <p className="admin-biz-card-slug">/{p.slug}</p>
                  <h2 className="admin-biz-card-name">{p.name}</h2>
                  {p.phone && <p className="admin-biz-card-meta">{p.phone}</p>}
                  {p.address && <p className="admin-biz-card-meta">{p.address}</p>}
                  {p._distance != null && (
                    <p className="admin-biz-card-meta" style={{ fontWeight: 600, color: "var(--accent, #b45309)" }}>
                      {Math.round(p._distance)} mi away
                    </p>
                  )}
                  <div className="admin-biz-card-chips" style={{ marginTop: 8 }}>
                    <span className={`prospect-badge ${statusBadge(p.status)}`} style={{ fontSize: 11 }}>
                      {statusLabel(p.status)}
                    </span>
                    {chips.map((c) => (
                      <span key={c.label} className={`prospect-chip ${c.cls}`}>{c.label}</span>
                    ))}
                  </div>
                  {p.contactedByName && (
                    <p className="admin-biz-card-meta" style={{ marginTop: 6, fontSize: 12, fontStyle: "italic" }}>
                      Contacted by {p.contactedByName}
                    </p>
                  )}
                </div>
                <div className="admin-biz-card-actions">
                  <Link href={`/admin/leads/${p.slug}`} className="admin-btn admin-btn--primary">
                    Lead info
                  </Link>
                  <Link href={`/${p.slug}`} className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
                    Preview Site
                  </Link>
                  <Link href={`/admin/proposal/${p.slug}`} className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
                    Proposal
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
