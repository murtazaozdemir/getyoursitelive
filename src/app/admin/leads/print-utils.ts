/**
 * Shared print/map utilities used by both the Leads cards view
 * and the Tasks detail page.
 */

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

export interface UserHome {
  lat: number;
  lng: number;
  name: string;
  address: string;
}

export interface SenderInfo {
  company: string;
  name: string;
  address: string;
  email: string;
}

/** Minimal data needed for print/map functions (subset of LeadCardData) */
export interface PrintableProspect {
  slug: string;
  name: string;
  phone?: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
}

export function escapeHtml(str: string | null | undefined) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function printLabels(prospects: PrintableProspect[]) {
  if (prospects.length === 0) return;

  // Group into pages of 2
  const pages: PrintableProspect[][] = [];
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
              <div class="label-qr-text">
                <div>We built a free website preview for you!</div>
                <div class="label-qr-instruction">Scan this QR code or type the link below in your browser:</div>
                <div class="label-url">${previewUrl}</div>
              </div>
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

  .label-qr-instruction {
    font-size: 9pt;
    color: #555;
    margin-top: 4px;
  }

  .label-url {
    font-size: 10pt;
    font-weight: 700;
    color: #1a6b50;
    margin-top: 4px;
    word-break: break-all;
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

export function printEnvelopes(prospects: PrintableProspect[], sender: SenderInfo) {
  if (prospects.length === 0) return;

  const esc = escapeHtml;

  // Each prospect gets 2 pages: front (address side) + back (ad side)
  const pagesHtml = prospects
    .map(
      (p) => `
      <div class="env-page env-front">
        <div class="env-return">
          <div class="env-return-company">${esc(sender.company)}</div>
          <div>Web Site Development Division</div>
          <div>${esc(sender.address)}</div>
        </div>
        <div class="env-corner-note">
          <div class="env-corner-box">
            <div class="env-corner-title">LOCAL BUSINESS REVIEW</div>
            <div>Prepared for current owner</div>
            <div>Response requested</div>
          </div>
        </div>
        <div class="env-recipient">
          <div class="env-recipient-name">${esc(p.name)}</div>
          <div>Current Owner</div>
          <div>${esc(p.address)}</div>
        </div>
        <div class="env-barcode-zone"></div>
      </div>
      <div class="env-page env-back">
        <div class="env-back-content">
          <div class="env-back-body">
            <p class="env-back-lead">We have already built a website preview for <strong>${esc(p.name)}</strong>.</p>
            <p>Today, customers search online to verify your reputation before they call.</p>
            <p class="env-back-url">View it at: <strong>www.getyoursitelive.com/${esc(p.slug)}</strong></p>
            <p class="env-back-scan">&hellip;or scan the QR code inside this envelope.</p>
          </div>
        </div>
      </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Print Envelopes</title>
<style>
  @page {
    size: 9in 6in landscape;
    margin: 0;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 9in; }
  body { font-family: Georgia, 'Times New Roman', serif; color: #222; }

  .env-page {
    width: 9in;
    height: 6in;
    position: relative;
    page-break-after: always;
    padding: 0.5in 0.6in;
  }

  /* ── FRONT SIDE ── */
  .env-return {
    position: absolute;
    top: 0.4in;
    left: 0.5in;
    font-size: 11pt;
    line-height: 1.5;
  }
  .env-return-company {
    font-weight: 700;
    font-size: 12pt;
  }

  .env-corner-note {
    position: absolute;
    top: 0.4in;
    right: 0.5in;
  }
  .env-corner-box {
    border: 1.5px solid #333;
    padding: 6px 10px;
    font-size: 10pt;
    line-height: 1.5;
    text-align: right;
    font-family: Arial, Helvetica, sans-serif;
  }
  .env-corner-title {
    font-weight: 700;
    font-size: 10.5pt;
    letter-spacing: 0.03em;
  }

  .env-recipient {
    position: absolute;
    top: 2.2in;
    left: 3.2in;
    font-size: 14pt;
    line-height: 1.6;
  }
  .env-recipient-name {
    font-weight: 700;
    font-size: 15pt;
  }

  .env-barcode-zone {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 0.625in;
  }

  /* ── BACK SIDE ── */
  .env-back {
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(180deg);
  }
  .env-back-content {
    text-align: center;
    max-width: 7in;
    margin: 0 auto;
  }
  .env-back-body {
    font-size: 13pt;
    line-height: 1.7;
    text-align: center;
  }
  .env-back-body p {
    margin-bottom: 12px;
  }
  .env-back-lead {
    font-size: 15pt;
  }
  .env-back-url {
    font-size: 14pt;
    margin-top: 16px;
  }
  .env-back-scan {
    font-size: 11pt;
    font-style: italic;
    color: #555;
    margin-top: 4px;
  }
</style>
</head>
<body>${pagesHtml}</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 300);
}

export function printTaskList(prospects: PrintableProspect[]) {
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
<title>Task List \u2014 ${today}</title>
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
    <span class="dl-title">Task List</span>
    <span class="dl-date">${today} &middot; ${prospects.length} lead${prospects.length !== 1 ? "s" : ""}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Business</th>
        <th>Address</th>
        <th class="col-check">Dropped off</th>
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

export function showLeadsMap(prospects: PrintableProspect[], userHome: UserHome) {
  if (prospects.length === 0) return;

  const home = { lat: userHome.lat, lng: userHome.lng, name: userHome.name, address: userHome.address };

  const stops = prospects.map((p) => ({
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    name: escapeHtml(p.name),
    address: escapeHtml(p.address),
    slug: p.slug,
  }));

  const markersJson = JSON.stringify(stops);

  const html = `<!DOCTYPE html>
<html>
<head>
<title>Leads Map \u2014 ${prospects.length} locations</title>
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
  .route-loading { color: #555; font-size: 13px; }
  .route-loading-spinner {
    display: inline-block; width: 16px; height: 16px; border: 2px solid #ddd;
    border-top-color: #1a6b50; border-radius: 50%; animation: spin 0.8s linear infinite;
    vertical-align: middle; margin-right: 8px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .route-progress-bar {
    width: 100%; height: 6px; background: #e5e7eb; border-radius: 3px;
    margin-top: 10px; overflow: hidden;
  }
  .route-progress-fill {
    height: 100%; background: #1a6b50; border-radius: 3px;
    transition: width 0.3s ease;
  }
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
  <div style="display:flex;align-items:center;gap:6px">
    <input id="reroute-zip" type="text" placeholder="Zip code" maxlength="5" style="width:70px;padding:6px 8px;border:1px solid #ccc;border-radius:4px;font-size:13px;font-family:monospace" />
    <button class="toolbar-btn" onclick="rerouteFromZip()" style="white-space:nowrap">Re-route</button>
  </div>
  <button class="toolbar-btn toolbar-btn--csv" onclick="exportCsv()">Export CSV</button>
  <button class="toolbar-btn toolbar-btn--pdf" onclick="window.print()">Export PDF</button>
</div>
<div id="route-panel">
  <h3>Optimal Route</h3>
  <div id="route-list" class="route-loading"><span class="route-loading-spinner"></span> Please wait\u2026 Preparing map</div>
</div>
<script>
  var rawStops = ${markersJson};
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

  // Geocode stops that are missing lat/lng using Nominatim
  async function geocodeAddress(address) {
    try {
      var r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address));
      var data = await r.json();
      if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch(e) { /* ignore */ }
    return null;
  }

  function showProgress(current, total, label) {
    var pct = total > 0 ? Math.round((current / total) * 100) : 0;
    document.getElementById('route-list').innerHTML =
      '<div class="route-loading">' +
        '<div><span class="route-loading-spinner"></span> Please wait\u2026 ' + label + '</div>' +
        '<div class="route-progress-bar"><div class="route-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<div style="margin-top:6px;font-size:11px;color:#999">' + current + ' of ' + total + '</div>' +
      '</div>';
  }

  async function resolveStops() {
    var total = rawStops.length;
    showProgress(0, total, 'Preparing addresses');
    var resolved = [];
    for (var i = 0; i < rawStops.length; i++) {
      var s = rawStops[i];
      showProgress(i + 1, total, 'Processing ' + s.name);
      if (s.lat != null && s.lng != null) {
        resolved.push(s);
      } else {
        var geo = await geocodeAddress(s.address);
        if (geo) {
          s.lat = geo.lat;
          s.lng = geo.lng;
          resolved.push(s);
        }
        // Wait 1s between requests to respect Nominatim rate limit
        if (i < rawStops.length - 1) await new Promise(function(r) { setTimeout(r, 1000); });
      }
    }
    showProgress(total, total, 'Calculating best route');
    return resolved;
  }

  resolveStops().then(function(stops) {
    if (stops.length === 0) {
      document.getElementById('route-list').innerHTML = '<div class="route-loading">Could not geocode any addresses.</div>';
      return;
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
        showFallback();
        return;
      }
      var trip = data.trips[0];
      var waypoints = data.waypoints;
      var ordered = [];
      for (var i = 1; i < waypoints.length; i++) {
        ordered.push({ stop: stops[i - 1], tripIndex: waypoints[i].waypoint_index });
      }
      ordered.sort(function(a, b) { return a.tripIndex - b.tripIndex; });

      var routeCoords = trip.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
      L.polyline(routeCoords, { color: '#1a6b50', weight: 4, opacity: 0.7 }).addTo(map);

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

      var distMi = (trip.distance / 1609.34).toFixed(1);
      var durMin = Math.round(trip.duration / 60);
      listHtml += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #ddd;font-size:12px;color:#555"><strong>' + distMi + ' mi</strong> · ~' + durMin + ' min driving</div>';

      document.getElementById('route-list').innerHTML = listHtml;
      map.fitBounds(bounds, { padding: [40, 40] });
    })
    .catch(function() { showFallback(); });

  function showFallback() {
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

  }); // end resolveStops().then()

  async function rerouteFromZip() {
    var zip = document.getElementById('reroute-zip').value.trim();
    if (!zip || !/^\\d{5}$/.test(zip)) {
      alert('Enter a valid 5-digit zip code.');
      return;
    }
    document.getElementById('route-list').innerHTML = '<div class="route-loading"><span class="route-loading-spinner"></span> Please wait\u2026 Geocoding zip ' + zip + '</div>';

    var geo = await geocodeAddress(zip + ', USA');
    if (!geo) {
      document.getElementById('route-list').innerHTML = '<div class="route-loading">Could not find location for zip ' + zip + '.</div>';
      return;
    }

    // Update home origin
    home.lat = geo.lat;
    home.lng = geo.lng;
    home.address = 'Zip ' + zip;

    // Clear all map layers except the tile layer
    map.eachLayer(function(layer) {
      if (!(layer instanceof L.TileLayer)) map.removeLayer(layer);
    });
    map.setView([home.lat, home.lng], 11);

    // Re-resolve and re-route with new origin
    var stops = await resolveStops();
    if (stops.length === 0) {
      document.getElementById('route-list').innerHTML = '<div class="route-loading">No geocodable stops.</div>';
      return;
    }

    var coords = home.lng + ',' + home.lat;
    stops.forEach(function(s) { coords += ';' + s.lng + ',' + s.lat; });
    var url = 'https://router.project-osrm.org/trip/v1/driving/' + coords
      + '?source=first&roundtrip=false&geometries=geojson&overview=full';

    try {
      var r = await fetch(url);
      var data = await r.json();
      if (data.code !== 'Ok' || !data.trips || !data.trips[0]) {
        rerouteFallback(stops);
        return;
      }
      var trip = data.trips[0];
      var waypoints = data.waypoints;
      var ordered = [];
      for (var i = 1; i < waypoints.length; i++) {
        ordered.push({ stop: stops[i - 1], tripIndex: waypoints[i].waypoint_index });
      }
      ordered.sort(function(a, b) { return a.tripIndex - b.tripIndex; });

      var routeCoords = trip.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
      L.polyline(routeCoords, { color: '#1a6b50', weight: 4, opacity: 0.7 }).addTo(map);

      L.marker([home.lat, home.lng], { icon: numIcon('H', true) }).addTo(map)
        .bindTooltip('Start (Zip ' + zip + ')', { direction: 'top', offset: [0, -10] })
        .bindPopup('<strong>Start: Zip ' + zip + '</strong>');

      var bounds = [[home.lat, home.lng]];
      var listHtml = '<div class="route-stop"><span class="route-num route-num--home">H</span><div><div class="route-name">Start (Zip ' + zip + ')</div><div class="route-addr">Re-routed origin</div></div></div>';

      ordered.forEach(function(item, idx) {
        var s = item.stop;
        var n = idx + 1;
        L.marker([s.lat, s.lng], { icon: numIcon(n, false) }).addTo(map)
          .bindTooltip(n + '. ' + s.name, { direction: 'top', offset: [0, -10] })
          .bindPopup('<strong>' + n + '. ' + s.name + '</strong><br>' + s.address);
        bounds.push([s.lat, s.lng]);
        listHtml += '<div class="route-stop"><span class="route-num">' + n + '</span><div><div class="route-name">' + s.name + '</div><div class="route-addr">' + s.address + '</div></div></div>';
      });

      var distMi = (trip.distance / 1609.34).toFixed(1);
      var durMin = Math.round(trip.duration / 60);
      listHtml += '<div style="margin-top:10px;padding-top:8px;border-top:1px solid #ddd;font-size:12px;color:#555"><strong>' + distMi + ' mi</strong> · ~' + durMin + ' min driving</div>';

      document.getElementById('route-list').innerHTML = listHtml;
      map.fitBounds(bounds, { padding: [40, 40] });
    } catch(e) {
      rerouteFallback(stops);
    }
  }

  function rerouteFallback(stops) {
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

    var zip = document.getElementById('reroute-zip').value.trim();
    L.marker([home.lat, home.lng], { icon: numIcon('H', true) }).addTo(map)
      .bindTooltip('Start (Zip ' + zip + ')', { direction: 'top', offset: [0, -10] });

    var bounds = [[home.lat, home.lng]];
    var pts = [[home.lat, home.lng]];
    var listHtml = '<div class="route-stop"><span class="route-num route-num--home">H</span><div><div class="route-name">Start (Zip ' + zip + ')</div><div class="route-addr">Re-routed origin</div></div></div>';

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
