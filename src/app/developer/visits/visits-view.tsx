"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProspectVisit } from "@/lib/prospect-visits";
import { SortableTable, Column, FilterDef } from "@/components/admin/sortable-table";

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
  return new Date(iso).toLocaleDateString("en-US", {
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
  if (/bot|crawl|spider|slurp|semrush|ahref|bytespider|gptbot|claudebot|bingpreview|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|curl|wget|python|httpx|go-http|java\/|headlesschrome|phantomjs|lighthouse/i.test(ua)) return "Bot";
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

/* ---------- All Visits columns ---------- */
const allVisitsCols: Column<ProspectVisit>[] = [
  {
    key: "lead",
    label: "Lead",
    sortValue: (row) => row.businessName,
    searchValue: (row) => `${row.businessName} ${row.slug}`,
    render: (row) => (
      <>
        <Link href={`/admin/leads/${row.slug}`} className="admin-link">
          {row.businessName}
        </Link>
        <span style={{ fontSize: 12, color: "var(--admin-text-soft)", marginLeft: 6 }}>
          /{row.slug}
        </span>
      </>
    ),
  },
  {
    key: "date",
    label: "Date & time",
    sortValue: (row) => new Date(row.visitedAt).getTime(),
    render: (row) => (
      <span style={{ whiteSpace: "nowrap" }}>{formatDate(row.visitedAt)}</span>
    ),
  },
  {
    key: "ip",
    label: "IP",
    sortValue: (row) => row.ip,
    searchValue: (row) => row.ip,
    render: (row) => (
      <span style={{ fontFamily: "monospace", fontSize: 13 }}>{row.ip}</span>
    ),
  },
  {
    key: "device",
    label: "Device",
    sortValue: (row) => parseDevice(row.userAgent),
    render: (row) => <span>{parseDevice(row.userAgent)}</span>,
  },
  {
    key: "referrer",
    label: "Referrer",
    sortValue: (row) => row.referrer ?? "",
    searchValue: (row) => row.referrer ?? "",
    render: (row) => (
      <span style={{ fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
        {row.referrer ? (() => { try { return new URL(row.referrer).hostname; } catch { return row.referrer; } })() : "Direct"}
      </span>
    ),
  },
];

/* ---------- Summary columns ---------- */
const summaryCols: Column<CountRow>[] = [
  {
    key: "lead",
    label: "Lead",
    sortValue: (row) => row.businessName,
    searchValue: (row) => `${row.businessName} ${row.slug}`,
    render: (row) => (
      <>
        <Link href={`/admin/leads/${row.slug}`} className="admin-link">
          {row.businessName}
        </Link>
        <span style={{ fontSize: 12, color: "var(--admin-text-soft)", marginLeft: 6 }}>
          /{row.slug}
        </span>
      </>
    ),
  },
  {
    key: "count",
    label: "Visits",
    sortValue: (row) => row.count,
    render: (row) => <strong>{row.count}</strong>,
  },
  {
    key: "last",
    label: "Last visit",
    sortValue: (row) => new Date(row.lastVisit).getTime(),
    render: (row) => <span>{timeAgo(row.lastVisit)}</span>,
  },
];

function classifyVisit(ua: string): "bot" | "admin" | "lead" {
  if (parseDevice(ua) === "Bot") return "bot";
  // Admin/developer visits come from known internal paths — detected by referrer or UA patterns
  // For now, we classify by device type only: bots vs real visitors (leads)
  return "lead";
}

export function VisitsView({
  visits,
  counts,
  adminEmails,
}: {
  visits: ProspectVisit[];
  counts: CountRow[];
  adminEmails?: string[];
}) {
  const [tab, setTab] = useState<"all" | "summary">("all");

  const botCount = visits.filter((v) => classifyVisit(v.userAgent) === "bot").length;
  const leadCount = visits.length - botCount;

  const uniqueSlugs = [...new Set(visits.map((v) => v.slug))];
  const deviceOptions = [...new Set(visits.map((v) => parseDevice(v.userAgent)))].sort();

  const allVisitsFilters: FilterDef<ProspectVisit>[] = [
    {
      key: "slug",
      label: "Lead",
      options: uniqueSlugs.map((s) => ({
        value: s,
        label: visits.find((v) => v.slug === s)?.businessName ?? s,
      })),
      match: (row, value) => row.slug === value,
    },
    {
      key: "device",
      label: "Device",
      options: deviceOptions.map((d) => ({ value: d, label: d })),
      match: (row, value) => parseDevice(row.userAgent) === value,
    },
  ];

  return (
    <>
      <div className="admin-stats-row" style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div className="admin-stat-card" style={{ flex: 1, padding: "12px 16px", background: "var(--admin-bg-card, #fff)", borderRadius: 8, border: "1px solid var(--admin-border, #e5e5e5)" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{visits.length}</div>
          <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>Total visits</div>
        </div>
        <div className="admin-stat-card" style={{ flex: 1, padding: "12px 16px", background: "var(--admin-bg-card, #fff)", borderRadius: 8, border: "1px solid var(--admin-border, #e5e5e5)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--admin-accent, #1a7a6d)" }}>{leadCount}</div>
          <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>Real visits</div>
        </div>
        <div className="admin-stat-card" style={{ flex: 1, padding: "12px 16px", background: "var(--admin-bg-card, #fff)", borderRadius: 8, border: "1px solid var(--admin-border, #e5e5e5)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#999" }}>{botCount}</div>
          <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>Bots</div>
        </div>
      </div>

      <div className="admin-tabs" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`admin-tab ${tab === "all" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("all")}
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

      {tab === "summary" ? (
        <SortableTable
          data={counts}
          columns={summaryCols}
          rowKey={(row) => row.slug}
          emptyMessage="No visits recorded yet."
          searchPlaceholder="Search leads..."
        />
      ) : (
        <SortableTable
          data={visits}
          columns={allVisitsCols}
          filters={allVisitsFilters}
          rowKey={(row) => row.id}
          emptyMessage="No visits recorded yet. Visits are tracked when prospects scan their QR code or type the URL."
          searchPlaceholder="Search visits..."
        />
      )}
    </>
  );
}
