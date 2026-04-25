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
  lat?: number | null;
  lng?: number | null;
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

  const siteUrl = "https://getyoursitelive.com";

  const labelHtml = pages
    .map(
      (page, pi) => `
    <div class="page${pi < pages.length - 1 ? "" : " last"}">
      ${page
        .map((p, li) => {
          const previewUrl = `${siteUrl}/${p.slug}`;
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(previewUrl)}`;
          return `
        ${li > 0 ? '<div class="label-divider"></div>' : ""}
        <div class="label">
          <div class="label-content">
            <div class="label-name">${escapeHtml(p.name)}</div>
            <div class="label-addr">${escapeHtml(p.address)}</div>
            <div class="label-qr-section">
              <img class="label-qr" src="${qrUrl}" alt="QR code" />
              <div class="label-qr-text">We prepared a website for you! Scan this QR code to see it.</div>
            </div>
          </div>
        </div>`;
        })
        .join("")}
      ${page.length === 1 ? '<div class="label-divider"></div><div class="label"></div>' : ""}
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
    width: 6in;
    height: 5in;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label-content {
    text-align: center;
    padding: 0.5in;
    width: 100%;
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

  .label-divider {
    width: 3.5in;
    height: 0;
    border-top: 1px dashed #bbb;
    margin: 0 auto;
  }

  .label-qr-section {
    margin-top: 28px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .label-qr {
    width: 0.8in;
    height: 0.8in;
    display: block;
    flex-shrink: 0;
  }

  .label-qr-text {
    font-size: 10pt;
    line-height: 1.4;
    color: #333;
    text-align: left;
  }
</style>
</head>
<body>${labelHtml}</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  // Wait for all QR images to load before triggering print
  const images = win.document.querySelectorAll("img");
  if (images.length === 0) {
    setTimeout(() => win.print(), 300);
  } else {
    let loaded = 0;
    const onReady = () => {
      loaded++;
      if (loaded >= images.length) win.print();
    };
    images.forEach((img) => {
      if (img.complete) {
        onReady();
      } else {
        img.addEventListener("load", onReady);
        img.addEventListener("error", onReady);
      }
    });
    // Fallback in case events don't fire
    setTimeout(() => win.print(), 5000);
  }
}

function printDeliveryList(prospects: LeadCardData[]) {
  if (prospects.length === 0) return;

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  const rowsHtml = prospects
    .map(
      (p, i) => `
    <tr>
      <td class="col-num">${i + 1}</td>
      <td class="col-name">${escapeHtml(p.name)}</td>
      <td class="col-addr">${escapeHtml(p.address)}</td>
      <td class="col-check"><span class="check-box"></span></td>
      <td class="col-notes"></td>
    </tr>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Delivery List — ${today}</title>
<style>
  @page { size: letter portrait; margin: 0.5in 0.6in; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #111; }

  .dl-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #111;
  }
  .dl-title { font-size: 14pt; font-weight: 700; }
  .dl-date { font-size: 9pt; color: #666; }

  table { width: 100%; border-collapse: collapse; }

  th {
    text-align: left;
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
    padding: 6px 8px;
    border-bottom: 1px solid #999;
  }

  td {
    padding: 10px 8px;
    border-bottom: 1px solid #ddd;
    vertical-align: top;
  }

  .col-num { width: 30px; color: #999; font-size: 9pt; }
  .col-name { width: 22%; font-weight: 600; }
  .col-addr { width: 30%; font-size: 9.5pt; color: #333; }
  .col-check { width: 60px; text-align: center; }
  .col-notes { width: auto; }

  .check-box {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 1.5px solid #999;
    border-radius: 2px;
    vertical-align: middle;
  }

  th.col-check { text-align: center; }
</style>
</head>
<body>
  <div class="dl-header">
    <span class="dl-title">Delivery List</span>
    <span class="dl-date">${today} &middot; ${prospects.length} lead${prospects.length !== 1 ? "s" : ""}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Business</th>
        <th>Address</th>
        <th class="col-check">Delivered</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
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

  function handlePrintProposals() {
    const slugs = prospects
      .filter((p) => selected.has(p.slug))
      .map((p) => p.slug)
      .join(",");
    window.open(`/admin/proposal/bulk?slugs=${encodeURIComponent(slugs)}`, "_blank");
  }

  function handlePrintDeliveryList() {
    const picked = prospects.filter((p) => selected.has(p.slug));
    printDeliveryList(picked);
  }

  function handleShowMap() {
    const picked = prospects
      .filter((p) => selected.has(p.slug) && p.lat != null && p.lng != null);
    if (picked.length === 0) return;

    const markers = picked.map((p) => ({
      lat: p.lat!,
      lng: p.lng!,
      name: p.name,
      address: p.address,
      slug: p.slug,
    }));
    const avgLat = markers.reduce((s, m) => s + m.lat, 0) / markers.length;
    const avgLng = markers.reduce((s, m) => s + m.lng, 0) / markers.length;

    const markersJson = JSON.stringify(markers);

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Leads Map — ${picked.length} locations</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; }
  #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var markers = ${markersJson};
  var map = L.map('map').setView([${avgLat}, ${avgLng}], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);
  var bounds = [];
  markers.forEach(function(m) {
    var marker = L.marker([m.lat, m.lng]).addTo(map);
    marker.bindPopup('<strong>' + m.name + '</strong><br>' + m.address);
    bounds.push([m.lat, m.lng]);
  });
  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] });
  }
<\/script>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
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
          <>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handlePrint}
            >
              Print {selected.size} label{selected.size !== 1 ? "s" : ""}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handlePrintProposals}
            >
              Print {selected.size} proposal{selected.size !== 1 ? "s" : ""}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handlePrintDeliveryList}
            >
              Delivery list
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handleShowMap}
            >
              Show on map
            </button>
          </>
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
