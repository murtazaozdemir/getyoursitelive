import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";


export async function POST() {
  console.log("[auth/logout] POST logout request");
  await clearSessionCookie();
  console.log("[auth/logout] session cookie cleared");
  return NextResponse.json({ ok: true });
}
