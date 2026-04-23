/**
 * One-off: fix wrong hero image on dolunay-auto-repair in R2.
 * Run with: node scripts/fix-hero-image.mjs
 */

import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET = process.env.R2_BUCKET ?? "getyoursitelive";
const SLUG = "dolunay-auto-repair";
const KEY = `businesses/${SLUG}.json`;

// A clean auto-repair hero image from Pexels
const AUTO_REPAIR_IMAGE =
  "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400";

if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
  console.error("Missing R2 credentials. Ensure .env.local is loaded.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

// Load
console.log(`Fetching ${KEY} from R2...`);
const getRes = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
const raw = await streamToString(getRes.Body);
const biz = JSON.parse(raw);

const currentImage = biz.hero?.heroImage ?? "(none)";
console.log(`Current heroImage: ${currentImage}`);

// Patch
if (!biz.hero) biz.hero = {};
biz.hero.heroImage = AUTO_REPAIR_IMAGE;

// Save
const body = JSON.stringify(biz, null, 2);
await s3.send(
  new PutObjectCommand({
    Bucket: BUCKET,
    Key: KEY,
    Body: body,
    ContentType: "application/json",
  }),
);

console.log(`✓ Updated heroImage to: ${AUTO_REPAIR_IMAGE}`);
