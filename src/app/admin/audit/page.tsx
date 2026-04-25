import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getAuditLog } from "@/lib/audit-log";

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

export default async function AuditLogPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canManageBusinesses(user)) redirect("/admin");

  const entries = await getAuditLog(500);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Audit Log</h1>
          <p className="admin-lede">Every sign-in and content change, newest first.</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="admin-empty">No activity recorded yet.</p>
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
