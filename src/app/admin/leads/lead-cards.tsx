"use client";

import { useState } from "react";
import Link from "next/link";

export interface LeadCardData {
  slug: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  statusLabel: string;
  statusBadgeClass: string;
  distance?: number;
  chips: { label: string; cls: string }[];
  contactedByName?: string;
  notesCount: number;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAddressLines(address: string): string[] {
  if (!address) return [];
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    // "123 Main St, City, ST 07011" → line 1: street, line 2: city + state zip
    return [parts.slice(0, -2).join(", "), parts.slice(-2).join(", ")];
  }
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  }
  return [address];
}

function printLabels(prospects: LeadCardData[]) {
  if (prospects.length === 0) return;

  // Group into pages of 2
  const pages: LeadCardData[][] = [];
  for (let i = 0; i < prospects.length; i += 2) {
    pages.push(prospects.slice(i, i + 2));
  }

  const labelHtml = pages
    .map(
      (page, pi) => `
    <div class="page${pi < pages.length - 1 ? "" : " last"}">
      ${page
        .map((p) => {
          const lines = formatAddressLines(p.address);
          return `
        <div class="label">
          <div class="label-content">
            <div class="label-name">${escapeHtml(p.name)}</div>
            ${lines.map((l) => `<div class="label-addr">${escapeHtml(l)}</div>`).join("")}
          </div>
        </div>`;
        })
        .join("")}
      ${page.length === 1 ? '<div class="label"></div>' : ""}
    </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Print Labels</title>
<style>
  @page {
    size: letter portrait;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 8.5in; }
  body { font-family: Arial, Helvetica, sans-serif; }

  .page {
    width: 8.5in;
    height: 11in;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    page-break-after: always;
  }
  .page.last { page-break-after: avoid; }

  .label {
    width: 4in;
    height: 5in;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-content {
    text-align: center;
    padding: 0.5in;
  }

  .label-name {
    font-size: 16pt;
    font-weight: 700;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  .label-addr {
    font-size: 13pt;
    line-height: 1.6;
    color: #111;
  }
</style>
</head>
<body>${labelHtml}</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  // Slight delay so styles render before print dialog
  setTimeout(() => win.print(), 300);
}

export function LeadCards({ prospects }: { prospects: LeadCardData[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = prospects.length > 0 && selected.size === prospects.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(prospects.map((p) => p.slug)));
    }
  }

  function toggle(slug: string) {
    const next = new Set(selected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    setSelected(next);
  }

  function handlePrint() {
    const picked = prospects.filter((p) => selected.has(p.slug));
    printLabels(picked);
  }

  return (
    <>
      {/* Selection toolbar */}
      <div className="lead-select-toolbar">
        <label className="lead-select-all">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={toggleAll}
          />
          <span>{allSelected ? "Deselect all" : "Select all"}</span>
        </label>
        {someSelected && (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handlePrint}
          >
            Print {selected.size} label{selected.size !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Cards grid */}
      <ul className="admin-biz-grid">
        {prospects.map((p) => (
          <li key={p.slug} className={`admin-biz-card${selected.has(p.slug) ? " admin-biz-card--selected" : ""}`}>
            <label className="lead-card-checkbox" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={selected.has(p.slug)}
                onChange={() => toggle(p.slug)}
              />
            </label>
            <div className="admin-biz-card-body">
              <p className="admin-biz-card-slug">/{p.slug}</p>
              <h2 className="admin-biz-card-name">{p.name}</h2>
              {p.phone && <p className="admin-biz-card-meta">{p.phone}</p>}
              {p.address && <p className="admin-biz-card-meta">{p.address}</p>}
              {p.distance != null && (
                <p className="admin-biz-card-meta" style={{ fontWeight: 600, color: "var(--accent, #b45309)" }}>
                  {Math.round(p.distance)} mi away
                </p>
              )}
              <div className="admin-biz-card-chips" style={{ marginTop: 8 }}>
                <span className={`prospect-badge ${p.statusBadgeClass}`} style={{ fontSize: 11 }}>
                  {p.statusLabel}
                </span>
                {p.chips.map((c) => (
                  <span key={c.label} className={`prospect-chip ${c.cls}`}>{c.label}</span>
                ))}
              </div>
              {p.contactedByName && (
                <p className="admin-biz-card-meta" style={{ marginTop: 6, fontSize: 12, fontStyle: "italic" }}>
                  Contacted by {p.contactedByName}
                </p>
              )}
            </div>
            <div className="admin-biz-card-actions">
              <Link href={`/admin/leads/${p.slug}`} className="admin-btn admin-btn--primary">
                Lead info
              </Link>
              <Link href={`/${p.slug}`} className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
                Preview Site
              </Link>
              <Link href={`/admin/proposal/${p.slug}`} className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
                Proposal
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
