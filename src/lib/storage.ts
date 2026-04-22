import "server-only";

/**
 * Storage abstraction.
 *
 * Lets us swap between local-filesystem (dev) and Cloudflare R2 (prod)
 * without changing any callers. Backend chosen via STORAGE_BACKEND env var.
 *
 * Keys are forward-slash paths, e.g.:
 *   businesses/star-auto.json
 *   users.json
 *   bookings/star-auto/2026-04-19T10-00-00Z.json
 */

export interface Storage {
  /** Read raw text. Returns null if the key doesn't exist. */
  read(key: string): Promise<string | null>;

  /** Write text. Creates parent "directories" as needed. */
  write(key: string, data: string): Promise<void>;

  /** List all keys with the given prefix. */
  list(prefix: string): Promise<string[]>;

  /** Delete a key. No-op if missing. */
  delete(key: string): Promise<void>;
}

// JSON convenience wrappers — most callers use these, not raw text

export async function readJson<T>(storage: Storage, key: string): Promise<T | null> {
  const raw = await storage.read(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (err) {
    throw new Error(`Failed to parse JSON at key "${key}": ${err}`);
  }
}

export async function writeJson<T>(
  storage: Storage,
  key: string,
  value: T,
): Promise<void> {
  await storage.write(key, JSON.stringify(value, null, 2));
}

// ---------------------------------------------------------------
// Backend factory — chooses local or R2 based on env var
// ---------------------------------------------------------------

let storageInstance: Storage | null = null;

export async function getStorage(): Promise<Storage> {
  if (storageInstance) return storageInstance;

  const backend = process.env.STORAGE_BACKEND ?? "local";

  if (backend === "r2") {
    const { createR2Storage } = await import("@/lib/storage-r2");
    storageInstance = createR2Storage();
  } else if (backend === "blob") {
    // Hybrid: Blob is authoritative for existing data; local deployment files
    // fill in anything not yet in Blob (new additions committed to git).
    // Writes always go to Blob. Deletes are tombstoned so local files don't resurface them.
    const { createBlobStorage } = await import("@/lib/storage-blob");
    const { createLocalStorage } = await import("@/lib/storage-local");
    const { HybridStorage } = await import("@/lib/storage-hybrid");
    storageInstance = new HybridStorage(createBlobStorage(), createLocalStorage());
  } else {
    const { createLocalStorage } = await import("@/lib/storage-local");
    storageInstance = createLocalStorage();
  }

  return storageInstance;
}
