import "server-only";
import { getD1 } from "@/lib/db-d1";

const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

interface ResetTokenRow {
  token: string;
  user_id: string;
  expires_at: string;
}

export async function createResetToken(userId: string): Promise<string> {
  const db = getD1();
  // Remove any existing tokens for this user
  await db.prepare("DELETE FROM password_resets WHERE user_id = ?").bind(userId).run();

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + EXPIRY_MS).toISOString();

  await db
    .prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, userId, expiresAt)
    .run();

  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT * FROM password_resets WHERE token = ? LIMIT 1")
    .bind(token)
    .first<ResetTokenRow>();

  if (!row) return null;

  // Always delete — whether expired or not
  await db.prepare("DELETE FROM password_resets WHERE token = ?").bind(token).run();

  if (new Date(row.expires_at) < new Date()) return null;

  return row.user_id;
}
