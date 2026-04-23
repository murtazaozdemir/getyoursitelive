"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/users";

const FOUNDER_EMAIL = "murtaza@getyoursitelive.com";

function displayRole(user: SessionUser): string {
  if (user.role === "admin") {
    return user.email === FOUNDER_EMAIL ? "Founder" : "Admin";
  }
  return "Business Owner";
}

export function AdminHeader({ user }: { user: SessionUser }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <div className="admin-header-brand">
          <Link href="/admin" className="admin-header-brand-link">
            <span className="admin-header-mark">GYSL</span>
            <span className="admin-header-title">Admin</span>
          </Link>
          {(() => {
            const version = process.env.NEXT_PUBLIC_APP_VERSION;
            const raw = process.env.NEXT_PUBLIC_BUILD_TIME;
            const d = raw ? new Date(raw) : null;
            const dateStr = d && !isNaN(d.getTime())
              ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
              : null;
            if (!version && !dateStr) return null;
            return (
              <span className="admin-header-build">
                {version}{dateStr ? ` (${dateStr})` : ""}
              </span>
            );
          })()}
          <nav className="admin-header-nav">
            <Link href="/admin" className="admin-header-nav-link">Clients</Link>
            <Link href="/admin/leads" className="admin-header-nav-link">Leads</Link>
            {user.role === "admin" && user.email === FOUNDER_EMAIL && (
              <Link href="/admin/users" className="admin-header-nav-link">Users</Link>
            )}
            {user.role === "admin" && (
              <Link href="/admin/audit" className="admin-header-nav-link">Audit Log</Link>
            )}
            {user.role === "admin" && (
              <Link href="/admin/setup" className="admin-header-nav-link">Setup</Link>
            )}
          </nav>
        </div>

        <div className="admin-header-meta">
          <span className="admin-header-user">
            <span className="admin-header-user-name">{user.name}</span>
            <span className="admin-header-user-role" data-role={user.role}>
              {displayRole(user)}
            </span>
          </span>
          <Link href="/admin/account" className="admin-btn admin-btn--ghost">
            My Account
          </Link>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
