import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getAuditLog, getAuditLogByUser, getAuditLogUsers } from "@/lib/audit-log";

const ACTION_LABELS: Record<string, string> = {
  login: "Signed in",
  login_failed: "Failed login",
  save_business: "Edited site",
  create_business: "Created site",
  delete_business: "Deleted site",
  create_prospect: "Added prospect",
  prospect_status: "Changed stage",
  update_prospect_info: "Updated contact info",
  delete_prospect: "Deleted prospect",
  change_email: "Changed email",
  change_password: "Changed password",
  create_user: "Created user",
  delete_user: "Deleted user",
  create_task: "Created task",
  complete_task: "Completed task",
  delete_task: "Deleted task",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function actionClass(action: string) {
  if (action === "login_failed") return "audit-badge audit-badge--danger";
  if (action.startsWith("delete")) return "audit-badge audit-badge--warn";
  if (action === "login") return "audit-badge audit-badge--muted";
  return "audit-badge audit-badge--default";
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");
  if (!canManageBusinesses(currentUser)) redirect("/admin");

  const params = await searchParams;
  const filterEmail = params.user || null;

  const [users, entries] = await Promise.all([
    getAuditLogUsers(),
    filterEmail ? getAuditLogByUser(filterEmail, 500) : getAuditLog(500),
  ]);

  const totalEntries = users.reduce((sum, u) => sum + u.count, 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Audit Log</h1>
          <p className="admin-lede">
            {totalEntries} total entries across {users.length} user{users.length !== 1 ? "s" : ""}.
            {filterEmail && <>{" "}Showing: <strong>{filterEmail}</strong></>}
          </p>
        </div>
      </div>

      {/* User filter pills */}
      <div className="audit-user-filters">
        <a
          href="/admin/audit"
          className={`audit-user-pill${!filterEmail ? " audit-user-pill--active" : ""}`}
        >
          All ({totalEntries})
        </a>
        {users.map((u) => (
          <a
            key={u.email}
            href={`/admin/audit?user=${encodeURIComponent(u.email)}`}
            className={`audit-user-pill${filterEmail === u.email ? " audit-user-pill--active" : ""}`}
          >
            {u.name && u.name !== "unknown" ? u.name : u.email} ({u.count})
          </a>
        ))}
      </div>

      {entries.length === 0 ? (
        <p className="admin-empty">No activity recorded{filterEmail ? ` for ${filterEmail}` : ""}.</p>
      ) : (
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Target</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className={e.action === "login_failed" ? "audit-row--danger" : ""}>
                  <td className="audit-cell-date">{formatDate(e.at)}</td>
                  <td className="audit-cell-who">
                    {e.userName && e.userName !== "unknown" ? (
                      <><span>{e.userName}</span><br /><span className="audit-cell-email">{e.userEmail}</span></>
                    ) : (
                      <span>{e.userEmail}</span>
                    )}
                  </td>
                  <td>
                    <span className={actionClass(e.action)}>
                      {ACTION_LABELS[e.action] ?? e.action}
                    </span>
                  </td>
                  <td className="audit-cell-slug">{e.slug ?? "—"}</td>
                  <td className="audit-cell-detail">{e.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
