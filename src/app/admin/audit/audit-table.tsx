"use client";

import Link from "next/link";
import { SortableTable, Column, FilterDef } from "@/components/admin/sortable-table";
import type { AuditEntry } from "@/lib/audit-log";

const ACTION_LABELS: Record<string, string> = {
  login: "Signed in",
  login_failed: "Failed login",
  save_business: "Edited site",
  create_business: "Created site",
  delete_business: "Deleted site",
  create_prospect: "Added prospect",
  prospect_status: "Changed stage",
  update_prospect_info: "Updated contact info",
  delete_prospect: "Deleted prospect",
  change_email: "Changed email",
  change_password: "Changed password",
  create_user: "Created user",
  delete_user: "Deleted user",
  create_task: "Created task",
  complete_task: "Completed task",
  delete_task: "Deleted task",
};

function actionClass(action: string) {
  if (action === "login_failed") return "audit-badge audit-badge--danger";
  if (action.startsWith("delete")) return "audit-badge audit-badge--warn";
  if (action === "login") return "audit-badge audit-badge--muted";
  return "audit-badge audit-badge--default";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const columns: Column<AuditEntry>[] = [
  {
    key: "at",
    label: "When",
    sortValue: (row) => new Date(row.at).getTime(),
    searchValue: (row) => formatDate(row.at),
    render: (row) => (
      <span className="audit-cell-date">{formatDate(row.at)}</span>
    ),
  },
  {
    key: "who",
    label: "Who",
    sortValue: (row) => row.userName !== "unknown" ? row.userName : row.userEmail,
    searchValue: (row) => `${row.userName} ${row.userEmail}`,
    render: (row) =>
      row.userName && row.userName !== "unknown" ? (
        <>
          <span>{row.userName}</span>
          <br />
          <span className="audit-cell-email">{row.userEmail}</span>
        </>
      ) : (
        <span>{row.userEmail}</span>
      ),
    className: "audit-cell-who",
  },
  {
    key: "action",
    label: "Action",
    sortValue: (row) => ACTION_LABELS[row.action] ?? row.action,
    render: (row) => (
      <span className={actionClass(row.action)}>
        {ACTION_LABELS[row.action] ?? row.action}
      </span>
    ),
  },
  {
    key: "slug",
    label: "Target",
    sortValue: (row) => row.slug ?? "",
    searchValue: (row) => row.slug ?? "",
    render: (row) =>
      row.slug ? (
        <Link href={`/admin/leads/${row.slug}`} className="admin-link" style={{ fontFamily: "monospace", fontSize: 12 }}>
          {row.slug}
        </Link>
      ) : (
        <span style={{ color: "var(--admin-text-muted)" }}>—</span>
      ),
    className: "audit-cell-slug",
  },
  {
    key: "detail",
    label: "Detail",
    searchValue: (row) => row.detail ?? "",
    render: (row) => (
      <span>{row.detail ?? "—"}</span>
    ),
    className: "audit-cell-detail",
  },
];

export function AuditTable({
  entries,
  users,
}: {
  entries: AuditEntry[];
  users: { email: string; name: string }[];
}) {
  const actionOptions = Object.entries(ACTION_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const userOptions = users.map((u) => ({
    value: u.email,
    label: u.name && u.name !== "unknown" ? u.name : u.email,
  }));

  const filters: FilterDef<AuditEntry>[] = [
    {
      key: "action",
      label: "Action",
      options: actionOptions,
      match: (row, value) => row.action === value,
    },
    {
      key: "user",
      label: "User",
      options: userOptions,
      match: (row, value) => row.userEmail === value,
    },
  ];

  return (
    <SortableTable
      data={entries}
      columns={columns}
      filters={filters}
      rowKey={(row) => row.id}
      rowClassName={(row) => row.action === "login_failed" ? "audit-row--danger" : ""}
      emptyMessage="No activity recorded."
      searchPlaceholder="Search audit log..."
    />
  );
}
