// Type declarations for Cloudflare Pages bindings.
// These are injected by the Workers runtime — not available via process.env.

interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
}
