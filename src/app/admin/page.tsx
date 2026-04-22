import Link from "next/link";
import { redirect } from "next/navigation";
import { listBusinesses } from "@/lib/db";
import { listProspects } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) return null; // middleware should catch this, defensive guard

  // Shop owners don't belong on the platform dashboard — route them to
  // their own shop's admin area instead.
  if (user.role === "owner" && user.ownedSlug) {
    redirect(`/${user.ownedSlug}/admin/edit`);
  }

  // Only admins from here on
  if (!canManageBusinesses(user)) {
    return (
      <div className="admin-page">
        <h1 className="admin-h1">Not authorized</h1>
        <p className="admin-lede">
          The platform admin dashboard is for administrators only.
        </p>
      </div>
    );
  }

  const [all, prospects] = await Promise.all([listBusinesses(), listProspects()]);
  const prospectBySlug = Object.fromEntries(prospects.map((p) => [p.slug, p]));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <h1 className="admin-h1">All businesses</h1>
          <p className="admin-lede">
            {all.length} {all.length === 1 ? "site" : "sites"} under management.
            Click a card to edit, or create a new one.
          </p>
        </div>
        <Link href="/admin/business/new" className="admin-btn admin-btn--primary">
          + New business
        </Link>
      </div>

      {all.length === 0 ? (
        <div className="admin-empty">
          <p>No businesses yet.</p>
          <Link href="/admin/business/new" className="admin-btn admin-btn--primary">
            Create the first one
          </Link>
        </div>
      ) : (
        <ul className="admin-biz-grid">
          {all.map((biz) => {
            const p = prospectBySlug[biz.slug];
            const hasAddress = !!biz.address?.trim();
            const anyDomain = p?.domain1?.trim() || p?.domain2?.trim() || p?.domain3?.trim();
            const missingAddress = !hasAddress;
            const missingDomain = !anyDomain;
            return (
              <li key={biz.slug} className="admin-biz-card">
                <div className="admin-biz-card-body">
                  <p className="admin-biz-card-slug">/{biz.slug}</p>
                  <h2 className="admin-biz-card-name">{biz.name}</h2>
                  <p className="admin-biz-card-meta">
                    {biz.category}
                    {hasAddress && <> &middot; {biz.address}</>}
                  </p>
                  {(missingAddress || missingDomain) && (
                    <div className="admin-biz-card-chips">
                      {missingAddress && (
                        <span className="prospect-chip prospect-chip--warn">No address</span>
                      )}
                      {missingDomain && (
                        <span className="prospect-chip prospect-chip--warn">No domain</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="admin-biz-card-actions">
                  <Link
                    href={`/admin/prospects/${biz.slug}`}
                    className="admin-btn admin-btn--primary"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/${biz.slug}`}
                    className="admin-btn admin-btn--ghost"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View live &rarr;
                  </Link>
                  <Link
                    href={`/admin/proposal/${biz.slug}`}
                    className="admin-btn admin-btn--ghost"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Proposal
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
