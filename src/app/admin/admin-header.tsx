"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/lib/users";

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
          <span className="admin-header-build">
            {process.env.NEXT_PUBLIC_APP_VERSION}
            {" ("}
            {new Date(process.env.NEXT_PUBLIC_BUILD_TIME ?? "").toLocaleString("en-US", {
              month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
            })}
            {")"}
          </span>
          <nav className="admin-header-nav">
            <Link href="/admin" className="admin-header-nav-link">Sites</Link>
            <Link href="/admin/prospects" className="admin-header-nav-link">Prospects</Link>
          </nav>
        </div>

        <div className="admin-header-meta">
          <span className="admin-header-user">
            <span className="admin-header-user-name">{user.name}</span>
            <span className="admin-header-user-role" data-role={user.role}>
              {user.role === "admin" ? "Admin" : "Owner"}
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
