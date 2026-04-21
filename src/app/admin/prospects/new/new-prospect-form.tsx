"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createProspectAction } from "@/app/admin/prospects/actions";

const initialState = { ok: false as boolean, error: undefined as string | undefined };

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^-+|-+$/g, "");
}

const NOISE_WORDS = ["auto", "repair", "center", "shop", "garage", "service", "services", "automotive", "motors", "car", "cars"];

function domainSuggestions(name: string): string[] {
  if (!name.trim()) return [];

  const base = slugify(name);
  if (!base) return [];

  // Short version: remove noise words
  const words = name.toLowerCase().split(/\s+/);
  const coreWords = words.filter((w) => !NOISE_WORDS.includes(slugify(w)));
  const core = coreWords.map(slugify).join("") || base;

  const suggestions = [
    `${base}.com`,
    `${core}auto.com`,
    `${base}nj.com`,
  ];

  // Deduplicate
  return [...new Set(suggestions)].slice(0, 3);
}

export function NewProspectForm() {
  const [state, formAction, isPending] = useActionState(createProspectAction, initialState);
  const [shopName, setShopName] = useState("");

  const domains = domainSuggestions(shopName);

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

        {domains.length > 0 && (
          <div className="admin-field admin-field--wide">
            <span className="admin-field-label">Available domain ideas</span>
            <div className="prospect-domain-suggestions">
              {domains.map((d) => (
                <span key={d} className="prospect-domain-chip">{d}</span>
              ))}
            </div>
            <span className="admin-field-help">
              Check availability at{" "}
              <a
                href="https://www.cloudflare.com/products/registrar/"
                target="_blank"
                rel="noreferrer"
                className="admin-link"
              >
                Cloudflare Registrar
              </a>{" "}
              (~$10/yr).
            </span>
          </div>
        )}

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
          <input
            className="admin-input"
            name="state"
            type="text"
            placeholder="NJ"
            defaultValue="NJ"
            disabled={isPending}
          />
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
        <Link href="/admin/prospects" className="admin-btn admin-btn--ghost">
          Cancel
        </Link>
      </div>
    </form>
  );
}
