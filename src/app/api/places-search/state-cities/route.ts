import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageBusinesses(user)) {
      return NextResponse.json({ error: "Unauthorized", cities: [] }, { status: 401 });
    }

    const state = req.nextUrl.searchParams.get("state")?.trim().toUpperCase();
    if (!state || state.length !== 2) {
      return NextResponse.json({ error: "State is required.", cities: [] }, { status: 400 });
    }

    const db = await getD1();

    const cached = await db
      .prepare("SELECT cities FROM state_cities_cache WHERE state = ?")
      .bind(state)
      .first<{ cities: string }>();

    if (cached) {
      return NextResponse.json({ cities: JSON.parse(cached.cities) });
    }

    return NextResponse.json({ cities: [] });
  } catch (err) {
    console.error("[state-cities] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", cities: [] },
      { status: 500 },
    );
  }
}
