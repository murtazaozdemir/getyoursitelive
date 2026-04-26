import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/reset-tokens";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";


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
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = body as { email?: unknown };
  if (typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ ok: true });
  }

  const user = await findUserByEmail(email);

  // Rate-limit every call (hit or miss) — don't reward knowing valid emails
  await recordFailedAttempt(`reset-${ip}`);

  if (!user) {
    // Same response whether email exists or not — don't leak account existence
    return NextResponse.json({ ok: true });
  }

  const token = await createResetToken(user.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";
  const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

  const result = await sendPasswordResetEmail({ to: user.email, resetUrl });
  if (!result.ok) {
    console.error(`[forgot-password] failed to send reset email to ${user.email}: ${result.error}`);
  }

  return NextResponse.json({ ok: true });
}
