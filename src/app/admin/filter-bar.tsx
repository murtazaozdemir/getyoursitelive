"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface FilterBarConfig {
  showStatus?: boolean;
  statuses?: { value: string; label: string }[];
  cities?: string[];
  states?: string[];
  zips?: string[];
  categories?: string[];
  // current values
  filterStatus?: string;
  filterCity?: string;
  filterState?: string;
  filterZip?: string;
  filterCategory?: string;
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
      // Reset to page 1 on filter/sort change
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const currentSort = config.sortBy && config.sortDir
    ? `${config.sortBy}:${config.sortDir}`
    : "createdAt:desc";

  const hasFilters =
    config.filterStatus ||
    config.filterCity ||
    config.filterState ||
    config.filterZip ||
    config.filterCategory;

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filterStatus");
    params.delete("filterCity");
    params.delete("filterState");
    params.delete("filterZip");
    params.delete("filterCategory");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar-selects">
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

        {config.cities && config.cities.length > 0 && (
          <select
            className="admin-filter-select"
            value={config.filterCity ?? ""}
            onChange={(e) => update("filterCity", e.target.value)}
          >
            <option value="">All cities</option>
            {config.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}

        {config.states && config.states.length > 0 && (
          <select
            className="admin-filter-select"
            value={config.filterState ?? ""}
            onChange={(e) => update("filterState", e.target.value)}
          >
            <option value="">All states</option>
            {config.states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}

        {config.zips && config.zips.length > 0 && (
          <select
            className="admin-filter-select"
            value={config.filterZip ?? ""}
            onChange={(e) => update("filterZip", e.target.value)}
          >
            <option value="">All zip codes</option>
            {config.zips.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        )}

        <select
          className="admin-filter-select admin-filter-select--sort"
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

        {hasFilters && (
          <button type="button" className="admin-filter-clear" onClick={clearAll}>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
