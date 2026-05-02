import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { listStateVisibility } from "@/lib/state-visibility";
import { StatesView } from "./states-view";

export const metadata = {
  title: "State Visibility · Developer",
  robots: { index: false, follow: false },
};

export default async function StatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const states = await listStateVisibility();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">State Visibility</h1>
          <p className="admin-lede">
            Toggle which states appear in the leads filter dropdown.
            Hidden states still keep their data — they just don&rsquo;t clutter the dropdown.
          </p>
        </div>
      </div>

      <StatesView states={states} />
    </div>
  );
}
