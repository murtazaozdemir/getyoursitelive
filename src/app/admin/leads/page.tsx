import Link from "next/link";
import { redirect } from "next/navigation";
import { listProspects, PIPELINE_STAGES, type Prospect } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

function dataChips(p: Prospect) {
  const allDomains = p.domain1?.trim() && p.domain2?.trim() && p.domain3?.trim();
  const anyDomain = p.domain1?.trim() || p.domain2?.trim() || p.domain3?.trim();
  const hasAddress = !!p.address?.trim();

  const chips: { label: string; cls: string }[] = [];

  if (allDomains && hasAddress) {
    chips.push({ label: "Information Complete", cls: "prospect-chip--complete" });
  } else {
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

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

  const { view: viewParam } = await searchParams;
  const view = viewParam === "cards" ? "cards" : "pipeline";

  const prospects = await listProspects();

  const byStatus = Object.fromEntries(
    PIPELINE_STAGES.map(({ status }) => [
      status,
      prospects.filter((p) => p.status === status),
    ]),
  ) as Record<Prospect["status"], Prospect[]>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <h1 className="admin-h1">Leads</h1>
          <p className="admin-lede">
            {prospects.length} lead{prospects.length !== 1 ? "s" : ""} tracked.
            Click a card to view details or send the preview link.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* View toggle */}
          <div className="admin-view-toggle">
            <Link
              href="/admin/leads?view=pipeline"
              className={`admin-view-toggle-btn${view === "pipeline" ? " admin-view-toggle-btn--active" : ""}`}
            >
              Pipeline
            </Link>
            <Link
              href="/admin/leads?view=cards"
              className={`admin-view-toggle-btn${view === "cards" ? " admin-view-toggle-btn--active" : ""}`}
            >
              Cards
            </Link>
          </div>
          <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
            + Add lead
          </Link>
        </div>
      </div>

      {prospects.length === 0 ? (
        <div className="admin-empty">
          <p>No leads yet. Add your first one.</p>
          <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
            Add lead
          </Link>
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
                      <Link
                        key={p.slug}
                        href={`/admin/leads/${p.slug}`}
                        className="prospect-card"
                      >
                        <p className="prospect-card-name">{p.name}</p>
                        {p.phone && <p className="prospect-card-meta">{p.phone}</p>}
                        {p.address && <p className="prospect-card-meta">{p.address}</p>}
                        {chips.length > 0 && (
                          <div className="prospect-card-chips">
                            {chips.map((c) => (
                              <span key={c.label} className={`prospect-chip ${c.cls}`}>
                                {c.label}
                              </span>
                            ))}
                          </div>
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
                  <div className="admin-biz-card-chips" style={{ marginTop: 8 }}>
                    <span className={`prospect-badge ${statusBadge(p.status)}`} style={{ fontSize: 11 }}>
                      {statusLabel(p.status)}
                    </span>
                    {chips.map((c) => (
                      <span key={c.label} className={`prospect-chip ${c.cls}`}>
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="admin-biz-card-actions">
                  <Link href={`/admin/leads/${p.slug}`} className="admin-btn admin-btn--primary">
                    Lead info
                  </Link>
                  <Link
                    href={`/${p.slug}`}
                    className="admin-btn admin-btn--ghost"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview Site
                  </Link>
                  <Link
                    href={`/admin/proposal/${p.slug}`}
                    className="admin-btn admin-btn--ghost"
                    target="_blank"
                    rel="noreferrer"
                  >
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
