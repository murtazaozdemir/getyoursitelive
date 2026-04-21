import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/users";
import { createSessionToken, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs"; // bcryptjs works on edge too, but node is simpler for dev

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, password } = body as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    // Generic message — don't reveal whether the email exists
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken(user);
  await setSessionCookie(token);

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
