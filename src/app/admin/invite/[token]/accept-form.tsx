"use client";

import { useActionState } from "react";
import { acceptInviteAction } from "./actions";
import { PasswordInput } from "@/components/ui/password-input";
import { US_STATES } from "@/lib/us-states";

interface Props {
  token: string;
  email: string;
  role: string;
}

const initialState = { ok: false as boolean, error: undefined as string | undefined };

export function AcceptInviteForm({ token, email, role }: Props) {
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initialState);

  if (state.ok) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Account created!</p>
        <p className="admin-auth-subtitle" style={{ marginBottom: 20 }}>
          Your account is ready. Check your email for a confirmation with the login link.
        </p>
        <a
          href={role === "owner" ? "/admin/login" : "/admin/login"}
          className="admin-btn admin-btn--primary"
        >
          Sign in →
        </a>
      </div>
    );
  }

  return (
    <form className="admin-auth-form" action={formAction}>
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div className="admin-error-banner">{state.error}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label className="admin-field">
          <span className="admin-field-label">First name *</span>
          <input
            className="admin-input"
            name="firstName"
            type="text"
            required
            disabled={isPending}
            placeholder="Jane"
            autoFocus
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Last name *</span>
          <input
            className="admin-input"
            name="lastName"
            type="text"
            required
            disabled={isPending}
            placeholder="Smith"
          />
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-field-label">Email</span>
        <input
          className="admin-input"
          type="email"
          value={email}
          disabled
          readOnly
          style={{ opacity: 0.6 }}
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Phone *</span>
        <input
          className="admin-input"
          name="phone"
          type="tel"
          required
          disabled={isPending}
          placeholder="(201) 555-0100"
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Street address</span>
        <input
          className="admin-input"
          name="street"
          type="text"
          disabled={isPending}
          placeholder="123 Main St"
        />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 12 }}>
        <label className="admin-field">
          <span className="admin-field-label">City</span>
          <input
            className="admin-input"
            name="city"
            type="text"
            disabled={isPending}
            placeholder="Newark"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">State</span>
          <select
            className="admin-input"
            name="state"
            defaultValue=""
            disabled={isPending}
          >
            <option value="">Select state</option>
            {US_STATES.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.abbr} — {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-field-label">ZIP</span>
          <input
            className="admin-input"
            name="zip"
            type="text"
            disabled={isPending}
            placeholder="07101"
            maxLength={10}
          />
        </label>
      </div>

      <label className="admin-field">
        <span className="admin-field-label">Password *</span>
        <PasswordInput
          className="admin-input"
          name="password"
          required
          minLength={8}
          disabled={isPending}
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Confirm password *</span>
        <PasswordInput
          className="admin-input"
          name="confirmPassword"
          required
          minLength={8}
          disabled={isPending}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />
      </label>

      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        style={{ width: "100%", marginTop: 4 }}
        disabled={isPending}
      >
        {isPending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
