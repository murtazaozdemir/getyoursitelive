import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listUsers, canManageBusinesses } from "@/lib/users";
import { DeleteUserButton } from "./user-actions";

export const metadata = {
  title: "Users · Admin",
  robots: { index: false, follow: false },
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");
  if (!canManageBusinesses(currentUser)) redirect("/admin");
  if (currentUser.email !== "murtaza@getyoursitelive.com") redirect("/admin");

  const users = await listUsers();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-h1">Users</h1>
          <p className="admin-lede">
            Manage admin accounts and shop owner logins.
          </p>
        </div>
        <div className="admin-page-header-actions">
          <Link href="/admin/users/new" className="admin-btn admin-btn--primary">
            + Invite user
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="admin-empty">
          <p className="admin-empty-text">No users found.</p>
        </div>
      ) : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Owned slug</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="admin-header-user-role" data-role={u.role}>
                    {u.role === "admin"
                      ? (u.email === "murtaza@getyoursitelive.com" ? "Founder" : "Admin")
                      : "Business Owner"}
                  </span>
                </td>
                <td>
                  {u.ownedSlug ? (
                    <code>{u.ownedSlug}</code>
                  ) : (
                    <span className="admin-text-muted">—</span>
                  )}
                </td>
                <td>
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td>
                  {u.id !== currentUser.id && (
                    <DeleteUserButton id={u.id} name={u.name} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
