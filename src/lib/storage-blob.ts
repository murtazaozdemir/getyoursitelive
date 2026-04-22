import "server-only";
import { put, del, list } from "@vercel/blob";
import type { Storage } from "@/lib/storage";

/**
 * Vercel Blob storage implementation.
 *
 * Required env var (auto-added by Vercel when you create a Blob store):
 *   BLOB_READ_WRITE_TOKEN
 *
 * To set up:
 *   Vercel dashboard → Storage → Create Database → Blob
 *   Vercel automatically adds BLOB_READ_WRITE_TOKEN to your project.
 */

class BlobStorage implements Storage {
  async read(key: string): Promise<string | null> {
    try {
      const { blobs } = await list({ prefix: key, limit: 1 });
      const match = blobs.find((b) => b.pathname === key);
      if (!match) return null;

      const res = await fetch(match.url, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });
      if (!res.ok) return null;
      return await res.text();
    } catch {
      return null;
    }
  }

  async write(key: string, data: string): Promise<void> {
    await put(key, data, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  }

  async list(prefix: string): Promise<string[]> {
    const normalizedPrefix = prefix.replace(/\/+$/, "") + "/";
    const keys: string[] = [];
    let cursor: string | undefined;

    do {
      const res = await list({ prefix: normalizedPrefix, cursor });
      for (const blob of res.blobs) {
        keys.push(blob.pathname);
      }
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);

    return keys;
  }

  async delete(key: string): Promise<void> {
    const { blobs } = await list({ prefix: key, limit: 1 });
    const match = blobs.find((b) => b.pathname === key);
    if (match) await del(match.url);
  }
}

export function createBlobStorage(): Storage {
  return new BlobStorage();
}
