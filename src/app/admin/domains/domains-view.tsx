"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import type { ProspectNoDomain } from "./page";

interface Props {
  prospects: ProspectNoDomain[];
  states: string[];
  cities: string[];
}

type GenStatus = "idle" | "generating" | "done" | "error";

export function DomainsView({ prospects, states, cities }: Props) {
  const [selectedStates, setSelectedStates] = useState<Set<string>>(new Set());
  const [selectedCities, setSelectedCities] = useState<Set<string>>(new Set());
  const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const stateRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  // Generation state
  const [genStatuses, setGenStatuses] = useState<Record<string, GenStatus>>({});
  const [genDomains, setGenDomains] = useState<Record<string, string[]>>({});
  const [genErrors, setGenErrors] = useState<Record<string, string>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const bulkCancelledRef = useRef(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateDropdownOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filter cities based on selected states
  const availableCities = useMemo(() => {
    if (selectedStates.size === 0) return cities;
    return cities.filter((c) =>
      prospects.some((p) => p.city === c && selectedStates.has(p.state)),
    );
  }, [cities, selectedStates, prospects]);

  // Filter prospects
  const filtered = useMemo(() => {
    return prospects.filter((p) => {
      if (selectedStates.size > 0 && !selectedStates.has(p.state)) return false;
      if (selectedCities.size > 0 && !selectedCities.has(p.city)) return false;
      return true;
    });
  }, [prospects, selectedStates, selectedCities]);

  // Count how many still need generation
  const needsGen = filtered.filter(
    (p) => genStatuses[p.slug] !== "done" && genStatuses[p.slug] !== "generating",
  );

  async function generateOne(slug: string) {
    setGenStatuses((prev) => ({ ...prev, [slug]: "generating" }));
    setGenErrors((prev) => { const n = { ...prev }; delete n[slug]; return n; });

    try {
      const res = await fetch("/api/admin/generate-domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json() as {
        ok?: boolean;
        domains?: string[];
        skipped?: boolean;
        error?: string;
      };

      if (!data.ok) {
        setGenStatuses((prev) => ({ ...prev, [slug]: "error" }));
        setGenErrors((prev) => ({ ...prev, [slug]: data.error ?? "Failed" }));
        return;
      }

      setGenStatuses((prev) => ({ ...prev, [slug]: "done" }));
      if (data.domains) {
        setGenDomains((prev) => ({ ...prev, [slug]: data.domains as string[] }));
      }
    } catch (err) {
      setGenStatuses((prev) => ({ ...prev, [slug]: "error" }));
      setGenErrors((prev) => ({
        ...prev,
        [slug]: err instanceof Error ? err.message : "Network error",
      }));
    }
  }

  async function generateAll() {
    const toProcess = needsGen;
    if (toProcess.length === 0) return;

    setBulkRunning(true);
    bulkCancelledRef.current = false;
    setBulkProgress({ current: 0, total: toProcess.length });

    for (let i = 0; i < toProcess.length; i++) {
      if (bulkCancelledRef.current) break;
      setBulkProgress({ current: i + 1, total: toProcess.length });
      await generateOne(toProcess[i].slug);
    }

    setBulkRunning(false);
  }

  function cancelBulk() {
    bulkCancelledRef.current = true;
  }

  const filteredStates = states.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase()),
  );
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  return (
    <div>
      {/* Filters */}
      <div className="admin-section">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="admin-field" style={{ minWidth: 180 }}>
            <span className="admin-field-label">States</span>
            <FilterMultiSelect
              selected={selectedStates}
              options={filteredStates}
              search={stateSearch}
              onSearchChange={setStateSearch}
              onToggle={(v) => {
                setSelectedStates((prev) => {
                  const next = new Set(prev);
                  next.has(v) ? next.delete(v) : next.add(v);
                  return next;
                });
              }}
              onClear={() => setSelectedStates(new Set())}
              open={stateDropdownOpen}
              setOpen={setStateDropdownOpen}
              dropdownRef={stateRef}
              placeholder="All states"
              label={
                selectedStates.size === 0
                  ? "All states"
                  : `${[...selectedStates].join(", ")}`
              }
            />
          </div>
          <div className="admin-field" style={{ minWidth: 200, flex: 1 }}>
            <span className="admin-field-label">Cities</span>
            <FilterMultiSelect
              selected={selectedCities}
              options={filteredCities}
              search={citySearch}
              onSearchChange={setCitySearch}
              onToggle={(v) => {
                setSelectedCities((prev) => {
                  const next = new Set(prev);
                  next.has(v) ? next.delete(v) : next.add(v);
                  return next;
                });
              }}
              onClear={() => setSelectedCities(new Set())}
              open={cityDropdownOpen}
              setOpen={setCityDropdownOpen}
              dropdownRef={cityRef}
              placeholder="All cities"
              label={
                selectedCities.size === 0
                  ? "All cities"
                  : selectedCities.size <= 3
                    ? [...selectedCities].join(", ")
                    : `${selectedCities.size} cities`
              }
            />
          </div>
          <div style={{ display: "flex", gap: 8, height: 42 }}>
            {!bulkRunning ? (
              <button
                className="admin-btn admin-btn--primary"
                onClick={generateAll}
                disabled={needsGen.length === 0}
              >
                Generate All ({needsGen.length})
              </button>
            ) : (
              <button
                className="admin-btn admin-btn--ghost"
                onClick={cancelBulk}
                style={{ color: "var(--color-error, #dc2626)" }}
              >
                Cancel ({bulkProgress.current}/{bulkProgress.total})
              </button>
            )}
          </div>
        </div>

        {bulkRunning && bulkProgress.total > 0 && (
          <div className="search-progress" style={{ marginTop: 12 }}>
            <div className="search-progress-bar">
              <div
                className="search-progress-fill"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
              />
            </div>
            <div className="search-progress-stats">
              <span>{bulkProgress.current}/{bulkProgress.total} processed</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="admin-section" style={{ marginTop: 16 }}>
        <h2 className="admin-section-title" style={{ margin: "0 0 12px" }}>
          {filtered.length} prospect{filtered.length !== 1 ? "s" : ""} missing domains
        </h2>

        {filtered.length === 0 ? (
          <div className="admin-empty">
            <p>No prospects match your filters, or all have domains.</p>
          </div>
        ) : (
          <div className="domain-gen-list">
            {filtered.map((p) => {
              const status = genStatuses[p.slug] ?? "idle";
              const domains = genDomains[p.slug];
              const hasSome = p.domain1 || p.domain2 || p.domain3;

              return (
                <div key={p.slug} className="domain-gen-card">
                  <div className="domain-gen-info">
                    <h3 className="domain-gen-name">
                      <Link href={`/admin/leads/${p.slug}`} className="admin-link">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="domain-gen-meta">{p.address}</p>
                    <p className="domain-gen-meta">{p.phone}</p>
                    {p.googleCategory && (
                      <span className="domain-gen-tag">{p.googleCategory}</span>
                    )}
                    {hasSome && (
                      <div className="domain-gen-existing">
                        {p.domain1 && <span className="domain-gen-domain">{p.domain1}</span>}
                        {p.domain2 && <span className="domain-gen-domain">{p.domain2}</span>}
                        {p.domain3 && <span className="domain-gen-domain">{p.domain3}</span>}
                      </div>
                    )}
                  </div>
                  <div className="domain-gen-actions">
                    {status === "idle" && (
                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => generateOne(p.slug)}
                        style={{ fontSize: 13 }}
                      >
                        Generate
                      </button>
                    )}
                    {status === "generating" && (
                      <button className="admin-btn admin-btn--ghost" disabled style={{ fontSize: 13 }}>
                        Checking…
                      </button>
                    )}
                    {status === "done" && domains && domains.length > 0 && (
                      <div className="domain-gen-results">
                        {domains.map((d) => (
                          <span key={d} className="domain-gen-domain domain-gen-domain--new">{d}</span>
                        ))}
                      </div>
                    )}
                    {status === "done" && (!domains || domains.length === 0) && (
                      <span style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                        No .com available
                      </span>
                    )}
                    {status === "error" && (
                      <div>
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => generateOne(p.slug)}
                          style={{ fontSize: 13, color: "var(--color-error)" }}
                        >
                          Failed — Retry
                        </button>
                        {genErrors[p.slug] && (
                          <span style={{ fontSize: 11, color: "#999", display: "block" }}>
                            {genErrors[p.slug]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Reusable multi-select filter dropdown ── */
function FilterMultiSelect({
  selected,
  options,
  search,
  onSearchChange,
  onToggle,
  onClear,
  open,
  setOpen,
  dropdownRef,
  placeholder,
  label,
}: {
  selected: Set<string>;
  options: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onToggle: (v: string) => void;
  onClear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  placeholder: string;
  label: string;
}) {
  return (
    <div className="filter-multi" ref={dropdownRef}>
      <button
        type="button"
        className="admin-input filter-multi-trigger"
        onClick={() => setOpen(!open)}
      >
        <span className="filter-multi-label">{label}</span>
        <span className="filter-multi-arrow">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="filter-multi-dropdown">
          <div className="filter-multi-search-wrap">
            <input
              type="text"
              className="filter-multi-search"
              placeholder={placeholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
            />
          </div>
          {selected.size > 0 && (
            <button
              type="button"
              className="filter-multi-clear"
              onClick={() => { onClear(); onSearchChange(""); }}
            >
              Clear all
            </button>
          )}
          <div className="filter-multi-options">
            {options.map((opt) => (
              <label key={opt} className="filter-multi-option">
                <input
                  type="checkbox"
                  checked={selected.has(opt)}
                  onChange={() => onToggle(opt)}
                />
                {opt}
              </label>
            ))}
            {options.length === 0 && (
              <p className="filter-multi-empty">No matches</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
