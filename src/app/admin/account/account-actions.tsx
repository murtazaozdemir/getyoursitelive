"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeEmailAction, changePasswordAction } from "./actions";

export function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await changeEmailAction(newEmail);
      if (!result.ok) {
        setError(result.error ?? "Failed to update email.");
        return;
      }

      // Sign out and redirect — session token still has old email
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login?msg=email-changed");
      router.refresh();
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Change email</h2>
      <p className="admin-lede">
        Currently signed in as <strong>{currentEmail}</strong>.
        After saving you will be signed out and must log in with the new email.
      </p>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">New email</span>
          <input
            type="email"
            autoComplete="email"
            required
            className="admin-input"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            disabled={isPending}
            placeholder="new@example.com"
          />
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isPending || !newEmail.trim()}
        >
          {isPending ? "Saving\u2026" : "Update email"}
        </button>
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(currentPassword, newPassword);
      if (!result.ok) {
        setError(result.error ?? "Failed to update password.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Change password</h2>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            className="admin-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            disabled={isPending}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">New password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            className="admin-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isPending}
            minLength={8}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            className="admin-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isPending}
          />
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-editor-message admin-editor-message--ok">Password updated.</p>}

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
        >
          {isPending ? "Saving\u2026" : "Update password"}
        </button>
      </div>
    </form>
  );
}
