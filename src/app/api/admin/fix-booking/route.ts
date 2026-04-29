import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/fix-booking
 * Sets showBooking:false on all existing businesses.
 * Admin-only. Idempotent.
 */
export async function GET() {
  try {
    console.log("[fix-booking] Route entered");

    const user = await getCurrentUser();
    console.log("[fix-booking] User:", user?.email ?? "null");
    if (!user || !canManageBusinesses(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getD1();
    console.log("[fix-booking] Got D1");

    // Count how many have showBooking:true
    const { results } = await db
      .prepare(
        `SELECT slug FROM businesses WHERE content LIKE '%"showBooking":true%' OR content LIKE '%"showBooking": true%'`
      )
      .all<{ slug: string }>();

    console.log("[fix-booking] Found", results.length, "businesses with showBooking:true");

    if (results.length === 0) {
      return NextResponse.json({ message: "No businesses need updating", updated: 0 });
    }

    // Update in batches of 10 using direct SQL string replacement
    let updated = 0;
    const slugs: string[] = [];

    for (const row of results) {
      try {
        // Use SQL REPLACE to do the string swap directly in the database
        await db
          .prepare(
            `UPDATE businesses SET content = REPLACE(content, '"showBooking":true', '"showBooking":false') WHERE slug = ?`
          )
          .bind(row.slug)
          .run();

        // Also handle the spaced variant
        await db
          .prepare(
            `UPDATE businesses SET content = REPLACE(content, '"showBooking": true', '"showBooking":false') WHERE slug = ?`
          )
          .bind(row.slug)
          .run();

        updated++;
        slugs.push(row.slug);
      } catch (err) {
        console.error("[fix-booking] Failed for", row.slug, err);
      }
    }

    console.log("[fix-booking] Done:", updated, "updated");
    return NextResponse.json({ updated, total: results.length, slugs });
  } catch (err) {
    console.error("[fix-booking] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
