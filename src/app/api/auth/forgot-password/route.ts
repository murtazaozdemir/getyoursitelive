import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/reset-tokens";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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
    // Return same shape regardless — client shows generic message
    return NextResponse.json({ token: null });
  }

  const token = await createResetToken(user.id);
  return NextResponse.json({ token });
}
