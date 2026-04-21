"use client";

import type { Business } from "@/lib/business-types";
import type { UserRole } from "@/lib/users";
import type { ThemeName } from "@/types/site";

const THEMES: ThemeName[] = ["industrial", "modern", "luxury", "friendly"];

export function IdentityTab({
  business,
  userRole,
  update,
}: {
  business: Business;
  userRole: UserRole;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  function patchInfo<K extends keyof Business["businessInfo"]>(
    key: K,
    value: Business["businessInfo"][K],
  ) {
    update("businessInfo", { ...business.businessInfo, [key]: value });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Identity</h2>
      <p className="admin-section-lede">
        Core details that appear across your site — name, tagline, and which
        visual theme you&rsquo;re using.
      </p>

      <div className="admin-grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Logo URL</span>
          <input
            className="admin-input"
            type="url"
            value={business.businessInfo.logoUrl}
            onChange={(e) => patchInfo("logoUrl", e.target.value)}
            placeholder="https://…"
          />
          <span className="admin-field-help">
            Leave blank to use the default wrench icon. Use the Inline editor to upload a file.
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Business name</span>
          <input
            className="admin-input"
            type="text"
            value={business.businessInfo.name}
            onChange={(e) => patchInfo("name", e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">
            URL slug
            {userRole !== "admin" && (
              <span className="admin-field-hint"> (admin only)</span>
            )}
          </span>
          <input
            className="admin-input"
            type="text"
            value={business.slug}
            disabled={userRole !== "admin"}
            onChange={(e) => update("slug", e.target.value.toLowerCase())}
          />
          <span className="admin-field-help">
            Your site lives at /{business.slug}
          </span>
        </label>

        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Tagline</span>
          <input
            className="admin-input"
            type="text"
            value={business.businessInfo.tagline}
            onChange={(e) => patchInfo("tagline", e.target.value)}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Category</span>
          <input
            className="admin-input"
            type="text"
            value={business.category}
            onChange={(e) => update("category", e.target.value)}
          />
          <span className="admin-field-help">
            e.g. &ldquo;Auto Repair&rdquo;, &ldquo;Salon&rdquo;
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Founded year</span>
          <input
            className="admin-input"
            type="number"
            min={1800}
            max={new Date().getFullYear()}
            value={business.businessInfo.founded}
            onChange={(e) => patchInfo("founded", Number(e.target.value))}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Theme</span>
          <select
            className="admin-input"
            value={business.theme}
            onChange={(e) => update("theme", e.target.value as ThemeName)}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
