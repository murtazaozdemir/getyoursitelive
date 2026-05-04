import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

// Cities that zippopotam.us doesn't recognize (renamed, unincorporated, etc.)
const ZIP_OVERRIDES: Record<string, string[]> = {
  "nj:woodland park": ["07424"],
  "nj:west paterson": ["07424"],
  "nj:north haledon": ["07508"],
  "nj:upper montclair": ["07043"],
  "nj:colonia": ["07067"],
  "nj:ocean grove": ["07756"],
  "nj:succasunna": ["07876"],
  "nj:mullica hill": ["08062"],
  "co:woodland park": ["80863", "80866"],
  "co:highlands ranch": ["80126", "80129", "80130"],
  "co:lone tree": ["80124"],
  "va:dale city": ["22193"],
  "va:ashburn": ["20147", "20148"],
  "va:centreville": ["20120", "20121"],
  "va:glen allen": ["23058", "23059", "23060"],
  "va:midlothian": ["23112", "23113", "23114"],
};

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

  // Check hardcoded overrides first
  const overrideKey = `${state}:${city}`;
  if (ZIP_OVERRIDES[overrideKey]) {
    const zips = ZIP_OVERRIDES[overrideKey];
    console.log(`[places/city-zips] override hit for ${overrideKey}: ${zips.join(",")}`);
    return NextResponse.json({ zips });
  }

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
