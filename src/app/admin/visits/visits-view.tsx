"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProspectVisit } from "@/lib/prospect-visits";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function parseDevice(ua: string): string {
  if (!ua) return "Unknown";
  if (/bot|crawler|spider|slurp|googlebot|bingbot|facebookexternalhit/i.test(ua)) return "Bot";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/iPad/i.test(ua)) return "iPad";
  if (/Android/i.test(ua)) return "Android";
  if (/Mac OS/i.test(ua)) return "Mac";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Linux/i.test(ua)) return "Linux";
  return "Other";
}

interface CountRow {
  slug: string;
  businessName: string;
  count: number;
  lastVisit: string;
}

export function VisitsView({
  visits,
  counts,
}: {
  visits: ProspectVisit[];
  counts: CountRow[];
}) {
  const [tab, setTab] = useState<"all" | "summary">("all");
  const [slugFilter, setSlugFilter] = useState<string | null>(null);

  const filtered = slugFilter
    ? visits.filter((v) => v.slug === slugFilter)
    : visits;

  return (
    <>
      {/* Tab switcher */}
      <div className="admin-tabs" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`admin-tab ${tab === "all" ? "admin-tab--active" : ""}`}
          onClick={() => { setTab("all"); setSlugFilter(null); }}
        >
          All visits ({visits.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "summary" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("summary")}
        >
          By lead ({counts.length})
        </button>
      </div>

      {slugFilter && (
        <div style={{ marginBottom: 12 }}>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => setSlugFilter(null)}
            style={{ fontSize: 13 }}
          >
            Showing {filtered.length} visits for /{slugFilter} &mdash; clear filter
          </button>
        </div>
      )}

      {tab === "summary" ? (
        /* Summary table — visit counts per lead */
        <div className="admin-section">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Visits</th>
                <th>Last visit</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {counts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--admin-text-soft)" }}>
                    No visits recorded yet.
                  </td>
                </tr>
              )}
              {counts.map((c) => (
                <tr key={c.slug}>
                  <td>
                    <Link href={`/admin/leads/${c.slug}`} className="admin-link">
                      {c.businessName}
                    </Link>
                    <span style={{ fontSize: 12, color: "var(--admin-text-soft)", marginLeft: 6 }}>
                      /{c.slug}
                    </span>
                  </td>
                  <td>
                    <strong>{c.count}</strong>
                  </td>
                  <td>{timeAgo(c.lastVisit)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn admin-btn--ghost"
                      style={{ fontSize: 12 }}
                      onClick={() => { setTab("all"); setSlugFilter(c.slug); }}
                    >
                      View all
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* All visits table */
        <div className="admin-section">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Date &amp; time</th>
                <th>IP</th>
                <th>Device</th>
                <th>Referrer</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--admin-text-soft)" }}>
                    No visits recorded yet. Visits are tracked when prospects scan their QR code or type the URL.
                  </td>
                </tr>
              )}
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>
                    <Link href={`/admin/leads/${v.slug}`} className="admin-link">
                      {v.businessName}
                    </Link>
                    <span style={{ fontSize: 12, color: "var(--admin-text-soft)", marginLeft: 6 }}>
                      /{v.slug}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(v.visitedAt)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{v.ip}</td>
                  <td>{parseDevice(v.userAgent)}</td>
                  <td style={{ fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {v.referrer ? (() => { try { return new URL(v.referrer).hostname; } catch { return v.referrer; } })() : "Direct"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
