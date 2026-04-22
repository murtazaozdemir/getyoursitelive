import Link from "next/link";
import { redirect } from "next/navigation";
import { listBusinesses } from "@/lib/db";
import { listProspects } from "@/lib/prospects";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

function BizCard({
  biz,
  prospect,
  showWarnings = true,
}: {
  biz: { slug: string; name: string; category: string; address: string };
  prospect?: { domain1?: string; domain2?: string; domain3?: string } | undefined;
  showWarnings?: boolean;
}) {
  const hasAddress = !!biz.address?.trim();
  const anyDomain = prospect?.domain1?.trim() || prospect?.domain2?.trim() || prospect?.domain3?.trim();
  const missingAddress = !hasAddress;
  const missingDomain = !anyDomain;
  const isAutoRepair = !biz.category || biz.category === "Auto Repair";

  return (
    <li className="admin-biz-card">
      <div className="admin-biz-card-body">
        <p className="admin-biz-card-slug">/{biz.slug}</p>
        <h2 className="admin-biz-card-name">{biz.name}</h2>
        <p className="admin-biz-card-meta">
          {biz.category}
          {hasAddress && <> &middot; {biz.address}</>}
        </p>
        <div className="admin-biz-card-chips">
          {!isAutoRepair && (
            <span className="prospect-chip prospect-chip--muted">{biz.category}</span>
          )}
          {showWarnings && missingAddress && (
            <span className="prospect-chip prospect-chip--warn">No address</span>
          )}
          {showWarnings && isAutoRepair && missingDomain && (
            <span className="prospect-chip prospect-chip--warn">No domain</span>
          )}
        </div>
      </div>
      <div className="admin-biz-card-actions">
        <Link href={`/admin/prospects/${biz.slug}`} className="admin-btn admin-btn--primary">
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
        {isAutoRepair && (
          <Link
            href={`/admin/proposal/${biz.slug}`}
            className="admin-btn admin-btn--ghost"
            target="_blank"
            rel="noreferrer"
          >
            Proposal
          </Link>
        )}
      </div>
    </li>
  );
}

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

  const autoRepair = all.filter((b) => !b.category || b.category === "Auto Repair");
  const other = all.filter((b) => b.category && b.category !== "Auto Repair");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Platform admin</p>
          <h1 className="admin-h1">All businesses</h1>
          <p className="admin-lede">
            {autoRepair.length} auto repair {autoRepair.length === 1 ? "site" : "sites"} in pipeline.
            {other.length > 0 && <> {other.length} other {other.length === 1 ? "business" : "businesses"} below.</>}
          </p>
        </div>
        <Link href="/admin/business/new" className="admin-btn admin-btn--primary">
          + New business
        </Link>
      </div>

      {autoRepair.length === 0 ? (
        <div className="admin-empty">
          <p>No auto repair businesses yet.</p>
          <Link href="/admin/business/new" className="admin-btn admin-btn--primary">
            Create the first one
          </Link>
        </div>
      ) : (
        <ul className="admin-biz-grid">
          {autoRepair.map((biz) => (
            <BizCard
              key={biz.slug}
              biz={biz}
              prospect={prospectBySlug[biz.slug]}
            />
          ))}
        </ul>
      )}

      {other.length > 0 && (
        <>
          <div className="admin-section-divider">
            <span>Other businesses — not in auto repair pipeline</span>
          </div>
          <ul className="admin-biz-grid">
            {other.map((biz) => (
              <BizCard
                key={biz.slug}
                biz={biz}
                prospect={prospectBySlug[biz.slug]}
                showWarnings={false}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
