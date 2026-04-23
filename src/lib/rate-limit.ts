import "server-only";
import { getStorage, readJson, writeJson } from "@/lib/storage";

/**
 * IP-based rate limiting for the login endpoint.
 *
 * Stores attempt counts in storage under rate-limits/{ip}.json.
 * After MAX_ATTEMPTS failures within the window, the IP is locked
 * for LOCKOUT_MINUTES minutes.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 15;

interface RateLimitRecord {
  attempts: number;
  windowStart: string; // ISO
  lockedUntil: string | null; // ISO or null
}

function keyFor(ip: string): string {
  // Sanitize IP so it's a safe filename
  const safe = ip.replace(/[^a-zA-Z0-9:._-]/g, "_");
  return `rate-limits/${safe}.json`;
}

export interface RateLimitResult {
  allowed: boolean;
  /** How many attempts remain before lockout (undefined when locked) */
  remaining?: number;
  /** ISO timestamp when the lockout ends (undefined when not locked) */
  lockedUntil?: string;
}

export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const storage = await getStorage();
  const key = keyFor(ip);
  const now = new Date();

  let record = await readJson<RateLimitRecord>(storage, key);

  // No record — first attempt, allow
  if (!record) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Currently locked?
  if (record.lockedUntil) {
    const lockExpiry = new Date(record.lockedUntil);
    if (now < lockExpiry) {
      return { allowed: false, lockedUntil: record.lockedUntil };
    }
    // Lock expired — reset and allow
    await storage.delete(key);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Window expired? Reset silently
  const windowStart = new Date(record.windowStart);
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  if (now.getTime() - windowStart.getTime() > windowMs) {
    await storage.delete(key);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  const remaining = MAX_ATTEMPTS - record.attempts;
  return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
}

/** Call after a failed login attempt. Returns updated rate limit state. */
export async function recordFailedAttempt(ip: string): Promise<RateLimitResult> {
  const storage = await getStorage();
  const key = keyFor(ip);
  const now = new Date();

  let record = await readJson<RateLimitRecord>(storage, key);

  if (!record) {
    record = { attempts: 0, windowStart: now.toISOString(), lockedUntil: null };
  }

  // If window expired, reset
  const windowMs = WINDOW_MINUTES * 60 * 1000;
  if (now.getTime() - new Date(record.windowStart).getTime() > windowMs) {
    record = { attempts: 0, windowStart: now.toISOString(), lockedUntil: null };
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000).toISOString();
    record.lockedUntil = lockedUntil;
    await writeJson(storage, key, record);
    return { allowed: false, lockedUntil };
  }

  await writeJson(storage, key, record);
  const remaining = MAX_ATTEMPTS - record.attempts;
  return { allowed: true, remaining };
}

/** Call after a successful login to clear the record. */
export async function clearRateLimit(ip: string): Promise<void> {
  const storage = await getStorage();
  await storage.delete(keyFor(ip));
}
