import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/reset-tokens";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const limitCheck = await checkRateLimit(`reset-${ip}`);
  if (!limitCheck.allowed) {
    return NextResponse.json({ token: null });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body as { email?: unknown };
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ token: null });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    await recordFailedAttempt(`reset-${ip}`);
    // Return same shape regardless — don't leak whether the email exists
    return NextResponse.json({ token: null });
  }

  const token = await createResetToken(user.id);
  return NextResponse.json({ token });
}
