"use client";

import { useState } from "react";
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
}

type AddStatus = "idle" | "adding" | "added" | "exists" | "error";

export function ZipSearch() {
  const [zip, setZip] = useState("");
  const [query, setQuery] = useState("auto repair");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [addStatuses, setAddStatuses] = useState<Record<string, AddStatus>>({});
  const [addedSlugs, setAddedSlugs] = useState<Record<string, string>>({});

  async function handleSearch(pageToken?: string) {
    if (!zip || !/^\d{5}$/.test(zip)) {
      setError("Enter a valid 5-digit zip code.");
      return;
    }

    setSearching(true);
    setError("");

    if (!pageToken) {
      setResults([]);
      setAddStatuses({});
      setAddedSlugs({});
    }

    try {
      const res = await fetch("/api/places-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip, query, pageToken }),
      });

      const data = (await res.json()) as {
        error?: string;
        results?: PlaceResult[];
        nextPageToken?: string;
      };

      if (!res.ok) {
        setError(data.error ?? "Search failed.");
        return;
      }

      if (pageToken) {
        setResults((prev) => [...prev, ...(data.results ?? [])]);
      } else {
        setResults(data.results ?? []);
      }
      setNextPageToken(data.nextPageToken ?? null);
    } catch {
      setError("Network error. Please try again.");
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

      // Parse address into parts — Google returns "Street, City, State Zip, Country"
      const parts = place.address.split(",").map((s) => s.trim());
      if (parts.length >= 3) {
        formData.set("street", parts[0]);
        formData.set("city", parts[1]);
        // "NJ 07011" or "DC 20012"
        const stateZip = parts[2].split(/\s+/);
        formData.set("state", stateZip[0] ?? "");
        formData.set("zip", stateZip[1] ?? "");
      } else {
        // Fallback: use full address as street
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

  return (
    <div>
      <div className="admin-section">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label className="admin-field" style={{ width: 140 }}>
            <span className="admin-field-label">Zip code *</span>
            <input
              className="admin-input"
              type="text"
              maxLength={5}
              placeholder="07011"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </label>
          <label className="admin-field" style={{ flex: 1, minWidth: 200 }}>
            <span className="admin-field-label">Search query</span>
            <input
              className="admin-input"
              type="text"
              placeholder="auto repair"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </label>
          <button
            className="admin-btn admin-btn--primary"
            onClick={() => handleSearch()}
            disabled={searching}
            style={{ height: 42 }}
          >
            {searching ? "Searching…" : "Search"}
          </button>
        </div>

        {error && <div className="admin-error-banner" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="admin-section" style={{ marginTop: 16 }}>
          <h2 className="admin-section-title">{results.length} results</h2>

          <div className="search-results-list">
            {results.map((place) => {
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
                        ✓ Added — View
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
                        Maps ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {nextPageToken && (
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                className="admin-btn admin-btn--ghost"
                onClick={() => handleSearch(nextPageToken)}
                disabled={searching}
              >
                {searching ? "Loading…" : "Load more results"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
