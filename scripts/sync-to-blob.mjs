/**
 * sync-to-blob.mjs
 *
 * Uploads all local data files to Vercel Blob (production storage).
 *
 * BEFORE running:
 *   1. Go to Vercel dashboard → Storage → your Blob store → "Connect" tab
 *   2. Copy the BLOB_READ_WRITE_TOKEN value
 *   3. Add to .env.local:  BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
 *   4. Run: node scripts/sync-to-blob.mjs
 *
 * This uploads:
 *   - data/businesses/*.json  → businesses/{slug}.json in Blob
 *   - data/prospects.json     → prospects.json in Blob
 *   - data/users.json         → users.json in Blob (if present)
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

// Load .env.local manually
if (existsSync(".env.local")) {
  const envRaw = readFileSync(".env.local", "utf-8");
  for (const line of envRaw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("❌  BLOB_READ_WRITE_TOKEN not set.");
  console.error("   Add it to .env.local and retry.");
  process.exit(1);
}

// Dynamic import so the token is already in process.env when the module loads
const { put } = await import("@vercel/blob");

async function upload(key, content) {
  await put(key, content, {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  console.log(`  ✓  ${key}`);
}

// ── Businesses ──────────────────────────────────────────────────
const bizDir = "./data/businesses";
if (!existsSync(bizDir)) {
  console.error("❌  data/businesses/ not found. Run from the project root.");
  process.exit(1);
}
const bizFiles = readdirSync(bizDir).filter((f) => f.endsWith(".json"));
console.log(`\nUploading ${bizFiles.length} businesses...`);
for (const file of bizFiles) {
  const content = readFileSync(join(bizDir, file), "utf-8");
  await upload(`businesses/${file}`, content);
}

// ── Prospects ───────────────────────────────────────────────────
const prospectsPath = "./data/prospects.json";
if (existsSync(prospectsPath)) {
  console.log("\nUploading prospects.json...");
  const content = readFileSync(prospectsPath, "utf-8");
  await upload("prospects.json", content);
} else {
  console.log("\n⚠️  data/prospects.json not found — skipping.");
}

// ── Users ───────────────────────────────────────────────────────
const usersPath = "./data/users.json";
if (existsSync(usersPath)) {
  console.log("\nUploading users.json...");
  const content = readFileSync(usersPath, "utf-8");
  await upload("users.json", content);
} else {
  console.log("\n⚠️  data/users.json not found — skipping.");
}

console.log("\n✅  Sync complete. Reload getyoursitelive.com/admin to verify.\n");
