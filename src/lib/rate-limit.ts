import { getD1 } from "@/lib/db-d1";

/**
 * IP-based rate limiting for the login endpoint.
 *
 * Stores attempt counts in D1 `rate_limits` table.
 * After MAX_ATTEMPTS failures within the window, the IP is locked
 * for LOCKOUT_MINUTES minutes.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

interface RateLimitRow {
  ip: string;
  attempts: number;
  window_start: string;
  locked_until: string | null;
}

export interface RateLimitResult {
  allowed: boolean;
  /** How many attempts remain before lockout (undefined when locked) */
  remaining?: number;
  /** ISO timestamp when the lockout ends (undefined when not locked) */
  lockedUntil?: string;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const db = await getD1();
  const now = new Date();

  const row = await db
    .prepare("SELECT * FROM rate_limits WHERE ip = ? LIMIT 1")
    .bind(ip)
    .first<RateLimitRow>();

  if (!row) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Currently locked?
  if (row.locked_until) {
    const lockExpiry = new Date(row.locked_until);
    if (now < lockExpiry) {
      return { allowed: false, lockedUntil: row.locked_until };
    }
    // Lock expired — clean up and allow
    await db.prepare("DELETE FROM rate_limits WHERE ip = ?").bind(ip).run();
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Window expired? Reset silently
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  if (now.getTime() - new Date(row.window_start).getTime() > windowMs) {
    await db.prepare("DELETE FROM rate_limits WHERE ip = ?").bind(ip).run();
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  const remaining = MAX_ATTEMPTS - row.attempts;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

/** Call after a failed login attempt. Returns updated rate limit state. */
export async function recordFailedAttempt(ip: string): Promise<RateLimitResult> {
  const db = await getD1();
  const now = new Date();
  const nowIso = now.toISOString();
  const windowMs = WINDOW_MINUTES * 60 * 1000;

  const row = await db
    .prepare("SELECT * FROM rate_limits WHERE ip = ? LIMIT 1")
    .bind(ip)
    .first<RateLimitRow>();

  let attempts: number;
  let windowStart: string;

  if (!row || now.getTime() - new Date(row.window_start).getTime() > windowMs) {
    // No record or window expired — start fresh
    attempts = 1;
    windowStart = nowIso;
  } else {
    attempts = row.attempts + 1;
    windowStart = row.window_start;
  }

  if (attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
    await db
      .prepare(
        `INSERT INTO rate_limits (ip, attempts, window_start, locked_until)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(ip) DO UPDATE SET
           attempts = excluded.attempts,
           window_start = excluded.window_start,
           locked_until = excluded.locked_until`,
      )
      .bind(ip, attempts, windowStart, lockedUntil)
      .run();
    return { allowed: false, lockedUntil };
  }

  await db
    .prepare(
      `INSERT INTO rate_limits (ip, attempts, window_start, locked_until)
       VALUES (?, ?, ?, NULL)
       ON CONFLICT(ip) DO UPDATE SET
         attempts = excluded.attempts,
         window_start = excluded.window_start,
         locked_until = NULL`,
    )
    .bind(ip, attempts, windowStart)
    .run();

  return { allowed: true, remaining: MAX_ATTEMPTS - attempts };
}

/** Call after a successful login to clear the record. */
export async function clearRateLimit(ip: string): Promise<void> {
  const db = await getD1();
  await db.prepare("DELETE FROM rate_limits WHERE ip = ?").bind(ip).run();
}
