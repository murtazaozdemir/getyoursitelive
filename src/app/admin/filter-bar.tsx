"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface GeoTuple {
  city: string;
  state: string;
  zip: string;
}

export interface FilterBarConfig {
  showStatus?: boolean;
  showDataFilter?: boolean;
  showSearch?: boolean;
  statuses?: { value: string; label: string }[];
  cities?: string[];
  states?: string[];
  zips?: string[];
  categories?: string[];
  /** Raw geo tuples so the client can cascade filters */
  geoTuples?: GeoTuple[];
  // current values
  search?: string;
  filterStatus?: string;
  filterCity?: string;
  filterState?: string;
  filterZip?: string;
  filterCategory?: string;
  filterData?: string;
  distanceZip?: string;
  sortBy?: string;
  sortDir?: string;
}

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "status:asc", label: "Status" },
  { value: "category:asc", label: "Category (A–Z)" },
  { value: "city:asc", label: "City (A–Z)" },
  { value: "state:asc", label: "State (A–Z)" },
  { value: "zip:asc", label: "Zip code" },
  { value: "distance:asc", label: "Nearest first" },
  { value: "distance:desc", label: "Farthest first" },
];

export function FilterSortBar(config: FilterBarConfig) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const tuples = config.geoTuples ?? [];

  /**
   * Cascading geo update: the last-changed field determines the other two.
   *
   * - State changed  → clear city & zip (show all within that state)
   * - City changed   → auto-set state; clear zip (show zips in that city)
   * - Zip changed    → auto-set city & state
   * - Any cleared    → clear the ones below it in specificity
   */
  const updateGeo = useCallback(
    (changed: "state" | "city" | "zip", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");

      if (!value) {
        // Cleared — remove this and less-specific doesn't change,
        // but more-specific should clear
        params.delete(`filter${cap(changed)}`);
        if (changed === "state") {
          params.delete("filterCity");
          params.delete("filterZip");
        } else if (changed === "city") {
          params.delete("filterZip");
        }
        router.push(`${pathname}?${params.toString()}`);
        return;
      }

      if (changed === "state") {
        params.set("filterState", value);
        // Clear city & zip — they may not belong to the new state
        params.delete("filterCity");
        params.delete("filterZip");
      } else if (changed === "city") {
        params.set("filterCity", value);
        // Find the state for this city
        const match = tuples.find(
          (t) => t.city.toLowerCase() === value.toLowerCase() && t.state,
        );
        if (match) {
          params.set("filterState", match.state);
        }
        // Clear zip — let user pick from the narrowed list
        params.delete("filterZip");
      } else {
        // zip
        params.set("filterZip", value);
        // Find city & state for this zip
        const match = tuples.find((t) => t.zip === value);
        if (match) {
          if (match.state) params.set("filterState", match.state);
          if (match.city) params.set("filterCity", match.city);
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, tuples],
  );

  // Compute visible dropdown options based on current selections
  const { visibleStates, visibleCities, visibleZips } = useMemo(() => {
    if (tuples.length === 0) {
      return {
        visibleStates: config.states ?? [],
        visibleCities: config.cities ?? [],
        visibleZips: config.zips ?? [],
      };
    }

    const curState = config.filterState ?? "";
    const curCity = config.filterCity ?? "";
    const curZip = config.filterZip ?? "";

    // States: show all unique states (always full list)
    const stSet = new Set<string>();
    // Cities: filter by selected state
    const ciSet = new Set<string>();
    // Zips: filter by selected state + city
    const zpSet = new Set<string>();

    for (const t of tuples) {
      if (t.state) stSet.add(t.state);

      if (!curState || t.state.toUpperCase() === curState.toUpperCase()) {
        if (t.city) ciSet.add(t.city);
      }

      if (!curState || t.state.toUpperCase() === curState.toUpperCase()) {
        if (!curCity || t.city.toLowerCase() === curCity.toLowerCase()) {
          if (t.zip) zpSet.add(t.zip);
        }
      }
    }

    return {
      visibleStates: [...stSet].sort(),
      visibleCities: [...ciSet].sort(),
      visibleZips: [...zpSet].sort(),
    };
  }, [tuples, config.states, config.cities, config.zips, config.filterState, config.filterCity, config.filterZip]);

  const currentSort = config.sortBy && config.sortDir
    ? `${config.sortBy}:${config.sortDir}`
    : "createdAt:desc";

  // Debounced search input
  const [searchText, setSearchText] = useState(config.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Sync local state if URL param changes externally (e.g. clear filters)
  useEffect(() => {
    setSearchText(config.search ?? "");
  }, [config.search]);
  const handleSearch = useCallback(
    (value: string) => {
      setSearchText(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
          params.set("search", value.trim());
        } else {
          params.delete("search");
        }
        params.delete("page");
        router.push(`${pathname}?${params.toString()}`);
      }, 250);
    },
    [router, pathname, searchParams],
  );

  const hasFilters =
    config.search ||
    config.filterStatus ||
    config.filterCity ||
    config.filterState ||
    config.filterZip ||
    config.filterCategory ||
    config.filterData ||
    config.distanceZip;

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("filterStatus");
    params.delete("filterCity");
    params.delete("filterState");
    params.delete("filterZip");
    params.delete("filterCategory");
    params.delete("filterData");
    params.delete("distanceZip");
    router.push(`${pathname}?${params.toString()}`);
  }

  const hasFilterSelects =
    (config.showStatus && config.statuses && config.statuses.length > 0) ||
    (config.categories && config.categories.length > 0) ||
    config.showDataFilter ||
    visibleStates.length > 0 ||
    visibleCities.length > 0 ||
    visibleZips.length > 0;

  return (
    <div className="admin-filter-bar">
      {/* ── Search ── */}
      {config.showSearch && (
        <div className="admin-filter-row">
          <input
            type="text"
            className="admin-filter-select admin-filter-search"
            placeholder="Search by name, phone, address..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}

      {/* ── Filter By ── */}
      {hasFilterSelects && (
        <div className="admin-filter-row">
          <span className="admin-filter-label">Filter by:</span>
          <div className="admin-filter-row-controls">
            {config.showStatus && config.statuses && config.statuses.length > 0 && (
              <select
                className="admin-filter-select"
                value={config.filterStatus ?? ""}
                onChange={(e) => update("filterStatus", e.target.value)}
              >
                <option value="">All statuses</option>
                {config.statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            )}

            {config.categories && config.categories.length > 0 && (
              <select
                className="admin-filter-select"
                value={config.filterCategory ?? ""}
                onChange={(e) => update("filterCategory", e.target.value)}
              >
                <option value="">All categories</option>
                {config.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {config.showDataFilter && (
              <select
                className="admin-filter-select"
                value={config.filterData ?? ""}
                onChange={(e) => update("filterData", e.target.value)}
              >
                <option value="">All data</option>
                <option value="domains-missing">Domains missing</option>
                <option value="domains-incomplete">Domains incomplete</option>
                <option value="has-domains">Has domains</option>
                <option value="no-website">No website</option>
                <option value="has-website">Has website</option>
              </select>
            )}

            {visibleStates.length > 0 && (
              <select
                className="admin-filter-select"
                value={config.filterState ?? ""}
                onChange={(e) => updateGeo("state", e.target.value)}
              >
                <option value="">All states</option>
                {visibleStates.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            {visibleCities.length > 0 && (
              <select
                className="admin-filter-select"
                value={config.filterCity ?? ""}
                onChange={(e) => updateGeo("city", e.target.value)}
              >
                <option value="">All cities</option>
                {visibleCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            {visibleZips.length > 0 && (
              <select
                className="admin-filter-select"
                value={config.filterZip ?? ""}
                onChange={(e) => updateGeo("zip", e.target.value)}
              >
                <option value="">All zip codes</option>
                {visibleZips.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            )}

            {hasFilters && (
              <button type="button" className="admin-filter-clear" onClick={clearAll}>
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Sort By ── */}
      <div className="admin-filter-row">
        <span className="admin-filter-label">Sort by:</span>
        <div className="admin-filter-row-controls">
          <select
            className="admin-filter-select"
            value={currentSort}
            onChange={(e) => {
              const [by, dir] = e.target.value.split(":");
              const params = new URLSearchParams(searchParams.toString());
              params.set("sortBy", by);
              params.set("sortDir", dir);
              router.push(`${pathname}?${params.toString()}`);
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <input
            type="text"
            className="admin-filter-select"
            placeholder="Distance from zip..."
            defaultValue={config.distanceZip ?? ""}
            maxLength={5}
            style={{ width: 160 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = (e.target as HTMLInputElement).value.trim();
                const params = new URLSearchParams(searchParams.toString());
                if (val && /^\d{5}$/.test(val)) {
                  params.set("distanceZip", val);
                  params.set("sortBy", "distance");
                  params.set("sortDir", "asc");
                } else {
                  params.delete("distanceZip");
                }
                router.push(`${pathname}?${params.toString()}`);
              }
            }}
            onBlur={(e) => {
              const val = e.target.value.trim();
              const current = config.distanceZip ?? "";
              if (val === current) return;
              const params = new URLSearchParams(searchParams.toString());
              if (val && /^\d{5}$/.test(val)) {
                params.set("distanceZip", val);
                params.set("sortBy", "distance");
                params.set("sortDir", "asc");
              } else if (!val) {
                params.delete("distanceZip");
              }
              router.push(`${pathname}?${params.toString()}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
