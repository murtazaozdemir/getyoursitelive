"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import type { SessionUser } from "@/lib/users";

function displayRole(user: SessionUser, isFounder: boolean): string {
  if (user.role === "admin") {
    return isFounder ? "Founder" : "Admin";
  }
  return "Business Owner";
}

export function AdminHeader({ user, isFounder }: { user: SessionUser; isFounder: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setAccountOpen(false); }, [pathname]);

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
            <Link href="/admin/leads" className="admin-header-nav-link">Leads</Link>
            <Link href="/admin/tasks" className="admin-header-nav-link">Tasks</Link>
            <Link href="/admin" className="admin-header-nav-link">Clients</Link>
          </nav>
        </div>

        <div className="admin-header-meta">
          <span className="admin-header-user">
            <span className="admin-header-user-name">{user.name}</span>
            <span className="admin-header-user-role" data-role={user.role}>
              {displayRole(user, isFounder)}
            </span>
          </span>

          {/* My Account dropdown */}
          <div className="admin-account-menu" ref={accountRef}>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
            >
              My Account
            </button>
            {accountOpen && (
              <div className="admin-account-dropdown">
                <Link href="/admin/account" className="admin-account-dropdown-item">
                  Account settings
                </Link>
                {isFounder && (
                  <>
                    <div className="admin-account-dropdown-divider" />
                    <Link href="/admin/users" className="admin-account-dropdown-item">
                      Users
                    </Link>
                    <Link href="/admin/audit" className="admin-account-dropdown-item">
                      Audit Log
                    </Link>
                    <Link href="/admin/setup" className="admin-account-dropdown-item">
                      Setup
                    </Link>
                    <a href="/api/admin/backup" className="admin-account-dropdown-item" download>
                      Download Backup
                    </a>
                  </>
                )}
                <div className="admin-account-dropdown-divider" />
                <button
                  type="button"
                  className="admin-account-dropdown-item admin-account-dropdown-item--danger"
                  onClick={handleLogout}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Keep standalone sign out for non-dropdown fallback */}
          {!isFounder && (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={handleLogout}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
