import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser, refreshSessionIfNeeded } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { AdminHeader } from "../admin/admin-header";
import "../admin/admin.css";
import "../admin/admin-leads.css";
import "../admin/admin-tasks.css";
import "../admin/admin-help.css";

export const metadata: Metadata = {
  title: "Developer · Get Your Site Live",
  robots: { index: false, follow: false },
};

export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Sliding window: silently extend session if token is past halfway
  if (user) await refreshSessionIfNeeded();

  return (
    <div className="admin-shell" data-theme="modern">
      {user && <AdminHeader user={user} isDeveloper={isDeveloper(user)} />}
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
