import "server-only";
import { getStorage, readJson, writeJson } from "@/lib/storage";

/**
 * Audit log — tracks every content change made through the admin.
 *
 * Stored as audit-log.json (array of entries, newest first).
 * Capped at MAX_ENTRIES to prevent unbounded growth.
 */

const AUDIT_KEY = "audit-log.json";
const MAX_ENTRIES = 1000;

export interface AuditEntry {
  id: string;
  at: string;           // ISO timestamp
  userEmail: string;
  userName: string;
  action: string;       // e.g. "save_business", "delete_prospect", "change_email"
  slug?: string;        // which business/prospect was affected
  detail?: string;      // free-text detail
}

export async function logAudit(entry: Omit<AuditEntry, "id" | "at">): Promise<void> {
  try {
    const storage = await getStorage();
    const existing = (await readJson<AuditEntry[]>(storage, AUDIT_KEY)) ?? [];

    const newEntry: AuditEntry = {
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      at: new Date().toISOString(),
      ...entry,
    };

    const updated = [newEntry, ...existing].slice(0, MAX_ENTRIES);
    await writeJson(storage, AUDIT_KEY, updated);
  } catch {
    // Audit logging must never crash the main action
  }
}

export async function getAuditLog(limit = 200): Promise<AuditEntry[]> {
  const storage = await getStorage();
  const entries = (await readJson<AuditEntry[]>(storage, AUDIT_KEY)) ?? [];
  return entries.slice(0, limit);
}
