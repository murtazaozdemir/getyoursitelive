import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import { getTemplateForCategory } from "@/lib/templates/registry";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/fix-booking
 *
 * Regenerates ALL existing preview sites from the current template.
 * For each business:
 *   1. Read slug, name, category, and stored content (for phone + address)
 *   2. Look up the vertical template for that category
 *   3. Call buildProspectBusiness() to get a fresh template output
 *   4. Overwrite the stored content with the fresh template
 *
 * This ensures every preview site matches the current template exactly.
 * Only businessInfo.phone and businessInfo.address are preserved from the
 * old stored data (everything else comes from the template).
 *
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

    // Fetch all businesses — only need slug, name, category, content (for phone/address)
    const { results } = await db
      .prepare("SELECT slug, name, category, content FROM businesses")
      .all<{ slug: string; name: string; category: string; content: string }>();

    console.log("[fix-booking] Found", results.length, "businesses");

    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of results) {
      try {
        // Extract phone and address from the old stored content
        let phone = "";
        let address = "";
        try {
          const old = JSON.parse(row.content);
          phone = old.businessInfo?.phone ?? "";
          address = old.businessInfo?.address ?? "";
        } catch {
          // If content is corrupt, skip — we can't recover phone/address
          errors.push(`${row.slug}: corrupt content, skipped`);
          skipped++;
          continue;
        }

        // Look up the template for this category
        const template = getTemplateForCategory(row.category);

        // Regenerate the full business from the template
        const fresh = template.buildProspectBusiness(
          row.slug,
          row.name,
          phone,
          address,
        );

        // Write the fresh content back to D1
        await db
          .prepare("UPDATE businesses SET content = ?, updated_at = ? WHERE slug = ?")
          .bind(JSON.stringify(fresh), new Date().toISOString(), row.slug)
          .run();

        updated++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${row.slug}: ${msg}`);
        skipped++;
      }
    }

    console.log("[fix-booking] Done:", updated, "updated,", skipped, "skipped");
    return NextResponse.json({
      updated,
      skipped,
      total: results.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[fix-booking] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
