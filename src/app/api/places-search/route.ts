import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export const runtime = "edge";

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
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { zip?: string; query?: string; pageToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const zip = body.zip?.trim();
  const query = body.query?.trim() || "auto repair";
  const pageToken = body.pageToken?.trim();

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "A valid 5-digit zip code is required." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
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

    return {
      id: (p.id as string) ?? "",
      name: displayName?.text ?? "",
      phone: (p.nationalPhoneNumber as string) ?? (p.internationalPhoneNumber as string) ?? "",
      address: (p.formattedAddress as string) ?? "",
      category: primaryType?.text ?? "Auto Repair",
      rating: (p.rating as number) ?? null,
      reviewCount: (p.userRatingCount as number) ?? 0,
      website: (p.websiteUri as string) ?? "",
      googleMapsUrl: (p.googleMapsUri as string) ?? "",
    };
  });

  return NextResponse.json({
    results,
    nextPageToken: data.nextPageToken ?? null,
  });
}
