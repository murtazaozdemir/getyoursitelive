import "server-only";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import type { Storage } from "@/lib/storage";

/**
 * Cloudflare R2 storage via the S3-compatible API.
 *
 * Required env vars:
 *   CLOUDFLARE_ACCOUNT_ID   — Your Cloudflare account ID
 *   R2_ACCESS_KEY_ID        — R2 API token "Access Key ID"
 *   R2_SECRET_ACCESS_KEY    — R2 API token "Secret Access Key"
 *   R2_BUCKET               — Bucket name (e.g. "get-your-site-live")
 *
 * In Vercel: set these in Project → Settings → Environment Variables.
 * STORAGE_BACKEND=r2 must also be set.
 */

function createClient(): S3Client {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 storage requires CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY env vars.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2 storage requires the R2_BUCKET env var.");
  return bucket;
}

class R2Storage implements Storage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = createClient();
    this.bucket = getBucket();
  }

  async read(key: string): Promise<string | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!res.Body) return null;
      return await res.Body.transformToString("utf-8");
    } catch (err: unknown) {
      const code = (err as { Code?: string; name?: string }).Code ?? (err as { name?: string }).name;
      if (code === "NoSuchKey" || code === "NotFound") return null;
      throw err;
    }
  }

  async write(key: string, data: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: "application/json",
      }),
    );
  }

  async list(prefix: string): Promise<string[]> {
    const normalizedPrefix = prefix.replace(/\/+$/, "") + "/";
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const res = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: normalizedPrefix,
          ContinuationToken: continuationToken,
        }),
      );
      for (const obj of res.Contents ?? []) {
        if (obj.Key) keys.push(obj.Key);
      }
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);

    return keys;
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

export function createR2Storage(): Storage {
  return new R2Storage();
}
