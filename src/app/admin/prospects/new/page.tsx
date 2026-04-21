import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { NewProspectForm } from "./new-prospect-form";

export default async function NewProspectPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Prospects</p>
          <h1 className="admin-h1">Add prospect</h1>
          <p className="admin-lede">
            Enter the shop&rsquo;s details. A preview site will be auto-generated
            at <code>/their-slug</code> — ready to send immediately.
          </p>
        </div>
      </div>

      <NewProspectForm />
    </div>
  );
}
