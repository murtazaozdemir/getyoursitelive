export const runtime = "edge";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata = {
  title: "Reset Password · Admin",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="admin-auth-shell">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <span className="admin-auth-brand">Get Your Site Live</span>
            <h1 className="admin-auth-title">Invalid link</h1>
          </div>
          <p className="admin-lede">
            This reset link is missing or invalid. Please request a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <span className="admin-auth-brand">Get Your Site Live</span>
          <h1 className="admin-auth-title">Set new password</h1>
          <p className="admin-auth-subtitle">Choose a new password for your account.</p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
