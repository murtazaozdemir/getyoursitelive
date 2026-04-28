import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listUsers, canManageBusinesses, isDeveloper } from "@/lib/users";
import { listInvitations } from "@/lib/invitations";
import { UsersTable } from "./users-table";

export const metadata = {
  title: "Users · Admin",
  robots: { index: false, follow: false },
};

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/admin/login");
  if (!canManageBusinesses(currentUser)) redirect("/admin");
  if (!isDeveloper(currentUser)) redirect("/admin");

  const [users, invites] = await Promise.all([listUsers(), listInvitations()]);

  const userRows = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    ownedSlug: u.ownedSlug,
    createdAt: u.createdAt,
    isDeveloper: isDeveloper(u),
    isSelf: u.id === currentUser.id,
  }));

  const inviteRows = invites.map((inv) => ({
    token: inv.token,
    email: inv.email,
    role: inv.role,
    ownedSlug: inv.ownedSlug,
    createdAt: inv.createdAt,
  }));

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

      <UsersTable users={userRows} invites={inviteRows} />
    </div>
  );
}
