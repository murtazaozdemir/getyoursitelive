import "server-only";
import type { Storage } from "@/lib/storage";

/**
 * Cloudflare R2 storage implementation.
 *
 * Stub for now — activated during Phase 3d (deployment). Will use the
 * Cloudflare R2 binding from the Pages runtime environment.
 *
 * Runtime: Cloudflare Workers / Pages Functions.
 * Binding expected: env.BUCKET (R2 bucket binding configured in wrangler.toml)
 */

class R2Storage implements Storage {
  async read(_key: string): Promise<string | null> {
    throw new Error("R2 storage not yet implemented. Set STORAGE_BACKEND=local for dev.");
  }

  async write(_key: string, _data: string): Promise<void> {
    throw new Error("R2 storage not yet implemented. Set STORAGE_BACKEND=local for dev.");
  }

  async list(_prefix: string): Promise<string[]> {
    throw new Error("R2 storage not yet implemented. Set STORAGE_BACKEND=local for dev.");
  }

  async delete(_key: string): Promise<void> {
    throw new Error("R2 storage not yet implemented. Set STORAGE_BACKEND=local for dev.");
  }
}

export function createR2Storage(): Storage {
  return new R2Storage();
}
