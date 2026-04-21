import type { NextConfig } from "next";
import { execSync } from "child_process";

function getCommitCount() {
  try {
    return execSync("git rev-list --count HEAD").toString().trim();
  } catch {
    return "0";
  }
}

const nextConfig: NextConfig = {
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
