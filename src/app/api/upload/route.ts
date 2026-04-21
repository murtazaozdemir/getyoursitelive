import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";

export const runtime = "nodejs";

/** Max upload size in bytes (5MB). */
const MAX_BYTES = 5 * 1024 * 1024;

/** Allowed image mime types. */
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

/**
 * POST /api/upload
 *
 * Accepts a multipart form body with:
 *   - file: the image file to upload
 *   - slug: the business slug the upload belongs to (used for folder + auth)
 *
 * Saves to /public/uploads/{slug}/{timestamp}-{sanitized-filename} and
 * returns the public URL.
 *
 * Authentication: must be an admin or the owner of the given slug.
 * Size limit: 5MB. Type allow-list: png, jpg, webp, svg, gif.
 *
 * NOTE: on Cloudflare Pages the filesystem is read-only at runtime.
 * When we migrate to R2 in production this route's body swaps to an R2
 * putObject call; the interface (POST file, receive URL) stays the same.
 */
export async function POST(req: NextRequest) {
  // Auth
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

  // Validate
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

  // Sanitize filename: keep the extension, lowercase alphanumeric + dashes
  const origName = file.name || "upload";
  const ext = path.extname(origName).toLowerCase() || ".bin";
  const base = path
    .basename(origName, path.extname(origName))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const filename = `${Date.now()}-${base || "file"}${ext}`;

  // Write to public/uploads/{slug}/
  const dir = path.join(process.cwd(), "public", "uploads", slug);
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, filename), buffer);

  const url = `/uploads/${slug}/${filename}`;
  return NextResponse.json({ url });
}
