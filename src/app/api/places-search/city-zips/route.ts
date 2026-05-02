import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    console.log("[places/city-zips] unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = req.nextUrl.searchParams.get("state")?.trim().toLowerCase();
  const city = req.nextUrl.searchParams.get("city")?.trim().toLowerCase();

  if (!state || !city) {
    console.log("[places/city-zips] missing state or city");
    return NextResponse.json({ error: "State and city required." }, { status: 400 });
  }

  console.log(`[places/city-zips] GET state=${state} city=${city}`);

  // Use free zippopotam.us API — no key needed
  const res = await fetch(
    `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}`,
  );

  if (!res.ok) {
    console.log(`[places/city-zips] zippopotam returned ${res.status} for state=${state} city=${city}`);
    return NextResponse.json({ zips: [] });
  }

  const data = (await res.json()) as {
    places?: Array<{ "post code": string; "place name": string }>;
  };

  const zips = (data.places ?? []).map((p) => p["post code"]).sort();
  console.log(`[places/city-zips] found ${zips.length} zips for state=${state} city=${city}`);

  return NextResponse.json({ zips });
}
