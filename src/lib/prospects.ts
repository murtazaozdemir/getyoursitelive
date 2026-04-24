import { getD1 } from "@/lib/db-d1";

export type ProspectStatus = "found" | "contacted" | "interested" | "paid" | "delivered";

export const PIPELINE_STAGES: { status: ProspectStatus; label: string }[] = [
  { status: "found", label: "Information Complete" },
  { status: "contacted", label: "Contacted" },
  { status: "interested", label: "Interested" },
  { status: "paid", label: "Paid" },
  { status: "delivered", label: "Delivered" },
];

export interface ProspectNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface Prospect {
  slug: string;
  shortId?: number;
  name: string;
  phone: string;
  address: string;
  status: ProspectStatus;
  notes: ProspectNote[];
  domain1?: string;
  domain2?: string;
  domain3?: string;
  proposalSentAt?: string;
  proposalSentBy?: string;
  contactedBy?: string;
  contactedByName?: string;
  contactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------
// D1 row → Prospect
// ---------------------------------------------------------------

interface ProspectRow {
  slug: string;
  short_id: number | null;
  name: string;
  phone: string;
  phone_normalized: string;
  address: string;
  status: string;
  notes: string;
  domain1: string | null;
  domain2: string | null;
  domain3: string | null;
  proposal_sent_at: string | null;
  proposal_sent_by: string | null;
  contacted_by: string | null;
  contacted_by_name: string | null;
  contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToProspect(row: ProspectRow): Prospect {
  return {
    slug: row.slug,
    shortId: row.short_id ?? undefined,
    name: row.name,
    phone: row.phone,
    address: row.address,
    status: row.status as ProspectStatus,
    notes: JSON.parse(row.notes) as ProspectNote[],
    domain1: row.domain1 ?? undefined,
    domain2: row.domain2 ?? undefined,
    domain3: row.domain3 ?? undefined,
    proposalSentAt: row.proposal_sent_at ?? undefined,
    proposalSentBy: row.proposal_sent_by ?? undefined,
    contactedBy: row.contacted_by ?? undefined,
    contactedByName: row.contacted_by_name ?? undefined,
    contactedAt: row.contacted_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Strip all non-digit characters for phone comparison */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// ---------------------------------------------------------------
// Queries
// ---------------------------------------------------------------

export async function listProspects(): Promise<Prospect[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT * FROM prospects ORDER BY created_at DESC")
    .all<ProspectRow>();
  return results.map(rowToProspect);
}

export async function getProspect(slug: string): Promise<Prospect | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE slug = ?")
    .bind(slug)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

export async function getProspectByShortId(shortId: number): Promise<Prospect | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE short_id = ?")
    .bind(shortId)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

export async function findProspectByPhone(phone: string): Promise<Prospect | null> {
  const normalized = normalizePhone(phone);
  if (normalized.length < 7) return null;
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM prospects WHERE phone_normalized = ?")
    .bind(normalized)
    .first<ProspectRow>();
  return row ? rowToProspect(row) : null;
}

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export async function createProspect(prospect: Omit<Prospect, "shortId">): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  // Assign next sequential short_id atomically using MAX()
  const maxRow = await db
    .prepare("SELECT COALESCE(MAX(short_id), 0) AS max_id FROM prospects")
    .first<{ max_id: number }>();
  const shortId = (maxRow?.max_id ?? 0) + 1;

  await db
    .prepare(
      `INSERT INTO prospects (
        slug, short_id, name, phone, phone_normalized, address, status, notes,
        domain1, domain2, domain3,
        proposal_sent_at, proposal_sent_by,
        contacted_by, contacted_by_name, contacted_at,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      prospect.slug,
      shortId,
      prospect.name,
      prospect.phone,
      normalizePhone(prospect.phone),
      prospect.address,
      prospect.status,
      JSON.stringify(prospect.notes),
      prospect.domain1 ?? null,
      prospect.domain2 ?? null,
      prospect.domain3 ?? null,
      prospect.proposalSentAt ?? null,
      prospect.proposalSentBy ?? null,
      prospect.contactedBy ?? null,
      prospect.contactedByName ?? null,
      prospect.contactedAt ?? null,
      prospect.createdAt ?? now,
      prospect.updatedAt ?? now,
    )
    .run();
}

export async function updateProspect(slug: string, patch: Partial<Prospect>): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  // Build SET clause dynamically from the patch fields
  const sets: string[] = ["updated_at = ?"];
  const values: unknown[] = [now];

  const fieldMap: Record<string, string> = {
    name: "name",
    phone: "phone",
    address: "address",
    status: "status",
    notes: "notes",
    domain1: "domain1",
    domain2: "domain2",
    domain3: "domain3",
    proposalSentAt: "proposal_sent_at",
    proposalSentBy: "proposal_sent_by",
    contactedBy: "contacted_by",
    contactedByName: "contacted_by_name",
    contactedAt: "contacted_at",
  };

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in patch) {
      sets.push(`${col} = ?`);
      const val = patch[key as keyof Prospect];
      // notes is a JSON array
      values.push(key === "notes" ? JSON.stringify(val) : (val ?? null));
    }
  }

  // Keep phone_normalized in sync when phone changes
  if ("phone" in patch && patch.phone !== undefined) {
    sets.push("phone_normalized = ?");
    values.push(normalizePhone(patch.phone));
  }

  values.push(slug);
  await db
    .prepare(`UPDATE prospects SET ${sets.join(", ")} WHERE slug = ?`)
    .bind(...values)
    .run();
}

export async function deleteProspect(slug: string): Promise<void> {
  const db = await getD1();
  await db.prepare("DELETE FROM prospects WHERE slug = ?").bind(slug).run();
}
