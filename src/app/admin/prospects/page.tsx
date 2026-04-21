import Link from "next/link";
import { redirect } from "next/navigation";
import { listProspects, PIPELINE_STAGES, type Prospect } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

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
          <h1 className="admin-h1">Prospect Pipeline</h1>
          <p className="admin-lede">
            {prospects.length} prospect{prospects.length !== 1 ? "s" : ""} tracked.
            Click a card to view details or send the preview link.
          </p>
        </div>
        <Link href="/admin/prospects/new" className="admin-btn admin-btn--primary">
          + Add prospect
        </Link>
      </div>

      {prospects.length === 0 ? (
        <div className="admin-empty">
          <p>No prospects yet. Add your first one.</p>
          <Link href="/admin/prospects/new" className="admin-btn admin-btn--primary">
            Add prospect
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
                  byStatus[status].map((p) => (
                    <Link
                      key={p.slug}
                      href={`/admin/prospects/${p.slug}`}
                      className="prospect-card"
                    >
                      <p className="prospect-card-name">{p.name}</p>
                      {p.phone && (
                        <p className="prospect-card-meta">{p.phone}</p>
                      )}
                      {p.address && (
                        <p className="prospect-card-meta">{p.address}</p>
                      )}
                      {p.notes.length > 0 && (
                        <p className="prospect-card-notes">
                          {p.notes.length} note{p.notes.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
