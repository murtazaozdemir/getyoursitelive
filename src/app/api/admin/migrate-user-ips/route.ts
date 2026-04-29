import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1();
  const log: string[] = [];

  try {
    await db.prepare("ALTER TABLE users ADD COLUMN wifi_ip TEXT").run();
    log.push("Added wifi_ip");
  } catch {
    log.push("wifi_ip already exists");
  }

  try {
    await db.prepare("ALTER TABLE users ADD COLUMN mobile_ip TEXT").run();
    log.push("Added mobile_ip");
  } catch {
    log.push("mobile_ip already exists");
  }

  return NextResponse.json({ ok: true, log });
}
