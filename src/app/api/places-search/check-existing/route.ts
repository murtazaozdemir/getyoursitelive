import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { findExistingPlaceIds } from "@/lib/prospects";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    console.log("[places/check-existing] unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { placeIds?: string[] };
  try {
    body = await req.json();
  } catch {
    console.log("[places/check-existing] invalid JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const placeIds = body.placeIds ?? [];
  if (placeIds.length === 0) {
    console.log("[places/check-existing] empty placeIds list");
    return NextResponse.json({ existing: [] });
  }

  const existing = await findExistingPlaceIds(placeIds);
  console.log(`[places/check-existing] checked=${placeIds.length} existing=${existing.size}`);
  return NextResponse.json({ existing: [...existing] });
}
