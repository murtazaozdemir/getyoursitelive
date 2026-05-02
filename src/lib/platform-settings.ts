import { getD1 } from "@/lib/db-d1";

/**
 * Simple key-value platform settings stored in D1.
 * Table auto-created if missing.
 */

export async function getSetting(key: string): Promise<string | null> {
  try {
    const db = await getD1();
    const row = await db
      .prepare("SELECT value FROM platform_settings WHERE key = ?")
      .bind(key)
      .first<{ value: string }>();
    console.log(`[platform-settings] getSetting: key=${key}, found=${!!row}`);
    return row?.value ?? null;
  } catch (e) {
    console.error(`[platform-settings] getSetting: key=${key}, error=${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  console.log(`[platform-settings] setSetting: key=${key}`);
  const db = await getD1();
  // Create table if first write
  try {
    await db.prepare(
      `CREATE TABLE IF NOT EXISTS platform_settings (
         key TEXT PRIMARY KEY,
         value TEXT NOT NULL,
         updated_at TEXT NOT NULL DEFAULT ''
       )`
    ).run();
  } catch (e) {
    console.error(`[platform-settings] setSetting: table creation error=${e instanceof Error ? e.message : String(e)}`);
  }
  await db
    .prepare(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    )
    .bind(key, value)
    .run();
}

// ── Envelope margin helpers ──

export interface EnvelopeMargins {
  // Front
  returnTop: string;
  returnLeft: string;
  postageTop: string;
  postageRight: string;
  noticeTop: string;
  noticeLeft: string;
  recipientTop: string;
  recipientLeft: string;
  // Back
  backContentTop: string;
  backContentBottom: string;
  backContentLeft: string;
  backContentRight: string;
}

export const ENVELOPE1_DEFAULTS: EnvelopeMargins = {
  returnTop: "0.3",
  returnLeft: "0.35",
  postageTop: "0.25",
  postageRight: "0.35",
  noticeTop: "0.28",
  noticeLeft: "3.0",
  recipientTop: "3.35",
  recipientLeft: "2.6",
  backContentTop: "0.75",
  backContentBottom: "0.75",
  backContentLeft: "0.6",
  backContentRight: "1.6",
};

export const ENVELOPE2_DEFAULTS: EnvelopeMargins = {
  returnTop: "0.3",
  returnLeft: "0.35",
  postageTop: "0.25",
  postageRight: "0.35",
  noticeTop: "0.28",
  noticeLeft: "3.0",
  recipientTop: "3.35",
  recipientLeft: "2.6",
  backContentTop: "0.15",
  backContentBottom: "0.15",
  backContentLeft: "0.15",
  backContentRight: "1.6",
};

export async function getEnvelopeMargins(envelope: "envelope1" | "envelope2"): Promise<EnvelopeMargins> {
  const defaults = envelope === "envelope1" ? ENVELOPE1_DEFAULTS : ENVELOPE2_DEFAULTS;
  const raw = await getSetting(`${envelope}_margins`);
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export async function setEnvelopeMargins(envelope: "envelope1" | "envelope2", margins: EnvelopeMargins): Promise<void> {
  await setSetting(`${envelope}_margins`, JSON.stringify(margins));
}
