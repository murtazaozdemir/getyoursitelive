/**
 * Upload local data/ files to Vercel Blob.
 *
 * Usage — platform (uploads everything):
 *   BLOB_READ_WRITE_TOKEN=<token> node scripts/seed-blob.mjs
 *
 * Usage — single customer site (uploads only their business file):
 *   BLOB_READ_WRITE_TOKEN=<token> node scripts/seed-blob.mjs star-auto
 *
 * Get the token from: Vercel dashboard → Storage → your Blob store → .env.local
 */

import { put } from "@vercel/blob";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = new URL("../data", import.meta.url).pathname;
const slugFilter = process.argv[2] ?? null;

async function listFiles(dir, base = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(join(dir, entry.name), rel)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(rel);
    }
  }
  return files;
}

function shouldInclude(rel) {
  if (!slugFilter) return true;
  // Always include the business file for this slug and users.json
  return rel === `businesses/${slugFilter}.json` || rel === "users.json";
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
    process.exit(1);
  }

  const allFiles = await listFiles(DATA_DIR);
  const files = allFiles.filter(shouldInclude);

  if (slugFilter) {
    console.log(`Uploading customer site data for: ${slugFilter}`);
  } else {
    console.log(`Uploading all platform data (${files.length} files)...`);
  }

  for (const rel of files) {
    const content = await readFile(join(DATA_DIR, rel), "utf-8");
    await put(rel, content, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
    });
    console.log(`  ✓ ${rel}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
