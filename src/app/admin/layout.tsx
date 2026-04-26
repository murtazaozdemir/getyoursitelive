import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, refreshSessionIfNeeded } from "@/lib/session";
import { isFounder } from "@/lib/users";
import { AdminHeader } from "./admin-header";
import "./admin.css";
import "./admin-leads.css";
import "./admin-tasks.css";
import "./admin-help.css";

export const metadata: Metadata = {
  title: "Admin · Get Your Site Live",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Sliding window: silently extend session if token is past halfway
  if (user) await refreshSessionIfNeeded();

  return (
    <div className="admin-shell" data-theme="modern">
      {/* Login page hides the header — middleware ensures user is present everywhere else */}
      {user && <AdminHeader user={user} isFounder={isFounder(user)} />}
      <main className="admin-main">{children}</main>
      <footer className="admin-footer">
        <div className="admin-footer-inner">
          <span>Get Your Site Live · Admin</span>
          <Link href="/" className="admin-footer-link">
            Back to public site
          </Link>
        </div>
      </footer>
    </div>
  );
}
