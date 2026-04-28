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

/** Score how "rich" a prospect record is — more populated fields = higher score */
function richnessScore(p: Prospect): number {
  let score = 0;
  if (p.phone) score += 1;
  if (p.address) score += 1;
  if (p.googlePlaceId) score += 2;
  if (p.googleCategory) score += 1;
  if (p.googleRating != null) score += 2;
  if (p.googleReviewCount != null && p.googleReviewCount > 0) score += 1;
  if (p.shortId != null) score += 1;
  // Prefer advanced statuses over "found"
  if (p.status !== "found") score += 3;
  return score;
}

/** Sort prospects so the richest record is first (ties broken by newest) */
function sortByRichness(prospects: Prospect[]): Prospect[] {
  return [...prospects].sort((a, b) => {
    const diff = richnessScore(b) - richnessScore(a);
    if (diff !== 0) return diff;
    // Tie-break: newer record (more likely to have fresh data)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function DuplicatesView({ groups: initialGroups }: { groups: DupeGroup[] }) {
  // Sort each group so the richest record is first
  const [groups, setGroups] = useState(() =>
    initialGroups.map((g) => ({ ...g, prospects: sortByRichness(g.prospects) }))
  );
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transferring, setTransferring] = useState<Set<string>>(new Set());
  const [pendingTransfer, setPendingTransfer] = useState<Set<string>>(new Set());

  async function handleTransferAndDelete(dupeSlug: string, keepSlug: string, status: string) {
    setPendingTransfer((prev) => new Set(prev).add(dupeSlug));
  }

  async function confirmTransferAndDelete(dupeSlug: string, keepSlug: string, status: string) {
    setTransferring((prev) => new Set(prev).add(dupeSlug));
    setErrors((prev) => { const next = { ...prev }; delete next[dupeSlug]; return next; });

    try {
      // Transfer stage to the "Keep" record
      const transferRes = await fetch(`/api/admin/transfer-stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromSlug: dupeSlug, toSlug: keepSlug }),
      });
      const transferData = await transferRes.json() as { ok?: boolean; error?: string };
      if (!transferData.ok) {
        setErrors((prev) => ({ ...prev, [dupeSlug]: transferData.error ?? "Transfer failed" }));
        return;
      }

      // Update the Keep record's status in local state
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          prospects: g.prospects.map((p) =>
            p.slug === keepSlug ? { ...p, status } : p
          ),
        }))
      );

      // Now delete the duplicate
      await doDelete(dupeSlug);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [dupeSlug]: err instanceof Error ? err.message : "Network error",
      }));
    } finally {
      setTransferring((prev) => {
        const next = new Set(prev);
        next.delete(dupeSlug);
        return next;
      });
      setPendingTransfer((prev) => {
        const next = new Set(prev);
        next.delete(dupeSlug);
        return next;
      });
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`Delete prospect "${slug}"? This removes the prospect record and its site preview.`)) {
      return;
    }
    await doDelete(slug);
  }

  async function doDelete(slug: string) {
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

  const matchReason = (group: DupeGroup) => {
    switch (group.type) {
      case "place_id": return <>Same Google Place ID: <strong>{group.key}</strong></>;
      case "phone": return <>Same phone: <strong>{group.prospects[0]?.phone || group.key}</strong></>;
      case "name_address": return <>Same name + address: <strong>{group.key}</strong></>;
      default: return group.type;
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
            <span className="dupe-group-reason">{matchReason(group)}</span>
            <span className="dupe-group-count">{group.prospects.length} records</span>
          </div>

          <div className="dupe-group-cards">
            {group.prospects.map((p, i) => (
              <div
                key={p.slug}
                className={`dupe-card${i === 0 ? " dupe-card--keep" : ""}`}
              >
                {i === 0 && <span className="dupe-card-badge-keep">Keep (most info)</span>}
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
                    {pendingTransfer.has(p.slug) ? (
                      <div style={{ fontSize: 12, background: "var(--admin-bg-warn, #fef3c7)", border: "1px solid var(--color-warn, #d97706)", borderRadius: 6, padding: "8px 10px" }}>
                        <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
                          This lead is in &ldquo;{p.status}&rdquo; stage.
                        </p>
                        <p style={{ margin: "0 0 8px" }}>
                          Transfer stage to <strong>{group.prospects[0].name}</strong> (the record to keep), then delete this duplicate?
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="admin-btn admin-btn--danger"
                            onClick={() => confirmTransferAndDelete(p.slug, group.prospects[0].slug, p.status)}
                            disabled={transferring.has(p.slug)}
                            style={{ fontSize: 12 }}
                          >
                            {transferring.has(p.slug) ? "Transferring…" : "Transfer & delete"}
                          </button>
                          <button
                            className="admin-btn admin-btn--ghost"
                            onClick={() => setPendingTransfer((prev) => { const next = new Set(prev); next.delete(p.slug); return next; })}
                            disabled={transferring.has(p.slug)}
                            style={{ fontSize: 12 }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          className="admin-btn admin-btn--danger"
                          onClick={() => {
                            if (p.status !== "found") {
                              handleTransferAndDelete(p.slug, group.prospects[0].slug, p.status);
                            } else {
                              handleDelete(p.slug);
                            }
                          }}
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
                      </>
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
