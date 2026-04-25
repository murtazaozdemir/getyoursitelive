"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBusinessAction } from "@/app/admin/actions";
import type { ThemeName } from "@/types/site";
import { getTemplateForCategory, getAllCategories } from "@/lib/templates/registry";

const THEMES: ThemeName[] = ["industrial", "modern", "luxury", "friendly"];
const CATEGORIES = getAllCategories();

export function NewBusinessForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [theme, setTheme] = useState<ThemeName>("modern");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const template = getTemplateForCategory(category);
      const business = template.buildBlankBusiness(slug, name, theme);
      business.category = category;
      const res = await createBusinessAction(business);
      if (res.ok) {
        router.push(`/${res.slug}/admin`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form className="admin-section" onSubmit={handleSubmit} noValidate>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Business name</span>
          <input
            className="admin-input"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </label>

        <label className="admin-field">
          <span className="admin-field-label">URL slug</span>
          <input
            className="admin-input"
            value={slug}
            required
            placeholder="joes-garage"
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            disabled={isPending}
          />
          <span className="admin-field-help">
            Site will live at /{slug || "your-slug"}
          </span>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Category</span>
          <select
            className="admin-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={isPending}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span className="admin-field-label">Theme</span>
          <select
            className="admin-input"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeName)}
            disabled={isPending}
          >
            {THEMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="admin-auth-error" role="alert">{error}</div>}

      <div className="admin-editor-toolbar">
        <div />
        <div className="admin-editor-toolbar-right">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending || !slug || !name}>
            {isPending ? "Creating\u2026" : "Create business"}
          </button>
        </div>
      </div>
    </form>
  );
}
