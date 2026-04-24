import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { createSessionToken, setSessionCookie, REMEMBER_TTL_SECONDS, SESSION_TTL_SECONDS } from "@/lib/session";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";

export const runtime = "edge";

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Check rate limit before doing anything
  const limitCheck = await checkRateLimit(ip);
  if (!limitCheck.allowed) {
    const until = limitCheck.lockedUntil
      ? new Date(limitCheck.lockedUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
      : "a few minutes";
    return NextResponse.json(
      { error: `Too many failed attempts. Try again after ${until}.` },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password, rememberMe } = body as {
    email?: unknown;
    password?: unknown;
    rememberMe?: unknown;
  };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    const result = await recordFailedAttempt(ip);
    const remaining = result.remaining ?? 0;

    await logAudit({
      userEmail: email,
      userName: "unknown",
      action: "login_failed",
      detail: `Failed login attempt from ${ip}. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    });

    const hint = remaining === 0
      ? "Account temporarily locked."
      : `${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.`;

    return NextResponse.json(
      { error: `Invalid email or password. ${hint}` },
      { status: 401 },
    );
  }

  // Success — clear rate limit record and log
  await clearRateLimit(ip);
  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "login",
    detail: `Signed in from ${ip}`,
  });

  const remember = rememberMe === true;
  const jwtTtl = remember ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  const cookieTtl = remember ? REMEMBER_TTL_SECONDS : 0;

  const token = await createSessionToken(user, jwtTtl);
  await setSessionCookie(token, cookieTtl);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      ownedSlug: user.ownedSlug,
    },
  });
}
