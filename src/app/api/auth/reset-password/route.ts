import { NextRequest, NextResponse } from "next/server";
import { updateUserPassword } from "@/lib/users";
import { consumeResetToken } from "@/lib/reset-tokens";


export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, password } = body as { token?: unknown; password?: unknown };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json(
      { error: "Reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  await updateUserPassword(userId, password);
  return NextResponse.json({ ok: true });
}
