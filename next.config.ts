import type { NextConfig } from "next";

// Wire up Cloudflare D1/R2 bindings for local `next dev`.
// In production (Cloudflare Pages) this is handled by the runtime automatically.
// Fire-and-forget — must not use top-level await (breaks Next.js 16 config loader).
if (process.env.NODE_ENV === "development") {
  import("@cloudflare/next-on-pages/next-dev")
    .then(({ setupDevPlatform }) => setupDevPlatform())
    .catch(() => {}); // non-fatal if package isn't available
}

const securityHeaders = [
  // Prevent clickjacking — admin pages must not be iframed
  { key: "X-Frame-Options", value: "DENY" },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak the full URL in the Referer header to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_BUILD_TIME: (() => {
      const t = new Date().toISOString();
      console.log("[next.config] NEXT_PUBLIC_BUILD_TIME =", t);
      return t;
    })(),
    NEXT_PUBLIC_APP_VERSION: (() => {
      const sha = process.env.CF_PAGES_COMMIT_SHA;
      const branch = process.env.CF_PAGES_BRANCH;
      console.log("[next.config] CF_PAGES_COMMIT_SHA =", sha ?? "(not set)");
      console.log("[next.config] CF_PAGES_BRANCH =", branch ?? "(not set)");
      console.log("[next.config] NODE_ENV =", process.env.NODE_ENV);
      const version = sha?.slice(0, 7) ?? "dev";
      console.log("[next.config] NEXT_PUBLIC_APP_VERSION =", version);
      return version;
    })(),
  },
  // Server-rendered. Each request is served fresh from the storage layer
  // (local filesystem in dev, Cloudflare R2 in production). This replaces
  // the previous `output: "export"` static build.

  // Build cache dir. Default is ".next"; using a parameterized path makes it
  // easy to swap when a previous build's files are locked (e.g. some sandboxes).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

  // Allow HMR connections from these local hostnames during development.
  // Some browsers/extensions resolve localhost to 127.0.0.1; both need to be
  // on this list for hot reload to work cleanly.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.183"],

  images: {
    remotePatterns: [
      // Pexels — primary image source (more stable than Unsplash's dynamic CDN)
      { protocol: "https", hostname: "images.pexels.com" },
      // Unsplash — kept as fallback for any legacy URLs not yet migrated
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
