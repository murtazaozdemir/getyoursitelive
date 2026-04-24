import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state")?.trim().toUpperCase() ?? "";

  // Auth check
  let authorized = false;
  try {
    const user = await getCurrentUser();
    authorized = !!user && canManageBusinesses(user);
  } catch {
    return NextResponse.json({ cities: [], error: "auth_failed" });
  }

  if (!authorized) {
    return NextResponse.json({ cities: [], error: "unauthorized" });
  }

  if (!state || state.length !== 2) {
    return NextResponse.json({ cities: [], error: "invalid_state" });
  }

  // Try D1 lookup
  try {
    const { getD1 } = await import("@/lib/db-d1");
    const db = await getD1();

    const cached = await db
      .prepare("SELECT cities FROM state_cities_cache WHERE state = ?")
      .bind(state)
      .first<{ cities: string }>();

    if (cached) {
      return NextResponse.json({ cities: JSON.parse(cached.cities) });
    }

    return NextResponse.json({ cities: [], error: "not_found" });
  } catch (err) {
    return NextResponse.json({
      cities: [],
      error: "db_error",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
