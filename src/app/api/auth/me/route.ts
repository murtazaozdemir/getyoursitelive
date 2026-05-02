import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";


export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    console.log("[auth/me] GET unauthenticated");
    return NextResponse.json({ user: null }, { status: 401 });
  }
  console.log(`[auth/me] GET authenticated user=${user.email} role=${user.role}`);
  return NextResponse.json({ user });
}
