import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getEnvelopeMargins } from "@/lib/platform-settings";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envelope = req.nextUrl.searchParams.get("type") as "envelope1" | "envelope2" | null;
  if (!envelope || !["envelope1", "envelope2"].includes(envelope)) {
    return NextResponse.json({ error: "type must be envelope1 or envelope2" }, { status: 400 });
  }

  const margins = await getEnvelopeMargins(envelope);
  return NextResponse.json(margins);
}
