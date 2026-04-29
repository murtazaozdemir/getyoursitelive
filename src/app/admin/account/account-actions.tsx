"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeEmailAction, changePasswordAction, updateProfileAction } from "./actions";
import { PasswordInput } from "@/components/ui/password-input";

/** Strip to digits, format as (XXX) XXX-XXXX for display. */
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
}

function stripPhone(formatted: string): string {
  return formatted.replace(/\D/g, "").slice(0, 10);
}

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

export function ProfileForm({ user }: {
  user: { email: string; name: string; firstName?: string | null; lastName?: string | null; phone?: string | null; street?: string | null; city?: string | null; zip?: string | null; state?: string | null; wifiIp?: string | null; mobileIp?: string | null; company?: string | null };
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
  const [company, setCompany] = useState(user.company ?? "");
  const [wifiIp, setWifiIp] = useState(user.wifiIp ?? "");
  const [mobileIp, setMobileIp] = useState(user.mobileIp ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateProfileAction({ firstName, lastName, phone, street, city, zip, state, wifiIp, mobileIp, company });
      if (!result.ok) { setError(result.error ?? "Failed to update."); return; }
      setSuccess(true);
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit}>
      <h2 className="admin-section-title">Profile</h2>

      <div className="admin-grid">
        <label className="admin-field" style={{ gridColumn: "1 / -1" }}>
          <span className="admin-field-label">Company</span>
          <input type="text" className="admin-input" value={company} onChange={(e) => setCompany(e.target.value)} disabled={isPending} placeholder="e.g. SALESFORCE HUB LLC" />
        </label>
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
          <input type="tel" className="admin-input" value={formatPhone(phone)} onChange={(e) => setPhone(stripPhone(e.target.value))} disabled={isPending} placeholder="(555) 000-0000" />
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
          <select className="admin-input" value={state} onChange={(e) => setState(e.target.value)} disabled={isPending}>
            <option value="">Select state</option>
            {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Zip code</span>
          <input type="text" className="admin-input" value={zip} onChange={(e) => setZip(e.target.value)} disabled={isPending} />
        </label>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "var(--admin-text-soft)" }}>IP Addresses (for visit filtering)</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">WiFi IP</span>
          <input type="text" className="admin-input" value={wifiIp} onChange={(e) => setWifiIp(e.target.value)} disabled={isPending} placeholder="e.g. 69.112.211.104" style={{ fontFamily: "monospace" }} />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Mobile IP</span>
          <input type="text" className="admin-input" value={mobileIp} onChange={(e) => setMobileIp(e.target.value)} disabled={isPending} placeholder="e.g. 174.200.50.1" style={{ fontFamily: "monospace" }} />
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
