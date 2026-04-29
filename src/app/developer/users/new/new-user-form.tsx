"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { sendInviteAction } from "@/app/developer/users/actions";

const initialState = { ok: false as boolean, error: undefined as string | undefined, inviteUrl: undefined as string | undefined };

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(sendInviteAction, initialState);
  const [role, setRole] = useState("admin");

  if (state.ok) {
    return (
      <div className="admin-section">
        <div className="admin-success-banner">
          Invitation sent to <strong>{state.inviteUrl?.split("token=")[0] ? "the address you entered" : "the invitee"}</strong>.
          They'll receive an email with a link to complete their account setup.
        </div>
        {state.inviteUrl && (
          <div className="admin-field" style={{ marginTop: 16 }}>
            <span className="admin-field-label">Invite link (share manually if needed)</span>
            <code className="prospect-preview-url" style={{ display: "block", marginTop: 6, wordBreak: "break-all" }}>
              {state.inviteUrl}
            </code>
          </div>
        )}
        <div className="admin-actions" style={{ marginTop: 20 }}>
          <Link href="/developer/users" className="admin-btn admin-btn--primary">Back to Users</Link>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => { window.location.href = "/developer/users/new"; }}
          >
            Invite another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="admin-section" action={formAction}>
      {state.error && (
        <div className="admin-error-banner">{state.error}</div>
      )}
      <p className="admin-lede" style={{ marginBottom: 20 }}>
        Enter the new admin's email. They'll receive an invitation link where they can set their own name, phone, and password.
      </p>

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Email address *</span>
          <input
            className="admin-input"
            name="email"
            type="email"
            required
            disabled={isPending}
            placeholder="colleague@example.com"
            autoFocus
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Role *</span>
          <select
            className="admin-input"
            name="role"
            required
            disabled={isPending}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="admin">Admin</option>
            <option value="owner">Business Owner</option>
          </select>
        </label>

        {role === "owner" && (
          <label className="admin-field">
            <span className="admin-field-label">Business slug *</span>
            <input
              className="admin-input"
              name="ownedSlug"
              type="text"
              required
              disabled={isPending}
              placeholder="star-auto"
            />
            <span className="admin-field-help">
              The business this owner can edit.
            </span>
          </label>
        )}
      </div>

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isPending}
        >
          {isPending ? "Sending invitation…" : "Send invitation"}
        </button>
        <Link href="/developer/users" className="admin-btn admin-btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
