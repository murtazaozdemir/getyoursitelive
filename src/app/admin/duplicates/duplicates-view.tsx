"use client";

import { useState } from "react";
import Link from "next/link";

interface Prospect {
  slug: string;
  shortId: number | null;
  name: string;
  phone: string;
  address: string;
  googlePlaceId: string | null;
  googleCategory: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DupeGroup {
  key: string;
  type: "place_id" | "phone" | "name_address";
  prospects: Prospect[];
}

export function DuplicatesView({ groups: initialGroups }: { groups: DupeGroup[] }) {
  const [groups, setGroups] = useState(initialGroups);
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleDelete(slug: string) {
    if (!confirm(`Delete prospect "${slug}"? This removes the prospect record and its site preview.`)) {
      return;
    }

    setDeleting((prev) => new Set(prev).add(slug));
    setErrors((prev) => { const next = { ...prev }; delete next[slug]; return next; });

    try {
      const res = await fetch(`/api/admin/delete-prospect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json() as { ok?: boolean; error?: string };
      if (!data.ok) {
        setErrors((prev) => ({ ...prev, [slug]: data.error ?? "Failed" }));
        return;
      }

      setDeleted((prev) => new Set(prev).add(slug));

      // Remove from groups, and remove group if only 1 left
      setGroups((prev) =>
        prev
          .map((g) => ({
            ...g,
            prospects: g.prospects.filter((p) => p.slug !== slug),
          }))
          .filter((g) => g.prospects.length > 1),
      );
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [slug]: err instanceof Error ? err.message : "Network error",
      }));
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  }

  const typeLabel = (type: string) => {
    switch (type) {
      case "place_id": return "Same Google Place ID";
      case "phone": return "Same phone number";
      case "name_address": return "Similar name/address";
      default: return type;
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      found: "var(--admin-text-muted, #999)",
      contacted: "var(--color-warn, #d97706)",
      interested: "var(--admin-accent, #0e5a4f)",
      paid: "var(--color-success, #16a34a)",
      delivered: "var(--color-success, #16a34a)",
    };
    return (
      <span
        className="admin-badge"
        style={{ background: colors[status] ?? "#999", color: "#fff", fontSize: 11 }}
      >
        {status}
      </span>
    );
  };

  if (groups.length === 0) {
    return (
      <div className="admin-empty" style={{ marginTop: "2rem" }}>
        <p>All duplicates cleaned. Database is clean.</p>
      </div>
    );
  }

  return (
    <div className="dupe-groups">
      {groups.map((group) => (
        <div key={group.key} className="dupe-group">
          <div className="dupe-group-header">
            <span className="dupe-group-type">{typeLabel(group.type)}</span>
            <span className="dupe-group-count">{group.prospects.length} records</span>
          </div>

          <div className="dupe-group-cards">
            {group.prospects.map((p, i) => (
              <div
                key={p.slug}
                className={`dupe-card${i === 0 ? " dupe-card--keep" : ""}`}
              >
                {i === 0 && <span className="dupe-card-badge-keep">Keep (oldest)</span>}
                {i > 0 && <span className="dupe-card-badge-delete">Duplicate</span>}

                <h3 className="dupe-card-name">
                  <Link href={`/admin/leads/${p.slug}`} className="admin-link">
                    {p.name}
                  </Link>
                </h3>
                <p className="dupe-card-meta">{p.address}</p>
                <p className="dupe-card-meta">{p.phone}</p>
                <div className="dupe-card-tags">
                  {statusBadge(p.status)}
                  {p.googleCategory && (
                    <span className="dupe-card-tag">{p.googleCategory}</span>
                  )}
                  {p.googleRating != null && (
                    <span className="dupe-card-tag">
                      ★ {p.googleRating} ({p.googleReviewCount ?? 0})
                    </span>
                  )}
                  {p.shortId != null && (
                    <span className="dupe-card-tag">#{p.shortId}</span>
                  )}
                </div>
                <p className="dupe-card-meta" style={{ fontSize: 11, marginTop: 4 }}>
                  slug: {p.slug}
                </p>
                <p className="dupe-card-meta" style={{ fontSize: 11 }}>
                  created: {new Date(p.createdAt).toLocaleDateString()}
                </p>

                {i > 0 && !deleted.has(p.slug) && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={() => handleDelete(p.slug)}
                      disabled={deleting.has(p.slug)}
                      style={{ fontSize: 12 }}
                    >
                      {deleting.has(p.slug) ? "Deleting…" : "Delete this duplicate"}
                    </button>
                    {errors[p.slug] && (
                      <span style={{ fontSize: 11, color: "#dc2626", marginLeft: 8 }}>
                        {errors[p.slug]}
                      </span>
                    )}
                  </div>
                )}
                {deleted.has(p.slug) && (
                  <p style={{ fontSize: 12, color: "var(--color-success, #16a34a)", marginTop: 8 }}>
                    Deleted
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
