import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getD1();
  const log: string[] = [];
  let updated = 0;
  let skipped = 0;

  // 1. Add city and zip columns
  try {
    await db.prepare("ALTER TABLE prospects ADD COLUMN city TEXT").run();
    log.push("Added city column");
  } catch { log.push("city column already exists"); }
  try {
    await db.prepare("ALTER TABLE prospects ADD COLUMN zip TEXT").run();
    log.push("Added zip column");
  } catch { log.push("zip column already exists"); }

  // 2. Backfill from address — parse "Street, City, ST ZIP"
  const { results } = await db
    .prepare("SELECT slug, address, state FROM prospects WHERE city IS NULL AND address != ''")
    .all<{ slug: string; address: string; state: string | null }>();

  for (const row of results) {
    const parts = row.address.split(",").map((s: string) => s.trim());
    let city = "";
    let zip = "";

    if (parts.length >= 2) {
      city = parts[1];
    }
    if (parts.length >= 3) {
      const lastPart = parts[parts.length - 1];
      const zipMatch = lastPart.match(/\b(\d{5})\b/);
      if (zipMatch) zip = zipMatch[1];
    }

    if (city || zip) {
      await db
        .prepare("UPDATE prospects SET city = ?, zip = ?, updated_at = ? WHERE slug = ?")
        .bind(city || null, zip || null, new Date().toISOString(), row.slug)
        .run();
      updated++;
    } else {
      log.push(`${row.slug}: could not parse city/zip from "${row.address}"`);
      skipped++;
    }
  }

  // 3. Add index
  try {
    await db.prepare("CREATE INDEX IF NOT EXISTS idx_prospects_city ON prospects(city)").run();
    log.push("Created idx_prospects_city");
  } catch { log.push("idx_prospects_city already exists"); }

  log.push(`Backfilled ${updated} rows, skipped ${skipped}`);
  return NextResponse.json({ ok: true, updated, skipped, log });
}
