import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { findExistingProspects } from "@/lib/prospects";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phones?: string[]; placeIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phones = body.phones ?? [];
  const placeIds = body.placeIds ?? [];
  if (phones.length === 0 && placeIds.length === 0) {
    return NextResponse.json({ existingPhones: [], existingPlaceIds: [] });
  }

  const existing = await findExistingProspects(phones, placeIds);
  return NextResponse.json({
    existingPhones: [...existing.phones],
    existingPlaceIds: [...existing.placeIds],
  });
}
