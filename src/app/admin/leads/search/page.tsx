import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { ZipSearch } from "./zip-search";

export default async function SearchPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Leads</p>
          <h1 className="admin-h1">Lead Search</h1>
          <p className="admin-lede">
            Search by city to find businesses across all zip codes, or search a single zip.
            Results are cached — repeat searches cost nothing.
          </p>
        </div>
      </div>

      <ZipSearch />
    </div>
  );
}
