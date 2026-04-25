"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search, X } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  /** Return the raw value for sorting. If omitted, column is not sortable. */
  sortValue?: (row: T) => string | number;
  /** Return the value used for text search. If omitted, column is not searchable. */
  searchValue?: (row: T) => string;
  /** Render the cell content. */
  render: (row: T) => React.ReactNode;
  /** Optional class for the <td> */
  className?: string;
  /** Optional class for the <th> */
  headerClassName?: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: FilterOption[];
  match: (row: T, value: string) => boolean;
}

type SortDir = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function SortableTable<T extends {}>({
  data,
  columns,
  filters = [],
  rowKey,
  rowClassName,
  emptyMessage = "No data.",
  searchPlaceholder = "Search...",
}: {
  data: T[];
  columns: Column<T>[];
  filters?: FilterDef<T>[];
  rowKey: (row: T, index: number) => string;
  rowClassName?: (row: T) => string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const searchable = columns.some((c) => c.searchValue);

  function handleSort(key: string) {
    if (sortCol === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
  }

  function setFilter(key: string, value: string) {
    setActiveFilters((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  }

  const processed = useMemo(() => {
    let rows = [...data];

    // Apply filters
    for (const f of filters) {
      const val = activeFilters[f.key];
      if (val) {
        rows = rows.filter((r) => f.match(r, val));
      }
    }

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => col.searchValue?.(row)?.toLowerCase().includes(q))
      );
    }

    // Apply sort
    const col = columns.find((c) => c.key === sortCol);
    if (col?.sortValue) {
      const getter = col.sortValue;
      rows.sort((a, b) => {
        const va = getter(a);
        const vb = getter(b);
        let cmp: number;
        if (typeof va === "number" && typeof vb === "number") {
          cmp = va - vb;
        } else {
          cmp = String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: "base" });
        }
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    return rows;
  }, [data, columns, filters, activeFilters, search, sortCol, sortDir]);

  return (
    <div className="sortable-table-wrap">
      {/* Toolbar — search + filters */}
      {(searchable || filters.length > 0) && (
        <div className="sortable-toolbar">
          {searchable && (
            <div className="sortable-search">
              <Search className="sortable-search-icon" />
              <input
                type="text"
                className="sortable-search-input"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="sortable-search-clear" onClick={() => setSearch("")}>
                  <X className="sortable-search-clear-icon" />
                </button>
              )}
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              className="sortable-filter-select"
              value={activeFilters[f.key] || ""}
              onChange={(e) => setFilter(f.key, e.target.value)}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ))}
          <span className="sortable-count">
            {processed.length === data.length
              ? `${data.length} total`
              : `${processed.length} of ${data.length}`}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="sortable-table-scroll">
        <table className="sortable-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const sortable = !!col.sortValue;
                const active = sortCol === col.key;
                return (
                  <th
                    key={col.key}
                    className={`${col.headerClassName || ""} ${sortable ? "sortable-th--sortable" : ""} ${active ? "sortable-th--active" : ""}`}
                    onClick={sortable ? () => handleSort(col.key) : undefined}
                  >
                    <span className="sortable-th-inner">
                      {col.label}
                      {sortable && (
                        <span className="sortable-th-icon">
                          {active ? (
                            sortDir === "asc" ? <ChevronUp /> : <ChevronDown />
                          ) : (
                            <ChevronsUpDown />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="sortable-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processed.map((row, i) => (
                <tr key={rowKey(row, i)} className={rowClassName?.(row) ?? ""}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className ?? ""}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
