import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getProspectVisits, getVisitCounts } from "@/lib/prospect-visits";
import { VisitsView } from "./visits-view";

export const metadata = {
  title: "Lead Visits · Admin",
  robots: { index: false, follow: false },
};

export default async function VisitsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const [visits, counts] = await Promise.all([
    getProspectVisits(500),
    getVisitCounts(),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Lead Visits</h1>
          <p className="admin-lede">
            Every time a prospect visits their preview site, it shows up here.
          </p>
        </div>
      </div>

      <VisitsView visits={visits} counts={counts} />
    </div>
  );
}
