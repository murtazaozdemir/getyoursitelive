import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";

export const runtime = "edge";

export default async function Envelope2SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Envelope 2 — Margins</h1>
          <p className="admin-lede">Page loading test — no DB calls.</p>
        </div>
      </div>
      <p>If you see this, the page works. The issue is in the editor component or DB calls.</p>
    </div>
  );
}
