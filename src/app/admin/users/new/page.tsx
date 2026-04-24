import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { NewUserForm } from "./new-user-form";

export const metadata = {
  title: "Invite User · Admin",
  robots: { index: false, follow: false },
};

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canManageBusinesses(user)) redirect("/admin");
  if (user.email !== "murtaza@getyoursitelive.com") redirect("/admin");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin/users" className="admin-crumb">Users</Link>
            {" / New"}
          </p>
          <h1 className="admin-h1">Invite user</h1>
        </div>
      </div>
      <NewUserForm />
    </div>
  );
}
