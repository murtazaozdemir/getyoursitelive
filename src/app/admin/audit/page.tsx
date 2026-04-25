import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getAuditLog, getAuditLogUsers } from "@/lib/audit-log";
import { AuditTable } from "./audit-table";

export default async function AuditLogPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");
  if (!canManageBusinesses(currentUser)) redirect("/admin");

  const [users, entries] = await Promise.all([
    getAuditLogUsers(),
    getAuditLog(500),
  ]);

  const totalEntries = users.reduce((sum, u) => sum + u.count, 0);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Audit Log</h1>
          <p className="admin-lede">
            {totalEntries} total entries across {users.length} user{users.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <AuditTable entries={entries} users={users} />
    </div>
  );
}
