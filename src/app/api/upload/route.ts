import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

// SVG intentionally excluded — it can contain inline <script> and would be
// served with Content-Type: image/svg+xml, enabling stored XSS when opened directly.
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const slug = form.get("slug");
  const file = form.get("file");

  if (typeof slug !== "string" || !slug.match(/^[a-z0-9-]+$/)) {
    return NextResponse.json({ error: "Missing or invalid slug" }, { status: 400 });
  }
  if (!canEditBusiness(user, slug)) {
    return NextResponse.json({ error: "Not authorized for this business" }, { status: 403 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 415 },
    );
  }

  // Sanitize filename
  const origName = file.name || "upload";
  const ext = path.extname(origName).toLowerCase() || ".bin";
  const base = path
    .basename(origName, path.extname(origName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const filename = `${Date.now()}-${base || "file"}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  // In production (Vercel Blob configured), upload to blob storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${slug}/${filename}`, buffer, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    return NextResponse.json({ url: blob.url });
  }

  // Local dev: write to public/uploads/
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${slug}/${filename}` });
}
