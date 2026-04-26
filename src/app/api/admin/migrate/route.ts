import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const runtime = "edge";

/**
 * POST /api/admin/migrate
 * Body: { migration: string }
 *
 * Runs a named migration against live D1 data.
 * Each migration reads the current state, applies a transform, writes back.
 * Safe to run multiple times — migrations are idempotent.
 *
 * Admin-only.
 */

const MIGRATIONS: Record<string, () => Promise<{ updated: number; skipped: number; log: string[] }>> = {

  "test-ping": async () => {
    return { updated: 0, skipped: 0, log: ["Migration system working — commit 08150c3"] };
  },

  "add-google-fields-to-prospects": async () => {
    const db = await getD1();
    const cols = [
      "google_place_id TEXT",
      "google_rating REAL",
      "google_review_count INTEGER",
      "google_category TEXT",
      "google_maps_url TEXT",
    ];
    let updated = 0;
    const log: string[] = [];
    for (const col of cols) {
      const name = col.split(" ")[0];
      try {
        await db.prepare(`ALTER TABLE prospects ADD COLUMN ${col}`).run();
        log.push(`Added column ${name}`);
        updated++;
      } catch {
        log.push(`Column ${name} already exists, skipped`);
      }
    }
    return { updated, skipped: cols.length - updated, log };
  },

  "add-website-to-prospects": async () => {
    const db = await getD1();
    const log: string[] = [];
    try {
      await db.prepare("ALTER TABLE prospects ADD COLUMN website TEXT").run();
      log.push("Added column website");
      return { updated: 1, skipped: 0, log };
    } catch {
      log.push("Column website already exists, skipped");
      return { updated: 0, skipped: 1, log };
    }
  },

  "add-state-column": async () => {
    const db = await getD1();
    const log: string[] = [];

    // 1. Add the column
    try {
      await db.prepare("ALTER TABLE prospects ADD COLUMN state TEXT").run();
      log.push("Added column state");
    } catch {
      log.push("Column state already exists, skipped");
    }

    // 2. Backfill from address — parse "City, ST ZIP" or "City, ST"
    const US_STATES = new Set([
      "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
      "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
      "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
      "VA","WA","WV","WI","WY","DC",
    ]);

    const { results } = await db
      .prepare("SELECT slug, address FROM prospects WHERE state IS NULL AND address != ''")
      .all<{ slug: string; address: string }>();

    let updated = 0;
    let skipped = 0;

    for (const row of results) {
      // Try to match ", ST ZIP" or ", ST" at end of address
      const match = row.address.match(/,\s*([A-Z]{2})\s*\d{0,5}\s*$/);
      if (match && US_STATES.has(match[1])) {
        await db
          .prepare("UPDATE prospects SET state = ?, updated_at = ? WHERE slug = ?")
          .bind(match[1], new Date().toISOString(), row.slug)
          .run();
        log.push(`${row.slug}: state = ${match[1]}`);
        updated++;
      } else {
        log.push(`${row.slug}: could not parse state from "${row.address}"`);
        skipped++;
      }
    }

    return { updated, skipped, log };
  },

  "add-lat-lng": async () => {
    const db = await getD1();
    const log: string[] = [];

    // Add lat/lng columns to prospects (if not already present)
    try {
      await db.prepare("ALTER TABLE prospects ADD COLUMN lat REAL").run();
      log.push("Added lat column to prospects");
    } catch { log.push("lat column already exists"); }
    try {
      await db.prepare("ALTER TABLE prospects ADD COLUMN lng REAL").run();
      log.push("Added lng column to prospects");
    } catch { log.push("lng column already exists"); }

    // Add lat/lng columns to places_cache (if not already present)
    try {
      await db.prepare("ALTER TABLE places_cache ADD COLUMN lat REAL").run();
      log.push("Added lat column to places_cache");
    } catch { log.push("lat column already exists in places_cache"); }
    try {
      await db.prepare("ALTER TABLE places_cache ADD COLUMN lng REAL").run();
      log.push("Added lng column to places_cache");
    } catch { log.push("lng column already exists in places_cache"); }

    return { updated: 0, skipped: 0, log };
  },

  "backfill-lat-lng": async () => {
    const db = await getD1();
    const log: string[] = [];
    let updated = 0;
    let skipped = 0;

    // For each prospect without lat/lng, try to find coordinates from places_cache
    const { results: prospects } = await db
      .prepare("SELECT slug, phone, address FROM prospects WHERE lat IS NULL")
      .all<{ slug: string; phone: string; address: string }>();

    for (const p of prospects) {
      // Try to match by address in places_cache
      const cached = await db
        .prepare("SELECT lat, lng FROM places_cache WHERE lat IS NOT NULL AND lng IS NOT NULL AND address = ? LIMIT 1")
        .bind(p.address)
        .first<{ lat: number; lng: number }>();

      if (cached) {
        await db
          .prepare("UPDATE prospects SET lat = ?, lng = ? WHERE slug = ?")
          .bind(cached.lat, cached.lng, p.slug)
          .run();
        updated++;
      } else {
        skipped++;
      }
    }

    log.push(`Backfilled ${updated} prospects with lat/lng from places_cache, ${skipped} had no match`);
    return { updated, skipped, log };
  },

  "fetch-lat-lng": async () => {
    const db = await getD1();
    const log: string[] = [];
    let updated = 0;
    let skipped = 0;

    // Get Google Places API key
    let apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        const { env } = await getCloudflareContext({ async: true });
        apiKey = (env as unknown as Record<string, string>).GOOGLE_PLACES_API_KEY;
      } catch { /* fallthrough */ }
    }
    if (!apiKey) {
      return { updated: 0, skipped: 0, log: ["ERROR: No Google Places API key configured"] };
    }

    // Get all prospects without lat/lng that have a google_place_id
    const { results: prospects } = await db
      .prepare("SELECT slug, google_place_id FROM prospects WHERE lat IS NULL AND google_place_id IS NOT NULL AND google_place_id != ''")
      .all<{ slug: string; google_place_id: string }>();

    log.push(`Found ${prospects.length} prospects without lat/lng that have a Place ID`);

    // Batch in groups of 10 to avoid rate limits
    for (let i = 0; i < prospects.length; i += 10) {
      const batch = prospects.slice(i, i + 10);

      for (const p of batch) {
        try {
          const res = await fetch(
            `https://places.googleapis.com/v1/places/${p.google_place_id}`,
            {
              headers: {
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "location",
              },
            },
          );

          if (!res.ok) {
            log.push(`${p.slug}: API error ${res.status}`);
            skipped++;
            continue;
          }

          const data = (await res.json()) as { location?: { latitude?: number; longitude?: number } };
          const lat = data.location?.latitude;
          const lng = data.location?.longitude;

          if (lat != null && lng != null) {
            await db
              .prepare("UPDATE prospects SET lat = ?, lng = ? WHERE slug = ?")
              .bind(lat, lng, p.slug)
              .run();
            updated++;
          } else {
            log.push(`${p.slug}: no location in response`);
            skipped++;
          }
        } catch (err) {
          log.push(`${p.slug}: ${String(err)}`);
          skipped++;
        }
      }
    }

    log.push(`Done: ${updated} updated, ${skipped} skipped`);
    return { updated, skipped, log };
  },

  "add-google-extended-fields": async () => {
    const db = await getD1();
    const log: string[] = [];
    let updated = 0;

    // Columns to add to BOTH places_cache and prospects
    const sharedCols = [
      "business_status TEXT",
      "price_level TEXT",
      "editorial_summary TEXT",
      "opening_hours TEXT",
      "reviews TEXT",
      "photos TEXT",
      "address_components TEXT",
    ];

    // places_cache gets short_address; prospects get google_-prefixed versions + google_short_address
    for (const col of sharedCols) {
      const name = col.split(" ")[0];
      for (const table of ["places_cache", "prospects"]) {
        const colName = table === "prospects" ? `google_${name}` : name;
        try {
          await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${colName} ${col.split(" ").slice(1).join(" ")}`).run();
          log.push(`${table}: added ${colName}`);
          updated++;
        } catch {
          log.push(`${table}: ${colName} already exists`);
        }
      }
    }

    // short_address for places_cache, google_short_address for prospects
    try {
      await db.prepare("ALTER TABLE places_cache ADD COLUMN short_address TEXT").run();
      log.push("places_cache: added short_address");
      updated++;
    } catch { log.push("places_cache: short_address already exists"); }

    try {
      await db.prepare("ALTER TABLE prospects ADD COLUMN google_short_address TEXT").run();
      log.push("prospects: added google_short_address");
      updated++;
    } catch { log.push("prospects: google_short_address already exists"); }

    return { updated, skipped: 0, log };
  },

  // ── Add new migrations below this line ──────────────────────────────────────

  "create-tasks-tables": async () => {
    const db = await getD1();
    const log: string[] = [];
    let updated = 0;

    // tasks table
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_by TEXT NOT NULL,
          created_by_name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )
      `).run();
      log.push("Created tasks table");
      updated++;
    } catch { log.push("tasks table already exists"); }

    // task_items table
    try {
      await db.prepare(`
        CREATE TABLE IF NOT EXISTS task_items (
          id TEXT PRIMARY KEY,
          task_id TEXT NOT NULL,
          prospect_slug TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          notes TEXT NOT NULL DEFAULT '',
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL
        )
      `).run();
      log.push("Created task_items table");
      updated++;
    } catch { log.push("task_items table already exists"); }

    // Indexes
    try {
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_task_items_task_id ON task_items(task_id)").run();
      log.push("Created idx_task_items_task_id");
      updated++;
    } catch { log.push("idx_task_items_task_id already exists"); }

    try {
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)").run();
      log.push("Created idx_tasks_status");
      updated++;
    } catch { log.push("idx_tasks_status already exists"); }

    return { updated, skipped: 0, log };
  },

  "add-city-zip-columns": async () => {
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
        // "198 Lakeview Ave, Clifton, NJ 07011" → city = "Clifton"
        city = parts[1];
      }
      if (parts.length >= 3) {
        // Last part: "NJ 07011" → extract zip
        const lastPart = parts[parts.length - 1];
        const zipMatch = lastPart.match(/\b(\d{5})\b/);
        if (zipMatch) zip = zipMatch[1];
      }

      if (city || zip) {
        await db
          .prepare("UPDATE prospects SET city = ?, zip = ?, updated_at = ? WHERE slug = ?")
          .bind(city || null, zip || null, new Date().toISOString(), row.slug)
          .run();
        log.push(`${row.slug}: city=${city || "(none)"}, zip=${zip || "(none)"}`);
        updated++;
      } else {
        log.push(`${row.slug}: could not parse city/zip from "${row.address}"`);
        skipped++;
      }
    }

    // 3. Add index on city for filtering
    try {
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_prospects_city ON prospects(city)").run();
      log.push("Created idx_prospects_city");
    } catch { log.push("idx_prospects_city already exists"); }

    return { updated, skipped, log };
  },

  "add-booking-ip": async () => {
    const db = await getD1();
    const log: string[] = [];
    let updated = 0;

    try {
      await db.prepare("ALTER TABLE bookings ADD COLUMN ip TEXT").run();
      log.push("bookings: added ip column");
      updated++;
    } catch { log.push("bookings: ip column already exists"); }

    try {
      await db.prepare("CREATE INDEX IF NOT EXISTS idx_bookings_ip_submitted ON bookings(ip, submitted_at)").run();
      log.push("bookings: created ip+submitted_at index");
      updated++;
    } catch { log.push("bookings: index creation failed"); }

    return { updated, skipped: 0, log };
  },
};

export async function GET(req: Request) {
  console.log("[migrate:GET] Route handler entered — build c60c868");
  console.log("[migrate:GET] Total migrations registered:", Object.keys(MIGRATIONS).length);
  console.log("[migrate:GET] Migration keys:", JSON.stringify(Object.keys(MIGRATIONS)));

  const user = await getCurrentUser();
  console.log("[migrate:GET] User:", user?.email ?? "null");
  if (!user || !canManageBusinesses(user)) {
    console.log("[migrate:GET] Unauthorized — returning 401");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const migration = url.searchParams.get("run");
  console.log("[migrate:GET] Requested migration:", migration ?? "(list)");

  if (!migration) {
    const keys = Object.keys(MIGRATIONS);
    console.log("[migrate:GET] Returning list:", JSON.stringify(keys));
    return NextResponse.json({ available: keys, _build: "c60c868", _count: keys.length });
  }

  const fn = MIGRATIONS[migration];
  if (!fn) {
    console.log("[migrate:GET] Migration not found:", migration);
    return NextResponse.json(
      { error: `Unknown migration: "${migration}". Available: ${Object.keys(MIGRATIONS).join(", ")}` },
      { status: 404 },
    );
  }

  try {
    console.log("[migrate:GET] Running migration:", migration);
    const result = await fn();
    console.log("[migrate:GET] Migration complete:", JSON.stringify({ updated: result.updated, skipped: result.skipped }));
    return NextResponse.json({ migration, ...result });
  } catch (err) {
    console.error(`[migrate:GET] ${migration} failed:`, err);
    return NextResponse.json({ error: "Migration failed. Check server logs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { migration } = body as { migration?: string };

  if (!migration) {
    return NextResponse.json({ error: "migration name required" }, { status: 400 });
  }

  const fn = MIGRATIONS[migration];
  if (!fn) {
    return NextResponse.json(
      {
        error: `Unknown migration: "${migration}". Available: ${Object.keys(MIGRATIONS).join(", ")}`,
      },
      { status: 404 },
    );
  }

  try {
    const result = await fn();
    return NextResponse.json({ migration, ...result });
  } catch (err) {
    console.error(`[migrate:POST] ${migration} failed:`, err);
    return NextResponse.json({ error: "Migration failed. Check server logs." }, { status: 500 });
  }
}
