export const runtime = "edge";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin login · Get Your Site Live",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const raw = typeof params.next === "string" ? params.next : "";
  // Allow only same-origin paths — reject protocol-relative and absolute URLs
  const nextPath = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-auth-brand">Get Your Site Live</div>
          <h1 className="admin-auth-title">Sign in</h1>
          <p className="admin-auth-subtitle">
            Admins and shop owners only.
          </p>
        </div>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}
