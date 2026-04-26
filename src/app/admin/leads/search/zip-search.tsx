"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";

interface PlaceResult {
  id: string;
  name: string;
  phone: string;
  address: string;
  shortAddress: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  website: string;
  googleMapsUrl: string;
  lat: number | null;
  lng: number | null;
  businessStatus: string;
  priceLevel: string;
  editorialSummary: string;
  openingHours: string;
  reviews: string;
  photos: string;
  addressComponents: string;
  _fromZip?: string;
}

type AddStatus = "idle" | "adding" | "added" | "updated" | "exists" | "error";

const CATEGORIES = [
  { label: "Car repair and maintenance service", query: "auto repair" },
  { label: "Auto body shop", query: "auto body shop" },
  { label: "Car detailing service", query: "car detailing" },
  { label: "Tire shop", query: "tire shop" },
  { label: "Towing service", query: "towing service" },
  { label: "Oil change service", query: "oil change" },
  { label: "Muffler shop", query: "muffler shop" },
  { label: "Barber shop", query: "barber shop" },
  { label: "Hair salon", query: "hair salon" },
  { label: "Nail salon", query: "nail salon" },
  { label: "Restaurant", query: "restaurant" },
  { label: "Pizzeria", query: "pizzeria" },
  { label: "Bakery", query: "bakery" },
  { label: "Deli", query: "deli" },
  { label: "Dentist", query: "dentist" },
  { label: "Plumber", query: "plumber" },
  { label: "Electrician", query: "electrician" },
  { label: "HVAC contractor", query: "hvac" },
  { label: "Landscaper", query: "landscaping" },
  { label: "Dry cleaner", query: "dry cleaner" },
  { label: "Laundromat", query: "laundromat" },
  { label: "Pet groomer", query: "pet grooming" },
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

  // Search — multi-category
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(["auto repair"]));
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [addStatuses, setAddStatuses] = useState<Record<string, AddStatus>>({});
  const [addedSlugs, setAddedSlugs] = useState<Record<string, string>>({});
  const [hideWithWebsite, setHideWithWebsite] = useState(true);
  const [forceRefresh, setForceRefresh] = useState(false);

  // Batch progress
  const [zipStatuses, setZipStatuses] = useState<Record<string, ZipStatus>>({});
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [apiCallsUsed, setApiCallsUsed] = useState(0);
  const [duplicatesRemoved, setDuplicatesRemoved] = useState(0);

  // Mode toggle
  const [mode, setMode] = useState<"city" | "zip">("city");

  // Ref to read current categories in async flow
  const selectedCategoriesRef = useRef(selectedCategories);
  selectedCategoriesRef.current = selectedCategories;

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleCategory(query: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(query)) {
        if (next.size > 1) next.delete(query); // keep at least 1
      } else {
        next.add(query);
      }
      return next;
    });
  }

  function getCategoryLabel(): string {
    if (selectedCategories.size === 1) {
      const q = [...selectedCategories][0];
      return CATEGORIES.find((c) => c.query === q)?.label ?? q;
    }
    return `${selectedCategories.size} categories`;
  }

  // Load cities when state changes
  useEffect(() => {
    if (mode !== "city") return;
    let cancelled = false;
    setLoadingCities(true);
    setCities([]);
    setCity("");
    setCityZips([]);

    fetch(`/api/places-search/state-cities?state=${encodeURIComponent(state)}`)
      .then((res) => {
        if (!res.ok) return { cities: [] };
        return res.json() as Promise<{ cities?: string[] }>;
      })
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
      body: JSON.stringify({ zip, query: searchQuery, forceRefresh }),
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
    const queries = [...selectedCategoriesRef.current];
    const totalSteps = zips.length * queries.length;

    setSearching(true);
    setError("");
    setResults([]);
    setAddStatuses({});
    setAddedSlugs({});
    setDuplicatesRemoved(0);
    setApiCallsUsed(0);
    setBatchProgress({ current: 0, total: totalSteps });

    const initStatuses: Record<string, ZipStatus> = {};
    for (const z of zips) initStatuses[z] = "idle";
    setZipStatuses(initStatuses);

    let allResults: PlaceResult[] = [];
    let totalApiCalls = 0;
    let step = 0;

    for (const searchQuery of queries) {
      for (let i = 0; i < zips.length; i++) {
        const zip = zips[i];
        setZipStatuses((prev) => ({ ...prev, [zip]: "searching" }));
        step++;
        setBatchProgress({ current: step, total: totalSteps });

        try {
          const { results: zipResults, cached, apiCalls } = await searchOneZip(zip, searchQuery);
          totalApiCalls += apiCalls;
          setApiCallsUsed(totalApiCalls);
          setZipStatuses((prev) => ({ ...prev, [zip]: cached ? "cached" : "done" }));

          allResults = [...allResults, ...zipResults];
          const deduped = dedupeResults(allResults);
          setDuplicatesRemoved(allResults.length - deduped.length);
          setResults(deduped);
        } catch (err) {
          setZipStatuses((prev) => ({ ...prev, [zip]: "done" }));
          console.error(`Search failed for zip ${zip} query ${searchQuery}:`, err);
        }
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

    const queries = [...selectedCategoriesRef.current];

    setCityZips([]);
    setSearching(true);
    setError("");
    setResults([]);
    setAddStatuses({});
    setAddedSlugs({});
    setDuplicatesRemoved(0);
    setApiCallsUsed(0);
    setBatchProgress({ current: 0, total: queries.length });

    let allResults: PlaceResult[] = [];
    let totalApiCalls = 0;

    for (let i = 0; i < queries.length; i++) {
      setBatchProgress({ current: i + 1, total: queries.length });
      try {
        const { results: zipResults, apiCalls } = await searchOneZip(manualZip, queries[i]);
        totalApiCalls += apiCalls;
        allResults = [...allResults, ...zipResults];
      } catch (err) {
        console.error(`Search failed for query ${queries[i]}:`, err);
      }
    }

    const deduped = dedupeResults(allResults);
    setResults(deduped);
    setDuplicatesRemoved(allResults.length - deduped.length);
    setApiCallsUsed(totalApiCalls);
    setSearching(false);
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

      // Google Places data
      formData.set("googlePlaceId", place.id);
      if (place.rating != null) formData.set("googleRating", String(place.rating));
      formData.set("googleReviewCount", String(place.reviewCount));
      formData.set("googleCategory", place.category);
      if (place.googleMapsUrl) formData.set("googleMapsUrl", place.googleMapsUrl);
      if (place.website) formData.set("website", place.website);
      if (place.lat != null) formData.set("lat", String(place.lat));
      if (place.lng != null) formData.set("lng", String(place.lng));
      if (place.businessStatus) formData.set("googleBusinessStatus", place.businessStatus);
      if (place.priceLevel) formData.set("googlePriceLevel", place.priceLevel);
      if (place.editorialSummary) formData.set("googleEditorialSummary", place.editorialSummary);
      if (place.openingHours) formData.set("googleOpeningHours", place.openingHours);
      if (place.reviews) formData.set("googleReviews", place.reviews);
      if (place.photos) formData.set("googlePhotos", place.photos);
      if (place.shortAddress) formData.set("googleShortAddress", place.shortAddress);
      if (place.addressComponents) formData.set("googleAddressComponents", place.addressComponents);

      const res = await fetch("/api/places-search/add", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as {
        ok?: boolean;
        updated?: boolean;
        slug?: string;
        error?: string;
      };

      if (data.ok && data.updated) {
        setAddStatuses((prev) => ({ ...prev, [place.id]: "updated" }));
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

  // Check which results already exist in DB after search completes
  const [existingPhones, setExistingPhones] = useState<Set<string>>(new Set());
  const [checkedExisting, setCheckedExisting] = useState(false);

  useEffect(() => {
    if (results.length === 0 || searching) {
      setExistingPhones(new Set());
      setCheckedExisting(false);
      return;
    }

    const phones = results.map((r) => r.phone).filter(Boolean);
    if (phones.length === 0) { setCheckedExisting(true); return; }

    fetch("/api/places-search/check-existing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phones }),
    })
      .then((res) => res.json() as Promise<{ existing?: string[] }>)
      .then((data) => {
        setExistingPhones(new Set(data.existing ?? []));
        setCheckedExisting(true);
      })
      .catch(() => setCheckedExisting(true));
  }, [results, searching]);

  const isExistingInDb = (place: PlaceResult) => {
    const norm = place.phone.replace(/\D/g, "");
    return norm.length >= 7 && existingPhones.has(norm);
  };

  async function handleAddAll() {
    // Add new leads AND update existing ones with Google data
    const toProcess = filtered.filter((p) => {
      const status = addStatuses[p.id];
      return status !== "added" && status !== "updated" && status !== "adding";
    });

    for (const place of toProcess) {
      await handleAdd(place);
    }
  }

  const isSecondary = (url: string) =>
    url && (url.includes("business.site") || url.includes("sites.google.com") || url.includes("square.site") || url.includes("wixsite.com") || url.includes("weebly.com"));

  const hasWebsite = (url: string) =>
    url && !url.includes("business.site") && !url.includes("google.com") && !url.includes("square.site") && !url.includes("wixsite.com") && !url.includes("weebly.com");

  const filtered = hideWithWebsite
    ? results.filter((p) => !hasWebsite(p.website))
    : results;

  const processableCount = filtered.filter((p) => {
    const status = addStatuses[p.id];
    return status !== "added" && status !== "updated" && status !== "adding";
  }).length;

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
            <div className="admin-field" style={{ flex: 1, minWidth: 200 }}>
              <span className="admin-field-label">Category</span>
              <CategoryMultiSelect
                selected={selectedCategories}
                onToggle={toggleCategory}
                open={catDropdownOpen}
                setOpen={setCatDropdownOpen}
                dropdownRef={catDropdownRef}
                label={getCategoryLabel()}
              />
            </div>
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
            <div className="admin-field" style={{ flex: 1, minWidth: 200 }}>
              <span className="admin-field-label">Category</span>
              <CategoryMultiSelect
                selected={selectedCategories}
                onToggle={toggleCategory}
                open={catDropdownOpen}
                setOpen={setCatDropdownOpen}
                dropdownRef={catDropdownRef}
                label={getCategoryLabel()}
              />
            </div>
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
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 13, color: "var(--admin-text-soft)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={forceRefresh}
            onChange={(e) => setForceRefresh(e.target.checked)}
          />
          Force fresh search — skip cache, re-query Google Places API
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
            {checkedExisting && processableCount > 0 && (
              <button
                className="admin-btn admin-btn--primary"
                onClick={handleAddAll}
                style={{ whiteSpace: "nowrap" }}
              >
                + Add / Update All ({processableCount})
              </button>
            )}
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
                      ) : isSecondary(place.website) ? (
                        <span className="search-result-tag search-result-tag--good">Secondary site</span>
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
                    {status === "idle" && !isExistingInDb(place) && (
                      <button
                        className="admin-btn admin-btn--primary"
                        onClick={() => handleAdd(place)}
                        style={{ whiteSpace: "nowrap" }}
                      >
                        + Add as Lead
                      </button>
                    )}
                    {status === "idle" && isExistingInDb(place) && (
                      <button
                        className="admin-btn admin-btn--ghost"
                        onClick={() => handleAdd(place)}
                        style={{ whiteSpace: "nowrap", color: "var(--color-warn, #d97706)" }}
                      >
                        Update in DB
                      </button>
                    )}
                    {status === "adding" && (
                      <button className="admin-btn admin-btn--ghost" disabled>
                        {isExistingInDb(place) ? "Updating…" : "Adding…"}
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
                    {status === "updated" && (
                      <Link
                        href={`/admin/leads/${slug}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ color: "var(--color-success, #16a34a)" }}
                      >
                        Updated — View
                      </Link>
                    )}
                    {status === "exists" && slug && (
                      <Link
                        href={`/admin/leads/${slug}`}
                        className="admin-btn admin-btn--ghost"
                        style={{ color: "var(--color-warn, #d97706)" }}
                      >
                        In Database — View
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

function CategoryMultiSelect({
  selected,
  onToggle,
  open,
  setOpen,
  dropdownRef,
  label,
}: {
  selected: Set<string>;
  onToggle: (query: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  label: string;
}) {
  return (
    <div className="cat-multi" ref={dropdownRef}>
      <button
        type="button"
        className="admin-input cat-multi-trigger"
        onClick={() => setOpen(!open)}
      >
        <span className="cat-multi-label">{label}</span>
        <span className="cat-multi-arrow">{open ? "\u25B2" : "\u25BC"}</span>
      </button>
      {open && (
        <div className="cat-multi-dropdown">
          {CATEGORIES.map((c) => (
            <label key={c.query} className="cat-multi-option">
              <input
                type="checkbox"
                checked={selected.has(c.query)}
                onChange={() => onToggle(c.query)}
              />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
