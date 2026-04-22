import { NextRequest, NextResponse } from "next/server";
import { getStorage } from "@/lib/storage";

export const runtime = "nodejs";

export interface BookingRecord {
  id: string;
  slug: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  message: string;
  submittedAt: string;
}

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

  const booking: BookingRecord = {
    id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    slug,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    service: service.trim(),
    date: date.trim(),
    message: (message ?? "").trim(),
    submittedAt: new Date().toISOString(),
  };

  const storage = await getStorage();
  const key = `bookings/${slug}/${booking.id}.json`;
  await storage.write(key, JSON.stringify(booking));

  console.log(`[booking] new booking from ${booking.name} for ${booking.service} on ${booking.date} (slug: ${slug})`);

  return NextResponse.json({ ok: true });
}
