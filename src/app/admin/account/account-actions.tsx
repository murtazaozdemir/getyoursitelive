"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeEmailAction, changePasswordAction, updateProfileAction } from "./actions";

export function ProfileForm({ user }: {
  user: { name: string; phone?: string | null; street?: string | null; city?: string | null; zip?: string | null; state?: string | null };
}) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [street, setStreet] = useState(user.street ?? "");
  const [city, setCity] = useState(user.city ?? "");
  const [zip, setZip] = useState(user.zip ?? "");
  const [state, setState] = useState(user.state ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfileAction({ name, phone, street, city, zip, state });
      if (!result.ok) { setError(result.error ?? "Failed to update."); return; }
      setSuccess(true);
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Profile</h2>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Full name</span>
          <input type="text" required className="admin-input" value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Phone</span>
          <input type="tel" className="admin-input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isPending} placeholder="(555) 000-0000" />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Street address</span>
          <input type="text" className="admin-input" value={street} onChange={(e) => setStreet(e.target.value)} disabled={isPending} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">City</span>
          <input type="text" className="admin-input" value={city} onChange={(e) => setCity(e.target.value)} disabled={isPending} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">State</span>
          <input type="text" className="admin-input" value={state} onChange={(e) => setState(e.target.value)} disabled={isPending} placeholder="NJ" maxLength={2} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Zip code</span>
          <input type="text" className="admin-input" value={zip} onChange={(e) => setZip(e.target.value)} disabled={isPending} />
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-editor-message admin-editor-message--ok">Profile saved.</p>}

      <div className="admin-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending || !name.trim()}>
          {isPending ? "Saving\u2026" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

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
