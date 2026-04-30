"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  type LeadCardData,
  type UserHome,
  type SenderInfo,
  printLabels,
  printEnvelopes,
  printTaskList,
  showLeadsMap,
} from "./print-utils";

export function LeadCards({ prospects, userHome, senderInfo }: { prospects: LeadCardData[]; userHome?: UserHome | null; senderInfo?: SenderInfo | null }) {
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

  function toggleRow(startIdx: number) {
    const rowSlugs = prospects.slice(startIdx, startIdx + 3).map((p) => p.slug);
    const allInRow = rowSlugs.every((s) => selected.has(s));
    const next = new Set(selected);
    if (allInRow) {
      rowSlugs.forEach((s) => next.delete(s));
    } else {
      rowSlugs.forEach((s) => next.add(s));
    }
    setSelected(next);
  }

  function handlePrint() {
    const picked = prospects.filter((p) => selected.has(p.slug));
    printLabels(picked);
  }

  function handlePrintEnvelopes() {
    if (!senderInfo) {
      alert("Set your Company and Address in Account Settings first.");
      return;
    }
    const picked = prospects.filter((p) => selected.has(p.slug));
    printEnvelopes(picked, senderInfo);
  }

  function handlePrintProposals() {
    const slugs = prospects
      .filter((p) => selected.has(p.slug))
      .map((p) => p.slug)
      .join(",");
    window.open(`/admin/proposal/bulk?slugs=${encodeURIComponent(slugs)}`, "_blank");
  }

  function handlePrintTaskList() {
    const picked = prospects.filter((p) => selected.has(p.slug));
    printTaskList(picked);
  }

  function handleShowMap() {
    if (!userHome) {
      alert("Set your address in Account Settings first so we can calculate routes from your location.");
      return;
    }

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

    showLeadsMap(picked, userHome);
  }


  function handleCreateTask() {
    const slugs = prospects
      .filter((p) => selected.has(p.slug))
      .map((p) => p.slug)
      .join(",");
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/admin/tasks/create";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "slugs";
    input.value = slugs;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
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
              onClick={handleCreateTask}
            >
              Create task ({selected.size})
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handlePrint}
            >
              Print {selected.size} label{selected.size !== 1 ? "s" : ""}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={handlePrintEnvelopes}
            >
              Print {selected.size} envelope{selected.size !== 1 ? "s" : ""}
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
              onClick={handlePrintTaskList}
            >
              Print task list
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
        {prospects.map((p, i) => {
          const isRowStart = i % 3 === 0;
          const rowSlugs = isRowStart ? prospects.slice(i, i + 3).map((r) => r.slug) : [];
          const rowCount = rowSlugs.length;
          const allInRow = isRowStart && rowSlugs.every((s) => selected.has(s));

          return (
            <React.Fragment key={p.slug}>
              {isRowStart && (
                <li className="lead-row-select-row">
                  <label className="lead-row-select" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allInRow}
                      onChange={() => toggleRow(i)}
                    />
                    <span>Select {rowCount}</span>
                  </label>
                </li>
              )}
              <li className={`admin-biz-card${selected.has(p.slug) ? " admin-biz-card--selected" : ""}`}>
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
                  {p.contactMethod && (
                    <p className="admin-biz-card-meta" style={{ fontSize: 12, fontStyle: "italic" }}>
                      Via {p.contactMethod.charAt(0).toUpperCase() + p.contactMethod.slice(1)}
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
            </React.Fragment>
          );
        })}
      </ul>
    </>
  );
}
