"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createProspectAction } from "@/app/admin/leads/actions";
import { US_STATES } from "@/lib/us-states";

const initialState = { ok: false as boolean, error: undefined as string | undefined };

export function NewProspectForm() {
  const [state, formAction, isPending] = useActionState(createProspectAction, initialState);
  const [shopName, setShopName] = useState("");
  const [selectedState, setSelectedState] = useState("NJ");

  return (
    <form className="admin-section" action={formAction}>
      <h2 className="admin-section-title">Shop details</h2>
      <p className="admin-section-lede">
        Only the name is required. The preview site will be fully populated with
        placeholder content — the mechanic can update it later via the admin panel.
      </p>

      {state.error && (
        <div className="admin-error-banner">{state.error}</div>
      )}

      <div className="admin-grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Shop name *</span>
          <input
            className="admin-input"
            name="name"
            type="text"
            placeholder="Bright Auto Repair"
            required
            disabled={isPending}
            autoFocus
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
          <span className="admin-field-help">
            Used to generate the preview URL slug automatically.
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Phone</span>
          <input
            className="admin-input"
            name="phone"
            type="tel"
            placeholder="(201) 555-0100"
            disabled={isPending}
          />
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Street address</span>
          <input
            className="admin-input"
            name="street"
            type="text"
            placeholder="123 Main St"
            disabled={isPending}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">City</span>
          <input
            className="admin-input"
            name="city"
            type="text"
            placeholder="Clifton"
            disabled={isPending}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">State</span>
          <select
            className="admin-input"
            name="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
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
          <span className="admin-field-label">ZIP code</span>
          <input
            className="admin-input"
            name="zip"
            type="text"
            placeholder="07011"
            disabled={isPending}
          />
        </label>
      </div>

      <div className="admin-actions">
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isPending}
        >
          {isPending ? "Generating preview…" : "Create preview site"}
        </button>
        <Link href="/admin/leads" className="admin-btn admin-btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
