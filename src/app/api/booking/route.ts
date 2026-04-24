import { NextRequest, NextResponse } from "next/server";
import { getD1 } from "@/lib/db-d1";


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

  const id = `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const submittedAt = new Date().toISOString();

  const db = await getD1();
  await db
    .prepare(
      `INSERT INTO bookings (id, slug, name, email, phone, service, date, message, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    )
    .run();

  console.log(`[booking] ${name} → ${service} on ${date} (${slug})`);

  return NextResponse.json({ ok: true });
}
