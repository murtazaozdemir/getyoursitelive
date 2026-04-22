import type { NextConfig } from "next";
import { execSync } from "child_process";

function getCommitCount() {
  try {
    return execSync("git rev-list --count HEAD").toString().trim();
  } catch {
    return "0";
  }
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
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
    NEXT_PUBLIC_APP_VERSION: `v${getCommitCount()}`,
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
