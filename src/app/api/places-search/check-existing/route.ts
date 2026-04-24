import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { findExistingPhones } from "@/lib/prospects";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { phones?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const phones = body.phones ?? [];
  if (phones.length === 0) {
    return NextResponse.json({ existing: [] });
  }

  const existingSet = await findExistingPhones(phones);
  return NextResponse.json({ existing: [...existingSet] });
}
