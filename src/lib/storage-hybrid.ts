import "server-only";
import type { Storage } from "@/lib/storage";

/**
 * Hybrid storage: Blob is authoritative, local deployment files are the fallback.
 *
 * Read:  Blob first → fall back to local if key not found in Blob
 * Write: Blob only (all edits made online go to Blob)
 * List:  Union of Blob keys + local keys (new local additions are visible immediately)
 * Delete: Blob only + records the deleted key so local fallback doesn't resurface it
 *
 * This lets us do bulk local work (scripts, batch data), commit to git, deploy —
 * and the new data appears in production automatically without any manual sync.
 * Edits the user makes online are saved to Blob and always take precedence.
 */

const TOMBSTONES_KEY = "_tombstones.json";

export class HybridStorage implements Storage {
  private tombstones: Set<string> | null = null;

  constructor(
    private readonly blob: Storage,
    private readonly local: Storage,
  ) {}

  private async getTombstones(): Promise<Set<string>> {
    if (this.tombstones) return this.tombstones;
    try {
      const raw = await this.blob.read(TOMBSTONES_KEY);
      this.tombstones = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      this.tombstones = new Set();
    }
    return this.tombstones;
  }

  private async saveTombstones(): Promise<void> {
    if (!this.tombstones) return;
    await this.blob.write(
      TOMBSTONES_KEY,
      JSON.stringify([...this.tombstones], null, 2),
    );
  }

  async read(key: string): Promise<string | null> {
    // Deleted keys never return data
    const tombstones = await this.getTombstones();
    if (tombstones.has(key)) return null;

    // Blob is authoritative — if it has the key, use it
    const blobData = await this.blob.read(key);
    if (blobData !== null) return blobData;

    // Fall back to file shipped with the deployment (new local additions)
    return this.local.read(key);
  }

  async write(key: string, data: string): Promise<void> {
    // Un-tombstone if it was previously deleted and is being recreated
    const tombstones = await this.getTombstones();
    if (tombstones.has(key)) {
      tombstones.delete(key);
      await this.saveTombstones();
    }
    await this.blob.write(key, data);
  }

  async list(prefix: string): Promise<string[]> {
    const [blobKeys, localKeys] = await Promise.all([
      this.blob.list(prefix).catch(() => [] as string[]),
      this.local.list(prefix).catch(() => [] as string[]),
    ]);

    // Union of both, deduped, minus tombstoned keys
    const tombstones = await this.getTombstones();
    const all = [...new Set([...blobKeys, ...localKeys])];
    return all.filter((k) => !tombstones.has(k));
  }

  async delete(key: string): Promise<void> {
    // Remove from Blob and tombstone so local fallback doesn't resurface it
    await this.blob.delete(key);
    const tombstones = await this.getTombstones();
    tombstones.add(key);
    await this.saveTombstones();
  }
}
