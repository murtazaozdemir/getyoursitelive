import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { createSessionToken, setSessionCookie, REMEMBER_TTL_SECONDS, SESSION_TTL_SECONDS } from "@/lib/session";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit-log";


function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  let email = "(unknown)";
  let ip = "unknown";

  try {
    ip = getClientIp(req);

    // Rate limit — wrap in try/catch so a rate-limit DB issue doesn't block login
    try {
      const limitCheck = await checkRateLimit(ip);
      if (!limitCheck.allowed) {
        const until = limitCheck.lockedUntil
          ? new Date(limitCheck.lockedUntil).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
          : "a few minutes";
        await logAudit({
          userEmail: email,
          userName: "unknown",
          action: "login_failed",
          detail: `Rate limited from ${ip}. Locked until ${until}.`,
        });
        return NextResponse.json(
          { error: `Too many failed attempts. Try again after ${until}.` },
          { status: 429 },
        );
      }
    } catch (rateLimitErr) {
      console.error("[login] Rate limit check failed, allowing login attempt:", rateLimitErr);
      // Don't block login if rate limit check itself crashes
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = body as {
      email?: unknown;
      password?: unknown;
      rememberMe?: unknown;
    };
    email = typeof parsed.email === "string" ? parsed.email.trim() : "(unknown)";
    const password = parsed.password;

    if (typeof parsed.email !== "string" || typeof password !== "string" || !parsed.email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await verifyCredentials(parsed.email, password);
    if (!user) {
      // Log the failed attempt FIRST, before rate-limit recording
      await logAudit({
        userEmail: email,
        userName: "unknown",
        action: "login_failed",
        detail: `Failed login attempt from ${ip}.`,
      });

      let remaining = 4;
      try {
        const result = await recordFailedAttempt(ip);
        remaining = result.remaining ?? 0;
      } catch {
        console.error("[login] Failed to record rate limit attempt");
      }

      const hint = remaining === 0
        ? "Account temporarily locked."
        : `${remaining} attempt${remaining === 1 ? "" : "s"} remaining before lockout.`;

      return NextResponse.json(
        { error: `Invalid email or password. ${hint}` },
        { status: 401 },
      );
    }

    // Success
    try { await clearRateLimit(ip); } catch { /* non-critical */ }

    await logAudit({
      userEmail: user.email,
      userName: user.name,
      action: "login",
      detail: `Signed in from ${ip}`,
    });

    const remember = parsed.rememberMe === true;
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
  } catch (err) {
    console.error("[login] Unexpected error:", err);

    // Try to log even when we crash
    try {
      await logAudit({
        userEmail: email,
        userName: "unknown",
        action: "login_failed",
        detail: `Login crashed for ${email} from ${ip}: ${err instanceof Error ? err.message : String(err)}`,
      });
    } catch { /* last resort — can't even log */ }

    return NextResponse.json(
      { error: "Login service error. Please try again." },
      { status: 500 },
    );
  }
}
