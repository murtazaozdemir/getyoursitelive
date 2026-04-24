import { NextResponse } from "next/server";

export const runtime = "edge";

/**
 * This endpoint was used to seed R2 from local data files.
 * With D1, data is seeded directly via wrangler or the setup page.
 * Endpoint kept as a stub to avoid 404s from any cached requests.
 */
export async function POST() {
  return NextResponse.json(
    { error: "seed-storage is no longer needed — data lives in D1. Use the Setup page to seed D1 from JSON." },
    { status: 410 },
  );
}
