import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { normalizePhone } from "@/lib/prospects";

interface PlaceResult {
  id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  rating: number | null;
  reviewCount: number;
  website: string;
  googleMapsUrl: string;
  lat: number | null;
  lng: number | null;
}

interface CachedRow {
  google_place_id: string;
  name: string;
  phone: string;
  address: string;
  category: string;
  rating: number | null;
  review_count: number;
  website: string;
  google_maps_url: string;
  lat: number | null;
  lng: number | null;
}

export async function POST(req: NextRequest) {
  try {
    return await handleSearch(req);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[places-search] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleSearch(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { zip?: string; query?: string; pageToken?: string; forceRefresh?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const zip = body.zip?.trim();
  const query = body.query?.trim() || "auto repair";
  const pageToken = body.pageToken?.trim();
  const forceRefresh = body.forceRefresh === true;

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "A valid 5-digit zip code is required." }, { status: 400 });
  }

  const db = await getD1();

  // Check cache first (unless force refresh or paginating)
  if (!forceRefresh && !pageToken) {
    const cached = await db
      .prepare("SELECT * FROM searched_zips WHERE zip = ? AND query = ?")
      .bind(zip, query)
      .first<{ zip: string; result_count: number; searched_at: string }>();

    if (cached) {
      // Return cached results from places_cache
      const { results: cachedResults } = await db
        .prepare("SELECT * FROM places_cache WHERE zip = ? AND query = ? ORDER BY review_count DESC")
        .bind(zip, query)
        .all<CachedRow>();

      const results: PlaceResult[] = cachedResults.map((r) => ({
        id: r.google_place_id,
        name: r.name,
        phone: r.phone ?? "",
        address: r.address ?? "",
        category: r.category ?? "Car repair and maintenance service",
        rating: r.rating,
        reviewCount: r.review_count ?? 0,
        website: r.website ?? "",
        googleMapsUrl: r.google_maps_url ?? "",
        lat: r.lat,
        lng: r.lng,
      }));

      return NextResponse.json({
        results,
        nextPageToken: null,
        cached: true,
        cachedAt: cached.searched_at,
      });
    }
  }

  // Call Google Places API — read from Cloudflare env bindings (Pages secrets
  // aren't available via process.env at runtime in OpenNext Workers)
  let apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const { env } = await getCloudflareContext({ async: true });
      apiKey = (env as unknown as Record<string, string>).GOOGLE_PLACES_API_KEY;
    } catch { /* fallthrough */ }
  }
  if (!apiKey) {
    return NextResponse.json({ error: "Google Places API key not configured." }, { status: 500 });
  }

  const textQuery = `${query} in ${zip}`;

  const requestBody: Record<string, unknown> = {
    textQuery,
    languageCode: "en",
    maxResultCount: 20,
  };

  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.googleMapsUri",
    "places.rating",
    "places.userRatingCount",
    "places.primaryTypeDisplayName",
    "places.types",
    "places.location",
  ].join(",");

  const res = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    console.error("[places-search] Google API error:", res.status, errText);
    return NextResponse.json(
      { error: `Google Places API error (${res.status})` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { places?: Record<string, unknown>[]; nextPageToken?: string };
  const places = (data.places ?? []) as Record<string, unknown>[];

  const results: PlaceResult[] = places.map((p) => {
    const displayName = p.displayName as { text?: string } | undefined;
    const primaryType = p.primaryTypeDisplayName as { text?: string } | undefined;
    const location = p.location as { latitude?: number; longitude?: number } | undefined;

    return {
      id: (p.id as string) ?? "",
      name: displayName?.text ?? "",
      phone: (p.nationalPhoneNumber as string) ?? (p.internationalPhoneNumber as string) ?? "",
      address: (p.formattedAddress as string) ?? "",
      category: primaryType?.text ?? "Car repair and maintenance service",
      rating: (p.rating as number) ?? null,
      reviewCount: (p.userRatingCount as number) ?? 0,
      website: (p.websiteUri as string) ?? "",
      googleMapsUrl: (p.googleMapsUri as string) ?? "",
      lat: location?.latitude ?? null,
      lng: location?.longitude ?? null,
    };
  });

  // Cache results in D1
  const now = new Date().toISOString();
  for (const r of results) {
    const phoneNorm = r.phone ? normalizePhone(r.phone) : "";
    await db
      .prepare(
        `INSERT OR REPLACE INTO places_cache
         (google_place_id, name, phone, phone_normalized, address, category, rating, review_count, website, google_maps_url, lat, lng, zip, query, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        r.id, r.name, r.phone, phoneNorm, r.address, r.category,
        r.rating, r.reviewCount, r.website, r.googleMapsUrl,
        r.lat, r.lng,
        zip, query, now,
      )
      .run();
  }

  // Mark this zip+query as searched (only on first page, not pagination)
  if (!pageToken) {
    await db
      .prepare(
        `INSERT OR REPLACE INTO searched_zips (zip, query, result_count, searched_at)
         VALUES (?, ?, ?, ?)`,
      )
      .bind(zip, query, results.length, now)
      .run();
  }

  return NextResponse.json({
    results,
    nextPageToken: data.nextPageToken ?? null,
    cached: false,
  });
}
