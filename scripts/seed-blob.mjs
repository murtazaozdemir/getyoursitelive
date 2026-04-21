/**
 * One-time script to upload all local data/ files to Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=<your token> node scripts/seed-blob.mjs
 *
 * Get the token from: Vercel dashboard → Storage → your Blob store → .env.local
 */

import { put } from "@vercel/blob";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = new URL("../data", import.meta.url).pathname;

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

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
    process.exit(1);
  }

  const files = await listFiles(DATA_DIR);
  console.log(`Uploading ${files.length} files to Vercel Blob...`);

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
