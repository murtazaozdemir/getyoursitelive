import { NextResponse } from "next/server";
import { getD1 } from "@/lib/db-d1";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getD1();
    const log: string[] = [];

    try {
      await db.prepare("ALTER TABLE users ADD COLUMN wifi_ip TEXT").run();
      log.push("Added wifi_ip");
    } catch (e) {
      log.push("wifi_ip: " + String(e));
    }

    try {
      await db.prepare("ALTER TABLE users ADD COLUMN mobile_ip TEXT").run();
      log.push("Added mobile_ip");
    } catch (e) {
      log.push("mobile_ip: " + String(e));
    }

    return NextResponse.json({ ok: true, log });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
