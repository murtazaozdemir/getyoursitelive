import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listUsers, canManageBusinesses } from "@/lib/users";
import { listInvitations } from "@/lib/invitations";
import { DeleteUserButton, RevokeInviteButton, ResendInviteButton } from "./user-actions";

export const metadata = {
  title: "Users · Admin",
  robots: { index: false, follow: false },
};

const FOUNDER_EMAIL = "murtaza@getyoursitelive.com";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");
  if (!canManageBusinesses(currentUser)) redirect("/admin");
  if (currentUser.email !== FOUNDER_EMAIL) redirect("/admin");

  const [users, invites] = await Promise.all([listUsers(), listInvitations()]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-h1">Users</h1>
          <p className="admin-lede">
            {users.length} active · {invites.length} pending invitation{invites.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link href="/admin/users/new" className="admin-btn admin-btn--primary">
            + Invite user
          </Link>
        </div>
      </div>

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Name / Email</th>
            <th>Role</th>
            <th>Owned slug</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>{u.email}</div>
              </td>
              <td>
                <span className="admin-header-user-role" data-role={u.role}>
                  {u.role === "admin"
                    ? (u.email === FOUNDER_EMAIL ? "Founder" : "Admin")
                    : "Business Owner"}
                </span>
              </td>
              <td>
                {u.ownedSlug ? <code>{u.ownedSlug}</code> : <span className="admin-text-muted">—</span>}
              </td>
              <td>
                <span className="prospect-chip" style={{ background: "var(--admin-success-bg, #d1fae5)", color: "var(--admin-success, #065f46)" }}>
                  Active
                </span>
              </td>
              <td>{u.createdAt ? fmt(u.createdAt) : "—"}</td>
              <td>
                {u.id !== currentUser.id && (
                  <DeleteUserButton id={u.id} name={u.name} />
                )}
              </td>
            </tr>
          ))}

          {invites.map((inv) => (
            <tr key={inv.token} style={{ opacity: 0.75 }}>
              <td>
                <div style={{ fontStyle: "italic", color: "var(--admin-text-soft)" }}>—</div>
                <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>{inv.email}</div>
              </td>
              <td>
                <span className="admin-header-user-role" data-role={inv.role}>
                  {inv.role === "admin" ? "Admin" : "Business Owner"}
                </span>
              </td>
              <td>
                {inv.ownedSlug ? <code>{inv.ownedSlug}</code> : <span className="admin-text-muted">—</span>}
              </td>
              <td>
                <span className="prospect-chip prospect-chip--warn">
                  Pending invite
                </span>
              </td>
              <td>{fmt(inv.createdAt)}</td>
              <td style={{ display: "flex", gap: 6 }}>
                <ResendInviteButton email={inv.email} role={inv.role} ownedSlug={inv.ownedSlug} />
                <RevokeInviteButton token={inv.token} email={inv.email} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
