import Link from "next/link";
import { redirect } from "next/navigation";
import { listProspects, PIPELINE_STAGES, type Prospect } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

function cardChips(p: Prospect) {
  const allDomains = p.domain1?.trim() && p.domain2?.trim() && p.domain3?.trim();
  const anyDomain = p.domain1?.trim() || p.domain2?.trim() || p.domain3?.trim();
  const hasAddress = !!p.address?.trim();

  const chips: { label: string; cls: string }[] = [];

  if (allDomains && hasAddress) {
    chips.push({ label: "Completed", cls: "prospect-chip--complete" });
  } else {
    if (!hasAddress) chips.push({ label: "Address missing", cls: "prospect-chip--warn" });
    if (!anyDomain) chips.push({ label: "Domains missing", cls: "prospect-chip--warn" });
    else if (!allDomains) chips.push({ label: "Domains incomplete", cls: "prospect-chip--warn" });
  }

  return chips;
}

function statusColor(status: Prospect["status"]) {
  const map: Record<string, string> = {
    found: "prospect-badge--found",
    contacted: "prospect-badge--contacted",
    interested: "prospect-badge--interested",
    paid: "prospect-badge--paid",
    delivered: "prospect-badge--delivered",
  };
  return map[status] ?? "";
}

export default async function ProspectsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

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
          <h1 className="admin-h1">Lead Pipeline</h1>
          <p className="admin-lede">
            {prospects.length} lead{prospects.length !== 1 ? "s" : ""} tracked.
            Click a card to view details or send the preview link.
          </p>
        </div>
        <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
          + Add lead
        </Link>
      </div>

      {prospects.length === 0 ? (
        <div className="admin-empty">
          <p>No leads yet. Add your first one.</p>
          <Link href="/admin/leads/new" className="admin-btn admin-btn--primary">
            Add lead
          </Link>
        </div>
      ) : (
        <div className="prospect-pipeline">
          {PIPELINE_STAGES.map(({ status, label }) => (
            <div key={status} className="prospect-column">
              <div className="prospect-column-header">
                <span className={`prospect-badge ${statusColor(status)}`}>{label}</span>
                <span className="prospect-column-count">{byStatus[status].length}</span>
              </div>
              <div className="prospect-column-cards">
                {byStatus[status].length === 0 ? (
                  <div className="prospect-empty-col">Empty</div>
                ) : (
                  byStatus[status].map((p) => {
                    const chips = cardChips(p);
                    return (
                      <Link
                        key={p.slug}
                        href={`/admin/leads/${p.slug}`}
                        className="prospect-card"
                      >
                        <p className="prospect-card-name">{p.name}</p>
                        {p.phone && (
                          <p className="prospect-card-meta">{p.phone}</p>
                        )}
                        {p.address && (
                          <p className="prospect-card-meta">{p.address}</p>
                        )}
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
      )}
    </div>
  );
}
