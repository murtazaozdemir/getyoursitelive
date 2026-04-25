import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db-d1";

/** Max bookings per IP within the rate-limit window */
const RATE_LIMIT_MAX = 5;
/** Rate-limit window in minutes */
const RATE_LIMIT_WINDOW_MIN = 15;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { slug, name, email, phone, service, date, message } = body as Record<string, string>;

  if (!slug || !name || !email || !phone || !service || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate field lengths
  if (name.length > 200 || email.length > 254 || phone.length > 30 || service.length > 200) {
    return NextResponse.json({ error: "Field value too long" }, { status: 400 });
  }
  if (typeof message === "string" && message.length > 2000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const db = await getD1();

  // Rate limit: max N bookings per IP per window (D1-based, edge-safe)
  const ip = req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();
  const recentCount = await db
    .prepare("SELECT COUNT(*) AS cnt FROM bookings WHERE ip = ? AND submitted_at > ?")
    .bind(ip, windowStart)
    .first<{ cnt: number }>();
  if (recentCount && recentCount.cnt >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many booking requests. Please try again later." },
      { status: 429 },
    );
  }

  // Validate slug exists
  const bizExists = await db
    .prepare("SELECT 1 FROM businesses WHERE slug = ?")
    .bind(slug.trim())
    .first();
  if (!bizExists) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const submittedAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO bookings (id, slug, name, email, phone, service, date, message, submitted_at, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      slug.trim(),
      name.trim(),
      email.trim().toLowerCase(),
      phone.trim(),
      service.trim(),
      date.trim(),
      (message ?? "").trim(),
      submittedAt,
      ip,
    )
    .run();

  console.log(`[booking] ${name} → ${service} on ${date} (${slug})`);

  return NextResponse.json({ ok: true });
}
