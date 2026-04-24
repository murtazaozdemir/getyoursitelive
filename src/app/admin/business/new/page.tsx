export const runtime = "edge";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { NewBusinessForm } from "./new-business-form";

export default async function NewBusinessPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canManageBusinesses(user)) {
    return (
      <div className="admin-page">
        <h1 className="admin-h1">Not authorized</h1>
        <p className="admin-lede">Only admins can create new businesses.</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Dashboard / New business</p>
          <h1 className="admin-h1">Create a new business</h1>
          <p className="admin-lede">
            Enter the essentials to get started. You can fill in services,
            team, hours, and more after creating.
          </p>
        </div>
      </div>

      <NewBusinessForm />
    </div>
  );
}
