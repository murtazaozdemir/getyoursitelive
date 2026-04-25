"use client";

import { SortableTable, Column, FilterDef } from "@/components/admin/sortable-table";
import { DeleteUserButton, RevokeInviteButton, ResendInviteButton } from "./user-actions";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  ownedSlug: string | null;
  createdAt?: string;
  isFounder: boolean;
  isSelf: boolean;
}

interface InviteRow {
  token: string;
  email: string;
  role: string;
  ownedSlug?: string | null;
  createdAt: string;
}

type CombinedRow = (UserRow & { kind: "user" }) | (InviteRow & { kind: "invite" });

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const columns: Column<CombinedRow>[] = [
  {
    key: "name",
    label: "Name / Email",
    sortValue: (row) => row.kind === "user" ? row.name : row.email,
    searchValue: (row) => row.kind === "user" ? `${row.name} ${row.email}` : row.email,
    render: (row) =>
      row.kind === "user" ? (
        <>
          <div style={{ fontWeight: 500 }}>{row.name}</div>
          <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>{row.email}</div>
        </>
      ) : (
        <>
          <div style={{ fontStyle: "italic", color: "var(--admin-text-soft)" }}>—</div>
          <div style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>{row.email}</div>
        </>
      ),
  },
  {
    key: "role",
    label: "Role",
    sortValue: (row) => row.role,
    render: (row) => {
      let label = row.role === "admin" ? "Admin" : "Business Owner";
      if (row.kind === "user" && row.isFounder) label = "Founder";
      return (
        <span className="admin-header-user-role" data-role={row.role}>
          {label}
        </span>
      );
    },
  },
  {
    key: "slug",
    label: "Owned slug",
    sortValue: (row) => row.ownedSlug ?? "",
    searchValue: (row) => row.ownedSlug ?? "",
    render: (row) =>
      row.ownedSlug ? (
        <code style={{ fontFamily: "ui-monospace, 'SF Mono', monospace", fontSize: 12, background: "var(--admin-surface-2)", padding: "2px 6px", borderRadius: 4 }}>
          {row.ownedSlug}
        </code>
      ) : (
        <span className="admin-text-muted">—</span>
      ),
  },
  {
    key: "status",
    label: "Status",
    sortValue: (row) => row.kind === "user" ? "Active" : "Pending",
    render: (row) =>
      row.kind === "user" ? (
        <span className="prospect-chip" style={{ background: "var(--admin-success-bg, #d1fae5)", color: "var(--admin-success, #065f46)" }}>
          Active
        </span>
      ) : (
        <span className="prospect-chip prospect-chip--warn">
          Pending invite
        </span>
      ),
  },
  {
    key: "date",
    label: "Date",
    sortValue: (row) => row.createdAt ? new Date(row.createdAt).getTime() : 0,
    render: (row) => <span>{row.createdAt ? fmt(row.createdAt) : "—"}</span>,
  },
  {
    key: "actions",
    label: "",
    render: (row) => {
      if (row.kind === "user") {
        return row.isSelf ? null : <DeleteUserButton id={row.id} name={row.name} />;
      }
      return (
        <div style={{ display: "flex", gap: 6 }}>
          <ResendInviteButton email={row.email} role={row.role} ownedSlug={row.ownedSlug} />
          <RevokeInviteButton token={row.token} email={row.email} />
        </div>
      );
    },
  },
];

export function UsersTable({
  users,
  invites,
}: {
  users: UserRow[];
  invites: InviteRow[];
}) {
  const combined: CombinedRow[] = [
    ...users.map((u) => ({ ...u, kind: "user" as const })),
    ...invites.map((inv) => ({ ...inv, kind: "invite" as const })),
  ];

  const filters: FilterDef<CombinedRow>[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "pending", label: "Pending invite" },
      ],
      match: (row, value) => value === "active" ? row.kind === "user" : row.kind === "invite",
    },
    {
      key: "role",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "owner", label: "Business Owner" },
      ],
      match: (row, value) => row.role === value,
    },
  ];

  return (
    <SortableTable
      data={combined}
      columns={columns}
      filters={filters}
      rowKey={(row) => row.kind === "user" ? row.id : row.token}
      rowClassName={(row) => row.kind === "invite" ? "sortable-row--faded" : ""}
      emptyMessage="No users yet."
      searchPlaceholder="Search users..."
    />
  );
}
