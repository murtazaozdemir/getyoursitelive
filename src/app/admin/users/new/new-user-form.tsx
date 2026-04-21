"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createUserAction } from "@/app/admin/users/actions";

const initialState = { ok: false as boolean, error: undefined as string | undefined };

export function NewUserForm() {
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);
  const [role, setRole] = useState("owner");

  return (
    <form className="admin-section" action={formAction}>
      {state.error && (
        <div className="admin-error-banner">{state.error}</div>
      )}

      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Name *</span>
          <input
            className="admin-input"
            name="name"
            type="text"
            required
            disabled={isPending}
            placeholder="Jane Smith"
            autoFocus
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Email *</span>
          <input
            className="admin-input"
            name="email"
            type="email"
            required
            disabled={isPending}
            placeholder="jane@example.com"
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Password *</span>
          <input
            className="admin-input"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={isPending}
            autoComplete="new-password"
          />
          <span className="admin-field-help">Minimum 8 characters.</span>
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
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        {role === "owner" && (
          <label className="admin-field">
            <span className="admin-field-label">Owned slug *</span>
            <input
              className="admin-input"
              name="ownedSlug"
              type="text"
              required
              disabled={isPending}
              placeholder="star-auto"
            />
            <span className="admin-field-help">
              The business slug this owner can edit.
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
          {isPending ? "Creating\u2026" : "Create user"}
        </button>
        <Link href="/admin/users" className="admin-btn admin-btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
