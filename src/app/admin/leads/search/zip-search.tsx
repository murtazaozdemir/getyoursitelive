"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

interface PlaceResult {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  website: string;
  googleMapsUrl: string;
  _fromZip?: string;
}

type AddStatus = "idle" | "adding" | "added" | "exists" | "error";

const CATEGORIES = [
  { label: "Auto Repair", query: "auto repair" },
  { label: "Auto Body Shop", query: "auto body shop" },
  { label: "Car Detailing", query: "car detailing" },
  { label: "Tire Shop", query: "tire shop" },
  { label: "Towing Service", query: "towing service" },
  { label: "Oil Change", query: "oil change" },
  { label: "Muffler Shop", query: "muffler shop" },
  { label: "Barber Shop", query: "barber shop" },
  { label: "Hair Salon", query: "hair salon" },
  { label: "Nail Salon", query: "nail salon" },
  { label: "Restaurant", query: "restaurant" },
  { label: "Pizzeria", query: "pizzeria" },
  { label: "Bakery", query: "bakery" },
  { label: "Deli", query: "deli" },
  { label: "Dentist", query: "dentist" },
  { label: "Plumber", query: "plumber" },
  { label: "Electrician", query: "electrician" },
  { label: "HVAC", query: "hvac" },
  { label: "Landscaping", query: "landscaping" },
  { label: "Dry Cleaner", query: "dry cleaner" },
  { label: "Laundromat", query: "laundromat" },
  { label: "Pet Grooming", query: "pet grooming" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT",
  "VT","VA","WA","WV","WI","WY",
];

type ZipStatus = "idle" | "searching" | "cached" | "done";

export function ZipSearch() {
  // City mode
  const [state, setState] = useState("NJ");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityZips, setCityZips] = useState<string[]>([]);

  // Single zip mode
  const [manualZip, setManualZip] = useState("");

  // Search
  const [query, setQuery] = useState("auto repair");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [addStatuses, setAddStatuses] = useState<Record<string, AddStatus>>({});
  const [addedSlugs, setAddedSlugs] = useState<Record<string, string>>({});
  const [hideWithWebsite, setHideWithWebsite] = useState(true);

  // Batch progress
  const [zipStatuses, setZipStatuses] = useState<Record<string, ZipStatus>>({});
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);

  // Mode toggle
  const [mode, setMode] = useState<"city" | "zip">("city");

  // Ref to read current query in async flow
  const queryRef = useRef(query);
  queryRef.current = query;

  // Load cities when state changes
  useEffect(() => {
    if (mode !== "city") return;
    let cancelled = false;
    setLoadingCities(true);
    setCities([]);
    setCity("");
    setCityZips([]);

    fetch(`/api/places-search/state-cities?state=${encodeURIComponent(state)}`)
      .then((res) => res.json() as Promise<{ cities?: string[] }>)
      .then((data) => {
        if (!cancelled) {
          setCities(data.cities ?? []);
          setLoadingCities(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingCities(false);
      });

    return () => { cancelled = true; };
  }, [state, mode]);

  const dedupeResults = useCallback((allResults: PlaceResult[]): PlaceResult[] => {
    const seen = new Map<string, PlaceResult>();
    for (const r of allResults) {
      if (!seen.has(r.id)) {
        const phoneKey = r.phone.replace(/\D/g, "");
        const dupeByPhone = phoneKey.length >= 7
          ? [...seen.values()].find((s) => s.phone.replace(/\D/g, "") === phoneKey)
          : null;
        if (!dupeByPhone) {
          seen.set(r.id, r);
        }
      }
    }
    return [...seen.values()];
  }, []);

  async function searchOneZip(zip: string, searchQuery: string): Promise<{
    results: PlaceResult[];
    cached: boolean;
    apiCalls: number;
  }> {
    const res = await fetch("/api/places-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zip, query: searchQuery }),
    });

    const data = (await res.json()) as {
      error?: string;
      results?: PlaceResult[];
      cached?: boolean;
    };

    if (!res.ok) {
      throw new Error(data.error ?? "Search failed.");
    }

    return {
      results: (data.results ?? []).map((r) => ({ ...r, _fromZip: zip })),
      cached: data.cached ?? false,
      apiCalls: data.cached ? 0 : 1,
    };
  }

  async function runBatchSearch(zips: string[]) {
    const currentQuery = queryRef.current;

    setSearching(true);
    setError("");
    setResults([]);
    setAddStatuses({});
    setAddedSlugs({});
    setDuplicatesRemoved(0);
    setApiCallsUsed(0);
    setBatchProgress({ current: 0, total: zips.length });

    const initStatuses: Record<string, ZipStatus> = {};
    for (const z of zips) initStatuses[z] = "idle";
    setZipStatuses(initStatuses);

    let allResults: PlaceResult[] = [];
    let totalApiCalls = 0;

    for (let i = 0; i < zips.length; i++) {
      const zip = zips[i];
      setZipStatuses((prev) => ({ ...prev, [zip]: "searching" }));
      setBatchProgress({ current: i + 1, total: zips.length });

      try {
        const { results: zipResults, cached, apiCalls } = await searchOneZip(zip, currentQuery);
        totalApiCalls += apiCalls;
        setApiCallsUsed(totalApiCalls);
        setZipStatuses((prev) => ({ ...prev, [zip]: cached ? "cached" : "done" }));

        allResults = [...allResults, ...zipResults];
        const deduped = dedupeResults(allResults);
        setDuplicatesRemoved(allResults.length - deduped.length);
        setResults(deduped);
      } catch (err) {
        setZipStatuses((prev) => ({ ...prev, [zip]: "done" }));
        console.error(`Search failed for zip ${zip}:`, err);
      }
    }

    setSearching(false);
  }

  async function handleCitySearch() {
    if (!city) {
      setError("Select a city.");
      return;
    }

    setSearching(true);
    setError("");
    setCityZips([]);
    setResults([]);
    setAddStatuses({});
    setAddedSlugs({});

    // Step 1: Look up zip codes
    let zips: string[] = [];
    try {
      const res = await fetch(
        `/api/places-search/city-zips?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}`,
      );
      const data = (await res.json()) as { zips?: string[] };
      zips = data.zips ?? [];
    } catch {
      setError("Failed to look up zip codes. Try again.");
      setSearching(false);
      return;
    }

    if (zips.length === 0) {
      setError(`No zip codes found for ${city}, ${state}. Try a different city.`);
      setSearching(false);
      return;
    }

    setCityZips(zips);
    setSearching(false);

    // Step 2: Immediately search all zips
    await runBatchSearch(zips);
  }

  async function handleSingleZipSearch() {
    if (!manualZip || !/^\d{5}$/.test(manualZip)) {
      setError("Enter a valid 5-digit zip code.");
      return;
    }

    setCityZips([]);
    setSearching(true);
    setError("");
    setResults([]);
    setAddStatuses({});
    setAddedSlugs({});
    setDuplicatesRemoved(0);
    setApiCallsUsed(0);
    setBatchProgress({ current: 0, total: 0 });

    try {
      const { results: zipResults, apiCalls } = await searchOneZip(manualZip, query);
      setResults(zipResults);
      setApiCallsUsed(apiCalls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(place: PlaceResult) {
    setAddStatuses((prev) => ({ ...prev, [place.id]: "adding" }));

    try {
      const formData = new FormData();
      formData.set("name", place.name);
      formData.set("phone", place.phone);

      const parts = place.address.split(",").map((s) => s.trim());
      if (parts.length >= 3) {
        formData.set("street", parts[0]);
        formData.set("city", parts[1]);
        const stateZip = parts[2].split(/\s+/);
        formData.set("state", stateZip[0] ?? "");
        formData.set("zip", stateZip[1] ?? "");
      } else {
        formData.set("street", place.address);
      }

      const res = await fetch("/api/places-search/add", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        ok?: boolean;
        exists?: boolean;
        slug?: string;
        error?: string;
      };

      if (data.exists) {
        setAddStatuses((prev) => ({ ...prev, [place.id]: "exists" }));
        if (data.slug) {
          setAddedSlugs((prev) => ({ ...prev, [place.id]: data.slug as string }));
        }
      } else if (data.ok) {
        setAddStatuses((prev) => ({ ...prev, [place.id]: "added" }));
        if (data.slug) {
          setAddedSlugs((prev) => ({ ...prev, [place.id]: data.slug as string }));
        }
      } else {
        setError(data.error ?? "Failed to add.");
        setAddStatuses((prev) => ({ ...prev, [place.id]: "error" }));
      }
    } catch {
      setAddStatuses((prev) => ({ ...prev, [place.id]: "error" }));
    }
  }

  const hasWebsite = (url: string) =>
    url && !url.includes("business.site") && !url.includes("google.com");

  const filtered = hideWithWebsite
    ? results.filter((p) => !hasWebsite(p.website))
    : results;

  return (
    <div>
      <div className="admin-section">
        <div className="search-mode-toggle">
          <button
            className={`search-mode-btn${mode === "city" ? " search-mode-btn--active" : ""}`}
            onClick={() => setMode("city")}
          >
            Search by City
          </button>
          <button
            className={`search-mode-btn${mode === "zip" ? " search-mode-btn--active" : ""}`}
            onClick={() => setMode("zip")}
          >
            Single Zip
          </button>
        </div>

        {mode === "city" ? (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <label className="admin-field" style={{ width: 100 }}>
              <span className="admin-field-label">State</span>
              <select
                className="admin-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="admin-field" style={{ flex: 1, minWidth: 180 }}>
              <span className="admin-field-label">City</span>
              <select
                className="admin-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loadingCities}
              >
                <option value="">
                  {loadingCities ? "Loading cities…" : "Select a city"}
                </option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="admin-field" style={{ flex: 1, minWidth: 200 }}>
              <span className="admin-field-label">Category</span>
              <select
                className="admin-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.query} value={c.query}>{c.label}</option>
                ))}
              </select>
            </label>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleCitySearch}
              disabled={searching}
              style={{ height: 42 }}
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
            <label className="admin-field" style={{ width: 140 }}>
              <span className="admin-field-label">Zip code *</span>
              <input
                className="admin-input"
                type="text"
                maxLength={5}
                placeholder="07011"
                value={manualZip}
                onChange={(e) => setManualZip(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleSingleZipSearch()}
                autoFocus
              />
            </label>
            <label className="admin-field" style={{ flex: 1, minWidth: 200 }}>
              <span className="admin-field-label">Category</span>
              <select
                className="admin-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.query} value={c.query}>{c.label}</option>
                ))}
              </select>
            </label>
            <button
              className="admin-btn admin-btn--primary"
              onClick={handleSingleZipSearch}
              disabled={searching}
              style={{ height: 42 }}
            >
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 13, color: "var(--admin-text-soft)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={hideWithWebsite}
            onChange={(e) => setHideWithWebsite(e.target.checked)}
          />
          No website only — hide businesses that already have a site
        </label>

        {error && <div className="admin-error-banner" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {/* Zip chips — show progress during city search */}
      {cityZips.length > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="admin-field-label" style={{ margin: 0 }}>
              {city}, {state} — {cityZips.length} zip code{cityZips.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="zip-chips">
            {cityZips.map((zip) => {
              const status = zipStatuses[zip];
              let chipClass = "zip-chip zip-chip--selected";
              if (status === "done") chipClass = "zip-chip zip-chip--done";
              if (status === "cached") chipClass = "zip-chip zip-chip--cached";
              if (status === "searching") chipClass = "zip-chip zip-chip--searching";

              return (
                <span key={zip} className={chipClass}>
                  {zip}
                  {status === "done" && " \u2713"}
                  {status === "cached" && " \u2713"}
                  {status === "searching" && " \u2026"}
                </span>
              );
            })}
          </div>

          {/* Progress bar */}
          {batchProgress.total > 1 && (
            <div className="search-progress" style={{ marginTop: 12 }}>
              <div className="search-progress-bar">
                <div
                  className="search-progress-fill"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
              <div className="search-progress-stats">
                <span>{batchProgress.current}/{batchProgress.total} zips searched</span>
                <span>{results.length} unique results</span>
                {duplicatesRemoved > 0 && (
                  <span>{duplicatesRemoved} duplicate{duplicatesRemoved !== 1 ? "s" : ""} removed</span>
                )}
                <span>
                  {apiCallsUsed} API call{apiCallsUsed !== 1 ? "s" : ""}
                  {apiCallsUsed > 0 && ` (~$${(apiCallsUsed * 0.032).toFixed(2)})`}
                  {apiCallsUsed === 0 && batchProgress.current > 0 && " (all cached)"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              {hideWithWebsite && filtered.length !== results.length && (
                <span style={{ fontWeight: 400, fontSize: 13, color: "var(--admin-text-muted)" }}>
                  {" "}({results.length - filtered.length} with websites hidden)
                </span>
              )}
            </h2>
          </div>

          <div className="search-results-list" style={{ marginTop: 12 }}>
            {filtered.map((place) => {
              const status = addStatuses[place.id] ?? "idle";
              const slug = addedSlugs[place.id];
              const hasRealSite = hasWebsite(place.website);

              return (
                <div key={place.id} className="search-result-card">
                  <div className="search-result-body">
                    <h3 className="search-result-name">{place.name}</h3>
                    <p className="search-result-meta">{place.address}</p>
                    {place.phone && <p className="search-result-meta">{place.phone}</p>}
                    <div className="search-result-tags">
                      <span className="search-result-tag">{place.category}</span>
                      {place.rating && (
                        <span className="search-result-tag">
                          ★ {place.rating} ({place.reviewCount})
                        </span>
                      )}
                      {hasRealSite ? (
                        <span className="search-result-tag search-result-tag--warn">Has website</span>
                      ) : (
                        <span className="search-result-tag search-result-tag--good">No website</span>
                      )}
                      {place._fromZip && (
                        <span className="search-result-tag">{place._fromZip}</span>
                      )}
                    </div>
                    {place.website && (
                      <p className="search-result-meta" style={{ fontSize: 12, marginTop: 4 }}>
                        <a href={place.website} target="_blank" rel="noreferrer" className="admin-link">
                          {place.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </p>
                    )}
                  </div>

                  <div className="search-result-actions">
                    {status === "idle" && (
                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => handleAdd(place)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        + Add as Lead
                      </button>
                    )}
                    {status === "adding" && (
                      <button className="admin-btn admin-btn--ghost" disabled>
                        Adding…
                      </button>
                    )}
                    {status === "added" && (
                      <Link
                        href={`/admin/leads/${slug}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ color: "var(--color-success, #16a34a)" }}
                      >
                        Added — View
                      </Link>
                    )}
                    {status === "exists" && (
                      <Link
                        href={`/admin/leads/${slug}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ color: "var(--color-warn, #d97706)" }}
                      >
                        Already exists — View
                      </Link>
                    )}
                    {status === "error" && (
                      <button
                        className="admin-btn admin-btn--ghost"
                        onClick={() => handleAdd(place)}
                        style={{ color: "var(--color-error, #dc2626)" }}
                      >
                        Failed — Retry
                      </button>
                    )}
                    {place.googleMapsUrl && (
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn admin-btn--ghost"
                        style={{ fontSize: 12 }}
                      >
                        Maps
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {results.length > 0 && filtered.length === 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <div className="admin-empty">
            <p>All {results.length} results have websites. Uncheck the filter to see them.</p>
          </div>
        </div>
      )}
    </div>
  );
}
