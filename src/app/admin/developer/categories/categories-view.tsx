"use client";

import { SortableTable, type Column, type FilterDef } from "@/components/admin/sortable-table";
import allCategories from "../../../../../data/google-categories.json";

interface CategoryRow {
  name: string;
  template: string;
}

const TEMPLATE_LABELS: Record<string, string> = {
  "auto-repair": "Auto Repair",
  "auto-body": "Auto Body",
  "barber": "Barber",
  "restaurant": "Restaurant",
  "plumber": "Plumber",
};

const columns: Column<CategoryRow>[] = [
  {
    key: "name",
    label: "Google Category",
    sortValue: (r) => r.name,
    searchValue: (r) => r.name,
    render: (r) => <span className="admin-text-primary">{r.name}</span>,
  },
  {
    key: "template",
    label: "Our Template",
    sortValue: (r) => r.template || "zzz",
    searchValue: (r) => r.template ? TEMPLATE_LABELS[r.template] || r.template : "",
    render: (r) =>
      r.template ? (
        <span className="admin-badge admin-badge--accent">
          {TEMPLATE_LABELS[r.template] || r.template}
        </span>
      ) : (
        <span className="admin-text-muted">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    sortValue: (r) => (r.template ? 0 : 1),
    render: (r) =>
      r.template ? (
        <span className="admin-badge admin-badge--success">Mapped</span>
      ) : (
        <span className="admin-badge admin-badge--neutral">Unmapped</span>
      ),
  },
];

const filters: FilterDef<CategoryRow>[] = [
  {
    key: "mapping",
    label: "Mapping",
    options: [
      { label: "Mapped", value: "mapped" },
      { label: "Unmapped", value: "unmapped" },
    ],
    match: (row, value) =>
      value === "mapped" ? row.template !== "" : row.template === "",
  },
  {
    key: "template",
    label: "Template",
    options: Object.entries(TEMPLATE_LABELS).map(([value, label]) => ({
      label,
      value,
    })),
    match: (row, value) => row.template === value,
  },
  {
    key: "keyword",
    label: "Contains",
    options: [
      { label: "Restaurant / food", value: "restaurant" },
      { label: "Auto / car / vehicle", value: "auto" },
      { label: "Repair / service", value: "repair" },
      { label: "Salon / beauty / hair", value: "salon" },
      { label: "Plumb / drain / pipe", value: "plumb" },
      { label: "Electric / HVAC", value: "electric" },
      { label: "Clean / wash", value: "clean" },
      { label: "Dental / medical", value: "dental" },
      { label: "Lawn / landscape / garden", value: "lawn" },
      { label: "Roof / paint / floor", value: "roof" },
      { label: "Pet / vet / animal", value: "pet" },
      { label: "Gym / fitness / yoga", value: "gym" },
    ],
    match: (row, value) => {
      const name = row.name.toLowerCase();
      const groups: Record<string, string[]> = {
        restaurant: ["restaurant", "food", "pizza", "sushi", "diner", "cafe", "coffee", "bakery", "grill", "bar ", "pub", "bistro", "cuisine", "kitchen", "catering"],
        auto: ["auto", "car ", "car_", "vehicle", "motor", "tire", "tyre", "mechanic", "transmission", "muffler", "brake"],
        repair: ["repair", "service", "maintenance", "fix"],
        salon: ["salon", "beauty", "hair", "barber", "nail", "spa ", "wax", "cosmetic", "makeup"],
        plumb: ["plumb", "drain", "pipe", "sewer", "septic", "water heater"],
        electric: ["electric", "hvac", "heating", "cooling", "air condition", "furnace"],
        clean: ["clean", "wash", "laund", "dry clean", "janitorial", "maid"],
        dental: ["dental", "dentist", "orthodont", "medical", "doctor", "clinic", "physician", "surgeon", "therap"],
        lawn: ["lawn", "landscap", "garden", "tree ", "tree_", "mowing", "irrigation"],
        roof: ["roof", "paint", "floor", "carpet", "tile", "siding", "gutter"],
        pet: ["pet ", "pet_", "vet", "veterinar", "animal", "dog ", "dog_", "groom"],
        gym: ["gym", "fitness", "yoga", "pilates", "martial", "boxing", "crossfit", "workout"],
      };
      const keywords = groups[value] || [value];
      return keywords.some((kw) => name.includes(kw));
    },
  },
];

export function CategoriesView() {
  const categories: CategoryRow[] = allCategories;
  const mapped = categories.filter((c) => c.template).length;

  return (
    <>
      <div className="admin-stats-row" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{categories.length.toLocaleString()}</span>
          <span className="admin-stat-label">Total categories</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{mapped}</span>
          <span className="admin-stat-label">Mapped to templates</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{(categories.length - mapped).toLocaleString()}</span>
          <span className="admin-stat-label">Unmapped</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{Object.keys(TEMPLATE_LABELS).length}</span>
          <span className="admin-stat-label">Templates</span>
        </div>
      </div>

      <SortableTable
        data={categories}
        columns={columns}
        filters={filters}
        rowKey={(r) => r.name}
        rowClassName={(r) => r.template ? "categories-row--mapped" : ""}
        emptyMessage="No categories match your search."
        searchPlaceholder="Search 4,038 categories..."
      />
    </>
  );
}
