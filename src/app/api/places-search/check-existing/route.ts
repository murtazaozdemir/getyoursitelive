import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { findExistingPlaceIds } from "@/lib/prospects";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { placeIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const placeIds = body.placeIds ?? [];
  if (placeIds.length === 0) {
    return NextResponse.json({ existing: [] });
  }

  const existing = await findExistingPlaceIds(placeIds);
  return NextResponse.json({ existing: [...existing] });
}
