import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { isFounder } from "@/lib/users";
import { CategoriesView } from "./categories-view";
import categoriesData from "../../../../data/google-categories.json";

export const metadata = {
  title: "Categories & Templates · Admin",
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
          <h1 className="admin-h1">Categories &amp; Templates</h1>
          <p className="admin-lede">
            All {categoriesData.length.toLocaleString()} Google Business Profile categories.
            Use filters and search to find categories worth building templates for.
          </p>
        </div>
      </div>

      <div className="admin-page-nav">
        <Link href="/admin/google-maps-info">Google Maps Info</Link>
        <span className="admin-page-nav-sep">/</span>
        <span className="admin-page-nav-current">Categories &amp; Templates</span>
        <span className="admin-page-nav-sep">/</span>
        <Link href="/admin/google-fields">Google Fields</Link>
      </div>

      <CategoriesView categories={categoriesData} />
    </div>
  );
}
