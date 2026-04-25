"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface FilterBarConfig {
  showStatus?: boolean;
  showDataFilter?: boolean;
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
    config.filterCategory ||
    config.filterData ||
    config.distanceZip;

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("filterStatus");
    params.delete("filterCity");
    params.delete("filterState");
    params.delete("filterZip");
    params.delete("filterCategory");
    params.delete("filterData");
    params.delete("distanceZip");
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

        <input
          type="text"
          className="admin-filter-select"
          placeholder="Distance from zip..."
          defaultValue={config.distanceZip ?? ""}
          maxLength={5}
          style={{ width: 150 }}
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
