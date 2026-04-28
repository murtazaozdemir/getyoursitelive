"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/users";

/**
 * Header for the per-shop admin area at /{slug}/admin.
 * Differs from the master-admin header: brand is the shop name, and the
 * crumb/back link goes to the shop's public site, not /admin.
 */
export function ShopAdminHeader({
  user,
  businessName,
  slug,
  isDeveloper,
}: {
  user: SessionUser;
  businessName: string;
  slug: string;
  isDeveloper: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isEditMode = pathname === `/${slug}/admin/edit`;
  const isFormMode = pathname === `/${slug}/admin/form`;

  function displayRole(): string {
    if (user.role === "admin") {
      return isDeveloper ? "Developer" : "Admin";
    }
    return "Business Owner";
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${slug}/admin/login`);
    router.refresh();
  }

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-header-brand">
          <Link href={`/${slug}/admin/edit`} className="admin-header-brand-link">
            <span className="admin-header-mark">SITE EDITOR</span>
            <span className="admin-header-title">{businessName}</span>
          </Link>
        </div>

        <div className="admin-header-meta">
          {(isEditMode || isFormMode) && (
            <div className="admin-mode-toggle" role="tablist" aria-label="Edit mode">
              <Link
                href={`/${slug}/admin/edit`}
                className="admin-mode-toggle-btn"
                data-active={isEditMode}
                role="tab"
                aria-selected={isEditMode}
              >
                Inline
              </Link>
              <Link
                href={`/${slug}/admin/form`}
                className="admin-mode-toggle-btn"
                data-active={isFormMode}
                role="tab"
                aria-selected={isFormMode}
              >
                Form
              </Link>
            </div>
          )}
          {user.role === "admin" && (
            <Link href="/admin" className="admin-btn admin-btn--ghost">
              All sites &rarr;
            </Link>
          )}
          <span className="admin-header-user">
            <span className="admin-header-user-name">{user.name}</span>
            <span className="admin-header-user-role" data-role={user.role}>
              {displayRole()}
            </span>
          </span>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
