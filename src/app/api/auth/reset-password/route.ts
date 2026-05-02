import { NextRequest, NextResponse } from "next/server";
import { updateUserPassword } from "@/lib/users";
import { consumeResetToken } from "@/lib/reset-tokens";


export async function POST(req: NextRequest) {
  console.log("[auth/reset-password] POST reset password attempt");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    console.log("[auth/reset-password] invalid JSON body");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, password } = body as { token?: unknown; password?: unknown };

  if (typeof token !== "string" || !token) {
    console.log("[auth/reset-password] missing token");
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    console.log("[auth/reset-password] password too short or missing");
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const tokenPrefix = token.slice(0, 8);
  const userId = await consumeResetToken(token);
  if (!userId) {
    console.log(`[auth/reset-password] invalid/expired token prefix=${tokenPrefix}...`);
    return NextResponse.json(
      { error: "Reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  await updateUserPassword(userId, password);
  console.log(`[auth/reset-password] password reset success userId=${userId} tokenPrefix=${tokenPrefix}...`);
  return NextResponse.json({ ok: true });
}
