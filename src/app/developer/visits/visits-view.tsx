"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProspectVisit } from "@/lib/prospect-visits";
import { SortableTable, Column, FilterDef } from "@/components/admin/sortable-table";

import type { AdminIPEntry } from "@/lib/users";

function getAllExcludeIPs(adminIPs: AdminIPEntry[], excluded: Set<string>): Set<string> {
  const ips = new Set<string>();
  for (const admin of adminIPs) {
    if (excluded.has(admin.name)) {
      if (admin.wifiIp) ips.add(admin.wifiIp);
      if (admin.mobileIp) ips.add(admin.mobileIp);
    }
  }
  return ips;
}

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
  adminIPs = [],
}: {
  visits: ProspectVisit[];
  counts: CountRow[];
  adminIPs?: AdminIPEntry[];
}) {
  const [tab, setTab] = useState<"all" | "summary">("all");
  // Exclude all admins with IPs by default
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set(adminIPs.map((a) => a.name)));

  const excludeIPs = getAllExcludeIPs(adminIPs, excluded);

  const toggleExclude = (label: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const filteredVisits = excludeIPs.size > 0 ? visits.filter((v) => !excludeIPs.has(v.ip)) : visits;
  const filteredCounts = excludeIPs.size > 0
    ? counts.map((c) => {
        const cVisits = visits.filter((v) => v.slug === c.slug && !excludeIPs.has(v.ip));
        return { ...c, count: cVisits.length, lastVisit: cVisits[0]?.visitedAt ?? c.lastVisit };
      }).filter((c) => c.count > 0)
    : counts;

  const botCount = filteredVisits.filter((v) => classifyVisit(v.userAgent) === "bot").length;
  const leadCount = filteredVisits.length - botCount;

  const uniqueSlugs = [...new Set(filteredVisits.map((v) => v.slug))];
  const deviceOptions = [...new Set(filteredVisits.map((v) => parseDevice(v.userAgent)))].sort();

  const allVisitsFilters: FilterDef<ProspectVisit>[] = [
    {
      key: "slug",
      label: "Lead",
      options: uniqueSlugs.map((s) => ({
        value: s,
        label: filteredVisits.find((v) => v.slug === s)?.businessName ?? s,
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
      {/* Exclude admin IPs — only shown if any admin has IPs configured */}
      {adminIPs.length > 0 && (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--admin-bg-card, #fff)", borderRadius: 8, border: "1px solid var(--admin-border, #e5e5e5)" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "var(--admin-text-soft)" }}>Exclude admin IPs</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {adminIPs.map((admin) => {
              const active = excluded.has(admin.name);
              const ipParts: string[] = [];
              if (admin.wifiIp) ipParts.push(`WiFi: ${admin.wifiIp}`);
              if (admin.mobileIp) ipParts.push(`Mobile: ${admin.mobileIp}`);
              return (
                <button
                  key={admin.name}
                  type="button"
                  onClick={() => toggleExclude(admin.name)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: `1px solid ${active ? "var(--admin-accent, #1a7a6d)" : "var(--admin-border, #e5e5e5)"}`,
                    background: active ? "color-mix(in srgb, var(--admin-accent, #1a7a6d) 10%, transparent)" : "transparent",
                    color: active ? "var(--admin-accent, #1a7a6d)" : "var(--admin-text-soft)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 14 }}>{active ? "\u2715" : "\u25CB"}</span>
                  {admin.name}
                  <span style={{ fontSize: 11, color: "inherit", opacity: 0.7 }}>
                    {ipParts.join(", ")}
                  </span>
                </button>
              );
            })}
          </div>
          {excludeIPs.size > 0 && (
            <div style={{ fontSize: 12, color: "var(--admin-text-soft)", marginTop: 6 }}>
              Filtering out {visits.length - filteredVisits.length} visit{visits.length - filteredVisits.length !== 1 ? "s" : ""} from admin IPs
            </div>
          )}
        </div>
      )}

      <div className="admin-stats-row" style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <div className="admin-stat-card" style={{ flex: 1, padding: "12px 16px", background: "var(--admin-bg-card, #fff)", borderRadius: 8, border: "1px solid var(--admin-border, #e5e5e5)" }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{filteredVisits.length}</div>
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
          All visits ({filteredVisits.length})
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === "summary" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("summary")}
        >
          By lead ({filteredCounts.length})
        </button>
      </div>

      {tab === "summary" ? (
        <SortableTable
          data={filteredCounts}
          columns={summaryCols}
          rowKey={(row) => row.slug}
          emptyMessage="No visits recorded yet."
          searchPlaceholder="Search leads..."
        />
      ) : (
        <SortableTable
          data={filteredVisits}
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
