import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isFounder } from "@/lib/users";
import { CategoriesView } from "./categories-view";
import categoriesData from "../../../../data/google-categories.json";

export const runtime = "edge";

export const metadata = {
  title: "Google Categories · Admin",
  robots: { index: false, follow: false },
};

export default async function CategoriesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isFounder(user)) redirect("/admin");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Founder</p>
          <h1 className="admin-h1">Google Business Categories</h1>
          <p className="admin-lede">
            All {categoriesData.length.toLocaleString()} Google Business Profile categories.
            Use filters to find categories worth building templates for.
          </p>
        </div>
      </div>

      <CategoriesView categories={categoriesData} />
    </div>
  );
}
