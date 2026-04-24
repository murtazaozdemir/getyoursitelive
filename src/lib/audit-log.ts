import "server-only";
import { getD1 } from "@/lib/db-d1";

/**
 * Audit log — tracks every content change made through the admin.
 * Stored in D1 `audit_log` table.
 */

export interface AuditEntry {
  id: string;
  at: string;           // ISO timestamp
  userEmail: string;
  userName: string;
  action: string;       // e.g. "save_business", "delete_prospect", "change_email"
  slug?: string;        // which business/prospect was affected
  detail?: string;      // free-text detail
}

interface AuditRow {
  id: string;
  at: string;
  user_email: string;
  user_name: string;
  action: string;
  slug: string | null;
  detail: string | null;
}

function rowToEntry(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    at: row.at,
    userEmail: row.user_email,
    userName: row.user_name,
    action: row.action,
    slug: row.slug ?? undefined,
    detail: row.detail ?? undefined,
  };
}

export async function logAudit(entry: Omit<AuditEntry, "id" | "at">): Promise<void> {
  try {
    const db = getD1();
    const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const at = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO audit_log (id, at, user_email, user_name, action, slug, detail)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        at,
        entry.userEmail,
        entry.userName,
        entry.action,
        entry.slug ?? null,
        entry.detail ?? null,
      )
      .run();
  } catch {
    // Audit logging must never crash the main action
  }
}

export async function getAuditLog(limit = 200): Promise<AuditEntry[]> {
  const db = getD1();
  const { results } = await db
    .prepare("SELECT * FROM audit_log ORDER BY at DESC LIMIT ?")
    .bind(limit)
    .all<AuditRow>();
  return results.map(rowToEntry);
}

export async function getAuditLogForSlug(slug: string, limit = 100): Promise<AuditEntry[]> {
  const db = getD1();
  const { results } = await db
    .prepare("SELECT * FROM audit_log WHERE slug = ? ORDER BY at DESC LIMIT ?")
    .bind(slug, limit)
    .all<AuditRow>();
  return results.map(rowToEntry);
}
