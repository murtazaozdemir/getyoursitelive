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
          <h1 className="admin-h1">Search by zip code</h1>
          <p className="admin-lede">
            Find auto repair shops (and related businesses) via Google Maps.
            One-click add as leads with auto-generated preview sites.
          </p>
        </div>
      </div>

      <ZipSearch />
    </div>
  );
}
