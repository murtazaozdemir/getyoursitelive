import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

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
  const extMatch = origName.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0].toLowerCase() : ".bin";
  const base = origName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const filename = `${Date.now()}-${base || "file"}${ext}`;
  const key = `uploads/${slug}/${filename}`;

  const buffer = await file.arrayBuffer();

  // Use the R2 binding via Cloudflare runtime
  const { env } = getRequestContext();
  const r2 = (env as { R2?: R2Bucket }).R2;

  if (r2) {
    await r2.put(key, buffer, { httpMetadata: { contentType: file.type } });
    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
    if (!publicUrl) {
      return NextResponse.json({ error: "R2_PUBLIC_URL is not configured" }, { status: 500 });
    }
    return NextResponse.json({ url: `${publicUrl}/${key}` });
  }

  // Local dev fallback: return a placeholder URL
  return NextResponse.json({ error: "R2 binding not available in this environment" }, { status: 500 });
}
