export const runtime = "edge";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = {
  title: "Forgot Password · Admin",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <span className="admin-auth-brand">Get Your Site Live</span>
          <h1 className="admin-auth-title">Reset password</h1>
          <p className="admin-auth-subtitle">
            Enter your email and a reset link will appear on screen.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
