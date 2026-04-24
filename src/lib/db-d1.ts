import { getRequestContext } from "@cloudflare/next-on-pages";

/**
 * Returns the D1 database binding.
 *
 * In production (Cloudflare Pages) the binding comes from the Workers runtime.
 * In local dev, @cloudflare/next-on-pages/next-dev wires up miniflare so
 * getRequestContext() works during `next dev`.
 *
 * Must be called inside a request handler or server action — never at module
 * load time (getRequestContext() throws outside a request context).
 */
export function getD1(): D1Database {
  const { env } = getRequestContext();
  return env.DB;
}
