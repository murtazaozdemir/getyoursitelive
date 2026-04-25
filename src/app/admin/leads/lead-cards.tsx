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

function escapeHtml(str: string | null | undefined) {
  if (!str) return "";
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
            ${p.address ? `<div class="label-addr">${escapeHtml(p.address)}</div>` : ""}
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
    const selectedLeads = prospects.filter((p) => selected.has(p.slug));
    const picked = selectedLeads.filter((p) => p.lat != null && p.lng != null);
    if (picked.length === 0) {
      const missing = selectedLeads.length - picked.length;
      alert(
        missing > 0
          ? `None of the ${missing} selected lead${missing !== 1 ? "s" : ""} have coordinates. Leads need latitude/longitude to appear on the map.`
          : "No leads selected."
      );
      return;
    }
    if (picked.length < selectedLeads.length) {
      const skipped = selectedLeads.length - picked.length;
      if (!confirm(`${skipped} lead${skipped !== 1 ? "s" : ""} missing coordinates will be skipped. Continue with ${picked.length}?`)) return;
    }

    // Home: 78 Arlington Avenue, Clifton, NJ 07011
    const home = { lat: 40.8732, lng: -74.1571, name: "Home", address: "78 Arlington Ave, Clifton, NJ" };

    const stops = picked.map((p) => ({
      lat: p.lat!,
      lng: p.lng!,
      name: escapeHtml(p.name),
      address: escapeHtml(p.address),
      slug: p.slug,
    }));

    const markersJson = JSON.stringify(stops);

    const html = `<!DOCTYPE html>
<html>
<head>
<title>Leads Map — ${picked.length} locations</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; font-family: Arial, sans-serif; }
  #map { width: 100%; height: 100%; }
  #route-panel {
    position: absolute; top: 10px; right: 10px; z-index: 1000;
    background: #fff; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    padding: 16px; max-width: 320px; max-height: 80vh; overflow-y: auto;
    font-size: 13px;
  }
  #route-panel h3 { margin: 0 0 10px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
  .route-stop { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #eee; }
  .route-stop:last-child { border-bottom: none; }
  .route-num {
    width: 22px; height: 22px; border-radius: 50%; background: #1a6b50; color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
  }
  .route-num--home { background: #333; }
  .route-name { font-weight: 600; font-size: 12px; }
  .route-addr { font-size: 11px; color: #666; }
  .route-loading { color: #999; font-style: italic; }
  #toolbar {
    position: absolute; top: 10px; left: 10px; z-index: 1000;
    display: flex; flex-direction: column; gap: 6px;
  }
  .toolbar-btn {
    padding: 8px 14px; border: none; border-radius: 6px; cursor: pointer;
    font-size: 12px; font-weight: 600; font-family: Arial, sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15); white-space: nowrap;
  }
  .toolbar-btn--print { background: #1a6b50; color: #fff; }
  .toolbar-btn--print:hover { background: #155a43; }
  .toolbar-btn--pdf { background: #333; color: #fff; }
  .toolbar-btn--pdf:hover { background: #222; }
  .toolbar-btn--csv { background: #fff; color: #333; border: 1px solid #ccc; }
  .toolbar-btn--csv:hover { background: #f5f5f5; }
  @media print {
    #toolbar { display: none !important; }
    #route-panel { position: static; max-height: none; box-shadow: none; border: 1px solid #ddd; page-break-inside: avoid; }
    #map { height: 60vh !important; }
  }
  .numbered-icon {
    background: #1a6b50; color: #fff; border-radius: 50%;
    width: 26px; height: 26px; display: flex; align-items: center;
    justify-content: center; font-weight: 700; font-size: 12px;
    border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="toolbar">
  <button class="toolbar-btn toolbar-btn--print" onclick="window.print()">Print</button>
  <button class="toolbar-btn toolbar-btn--pdf" onclick="window.print()">Export PDF</button>
</div>
<div id="route-panel">
  <h3>Optimal Route <button class="toolbar-btn toolbar-btn--csv" onclick="exportCsv()">Export CSV</button></h3>
  <div id="route-list" class="route-loading">Calculating best route...</div>
</div>
<script>
  var stops = ${markersJson};
  var home = ${JSON.stringify(home)};
  var map = L.map('map').setView([home.lat, home.lng], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  function numIcon(n, isHome) {
    return L.divIcon({
      className: '',
      html: '<div class="numbered-icon" style="background:' + (isHome ? '#333' : '#1a6b50') + '">' + n + '</div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  }

  // Build OSRM trip URL: home first, then all stops
  var coords = home.lng + ',' + home.lat;
  stops.forEach(function(s) { coords += ';' + s.lng + ',' + s.lat; });
  var url = 'https://router.project-osrm.org/trip/v1/driving/' + coords
    + '?source=first&roundtrip=false&geometries=geojson&overview=full';

  fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.code !== 'Ok' || !data.trips || !data.trips[0]) {
        // Fallback: nearest-neighbor order
        showFallback();
        return;
      }
      var trip = data.trips[0];
      var waypoints = data.waypoints;
      // waypoints[i].waypoint_index gives the visit order
      // waypoints[0] is home, rest are stops
      var ordered = [];
      for (var i = 1; i < waypoints.length; i++) {
        ordered.push({ stop: stops[i - 1], tripIndex: waypoints[i].waypoint_index });
      }
      ordered.sort(function(a, b) { return a.tripIndex - b.tripIndex; });

      // Draw route line
      var routeCoords = trip.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
      L.polyline(routeCoords, { color: '#1a6b50', weight: 4, opacity: 0.7 }).addTo(map);

      // Place numbered markers
      L.marker([home.lat, home.lng], { icon: numIcon('H', true) }).addTo(map)
        .bindTooltip('Home', { direction: 'top', offset: [0, -10] })
        .bindPopup('<strong>Start: Home</strong><br>' + home.address);

      var bounds = [[home.lat, home.lng]];
      var listHtml = '<div class="route-stop"><span class="route-num route-num--home">H</span><div><div class="route-name">Home (Start)</div><div class="route-addr">' + home.address + '</div></div></div>';

      ordered.forEach(function(item, idx) {
        var s = item.stop;
        var n = idx + 1;
        L.marker([s.lat, s.lng], { icon: numIcon(n, false) }).addTo(map)
          .bindTooltip(n + '. ' + s.name, { direction: 'top', offset: [0, -10] })
          .bindPopup('<strong>' + n + '. ' + s.name + '</strong><br>' + s.address);
        bounds.push([s.lat, s.lng]);
        listHtml += '<div class="route-stop"><span class="route-num">' + n + '</span><div><div class="route-name">' + s.name + '</div><div class="route-addr">' + s.address + '</div></div></div>';
      });

      // Total distance/duration
      var distMi = (trip.distance / 1609.34).toFixed(1);
      var durMin = Math.round(trip.duration / 60);
      listHtml += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #ddd;font-size:12px;color:#555"><strong>' + distMi + ' mi</strong> · ~' + durMin + ' min driving</div>';

      document.getElementById('route-list').innerHTML = listHtml;
      map.fitBounds(bounds, { padding: [40, 40] });
    })
    .catch(function() { showFallback(); });

  function showFallback() {
    // Simple nearest-neighbor from home
    var remaining = stops.slice();
    var ordered = [];
    var current = home;
    while (remaining.length > 0) {
      var best = 0, bestDist = Infinity;
      for (var i = 0; i < remaining.length; i++) {
        var d = Math.pow(remaining[i].lat - current.lat, 2) + Math.pow(remaining[i].lng - current.lng, 2);
        if (d < bestDist) { bestDist = d; best = i; }
      }
      ordered.push(remaining[best]);
      current = remaining[best];
      remaining.splice(best, 1);
    }

    L.marker([home.lat, home.lng], { icon: numIcon('H', true) }).addTo(map)
      .bindTooltip('Home', { direction: 'top', offset: [0, -10] });

    var bounds = [[home.lat, home.lng]];
    var pts = [[home.lat, home.lng]];
    var listHtml = '<div class="route-stop"><span class="route-num route-num--home">H</span><div><div class="route-name">Home (Start)</div><div class="route-addr">' + home.address + '</div></div></div>';

    ordered.forEach(function(s, idx) {
      var n = idx + 1;
      L.marker([s.lat, s.lng], { icon: numIcon(n, false) }).addTo(map)
        .bindTooltip(n + '. ' + s.name, { direction: 'top', offset: [0, -10] })
        .bindPopup('<strong>' + n + '. ' + s.name + '</strong><br>' + s.address);
      bounds.push([s.lat, s.lng]);
      pts.push([s.lat, s.lng]);
      listHtml += '<div class="route-stop"><span class="route-num">' + n + '</span><div><div class="route-name">' + s.name + '</div><div class="route-addr">' + s.address + '</div></div></div>';
    });

    L.polyline(pts, { color: '#1a6b50', weight: 3, opacity: 0.5, dashArray: '8 6' }).addTo(map);
    document.getElementById('route-list').innerHTML = listHtml;
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  // CSV export — list only (ordered stops)
  function exportCsv() {
    var rows = document.querySelectorAll('.route-stop');
    if (!rows.length) return;
    var csv = '#,Name,Address\\n';
    rows.forEach(function(row, i) {
      var nameEl = row.querySelector('.route-name');
      var addrEl = row.querySelector('.route-addr');
      if (!nameEl || !addrEl) return;
      var name = nameEl.textContent.replace(/"/g, '""');
      var addr = addrEl.textContent.replace(/"/g, '""');
      csv += (i === 0 ? 'H' : i) + ',"' + name + '","' + addr + '"\\n';
    });
    var blob = new Blob([csv], { type: 'text/csv' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'delivery-route.csv';
    a.click();
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
              Print delivery list
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
            <label className="lead-card-checkbox" htmlFor={`lead-cb-${p.slug}`} onClick={(e) => e.stopPropagation()}>
              <input
                id={`lead-cb-${p.slug}`}
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
