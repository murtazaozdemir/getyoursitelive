import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { createSessionToken, setSessionCookie, REMEMBER_TTL_SECONDS, SESSION_TTL_SECONDS } from "@/lib/session";

export const runtime = "nodejs"; // bcryptjs works on edge too, but node is simpler for dev

export async function POST(req: NextRequest) {
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
    // Generic message — don't reveal whether the email exists
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const remember = rememberMe === true;
  // JWT exp: 30 days if remembered, otherwise 24 hours
  const jwtTtl = remember ? REMEMBER_TTL_SECONDS : SESSION_TTL_SECONDS;
  // Cookie maxAge: 30 days if remembered, session cookie (no maxAge) otherwise
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
