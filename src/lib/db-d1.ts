import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Returns the D1 database binding.
 *
 * Uses @opennextjs/cloudflare's getCloudflareContext() which works in both
 * the Cloudflare Workers runtime (production) and local dev via wrangler.
 *
 * Must be called inside a request handler or server action — never at module
 * load time.
 */
export async function getD1(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB as D1Database;
}
