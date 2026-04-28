"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeEmailAction, changePasswordAction, updateProfileAction } from "./actions";
import { PasswordInput } from "@/components/ui/password-input";

export function ProfileForm({ user }: {
  user: { email: string; name: string; firstName?: string | null; lastName?: string | null; phone?: string | null; street?: string | null; city?: string | null; zip?: string | null; state?: string | null };
}) {
  // Derive firstName/lastName from legacy name if not yet split
  const defaultFirst = user.firstName ?? user.name.split(" ")[0] ?? "";
  const defaultLast = user.lastName ?? user.name.split(" ").slice(1).join(" ") ?? "";

  const [firstName, setFirstName] = useState(defaultFirst);
  const [lastName, setLastName] = useState(defaultLast);
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
      const result = await updateProfileAction({ firstName, lastName, phone, street, city, zip, state });
      if (!result.ok) { setError(result.error ?? "Failed to update."); return; }
      setSuccess(true);
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Profile</h2>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">First name</span>
          <input type="text" required className="admin-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isPending} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Last name</span>
          <input type="text" className="admin-input" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isPending} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Email</span>
          <input type="email" className="admin-input" value={user.email} disabled readOnly style={{ opacity: 0.6 }} />
          <span style={{ fontSize: 12, color: "var(--admin-text-soft)", marginTop: 4 }}>To change your email, use the section below.</span>
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
        <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending || !firstName.trim()}>
          {isPending ? "Saving\u2026" : "Save profile"}
        </button>
      </div>
    </form>
  );
}

export function ChangeEmailForm({ currentEmail: _ }: { currentEmail: string }) {
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
        Your email is not just contact info — it&rsquo;s the credential you use
        to sign in. Changing it will immediately sign you out of all sessions.
        You&rsquo;ll need to verify your new email before you can log in again.
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
          <PasswordInput
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
          <PasswordInput
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
          <PasswordInput
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
