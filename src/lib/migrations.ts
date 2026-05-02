import { getD1 } from "@/lib/db-d1";

export interface MigrationResult {
  updated: number;
  skipped: number;
  log: string[];
}

export const MIGRATIONS: Record<string, { description: string; fn: () => Promise<MigrationResult> }> = {

  "test-ping": {
    description: "Test that the migration system is working",
    fn: async () => {
      return { updated: 0, skipped: 0, log: ["Migration system working"] };
    },
  },

  "backfill-dropped-off-to-contacted": {
    description: "Move leads marked as dropped-off in tasks to 'contacted' status",
    fn: async () => {
      const db = await getD1();
      const { results } = await db
        .prepare(
          `SELECT ti.prospect_slug FROM task_items ti
           JOIN prospects p ON p.slug = ti.prospect_slug
           WHERE ti.status = 'dropped_off' AND p.status = 'found'`,
        )
        .all<{ prospect_slug: string }>();

      const log: string[] = [];
      let updated = 0;
      const now = new Date().toISOString();

      for (const row of results) {
        await db
          .prepare(
            `UPDATE prospects SET status = 'contacted', contacted_at = ?, updated_at = ? WHERE slug = ?`,
          )
          .bind(now, now, row.prospect_slug)
          .run();
        log.push(`${row.prospect_slug} moved to contacted`);
        updated++;
      }

      return { updated, skipped: results.length - updated, log };
    },
  },

  "add-google-fields-to-prospects": {
    description: "Add Google Places columns (place_id, rating, review_count, category, maps_url)",
    fn: async () => {
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
  },

  "add-website-to-prospects": {
    description: "Add website column to prospects",
    fn: async () => {
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
  },

  "add-state-column": {
    description: "Add state column and backfill from address",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];

      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN state TEXT").run();
        log.push("Added column state");
      } catch {
        log.push("Column state already exists, skipped");
      }

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
  },

  "add-lat-lng": {
    description: "Add lat/lng columns to prospects and places_cache",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];

      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN lat REAL").run();
        log.push("Added lat column to prospects");
      } catch { log.push("lat column already exists"); }
      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN lng REAL").run();
        log.push("Added lng column to prospects");
      } catch { log.push("lng column already exists"); }
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
  },

  "backfill-lat-lng": {
    description: "Backfill prospect lat/lng from places_cache",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;
      let skipped = 0;

      const { results: prospects } = await db
        .prepare("SELECT slug, phone, address FROM prospects WHERE lat IS NULL")
        .all<{ slug: string; phone: string; address: string }>();

      for (const p of prospects) {
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
  },

  "fetch-lat-lng": {
    description: "Fetch lat/lng from Google Places API for prospects missing coordinates",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;
      let skipped = 0;

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

      const { results: prospects } = await db
        .prepare("SELECT slug, google_place_id FROM prospects WHERE lat IS NULL AND google_place_id IS NOT NULL AND google_place_id != ''")
        .all<{ slug: string; google_place_id: string }>();

      log.push(`Found ${prospects.length} prospects without lat/lng that have a Place ID`);

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
  },

  "add-google-extended-fields": {
    description: "Add extended Google fields (business_status, price_level, reviews, photos, etc.)",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

      const sharedCols = [
        "business_status TEXT",
        "price_level TEXT",
        "editorial_summary TEXT",
        "opening_hours TEXT",
        "reviews TEXT",
        "photos TEXT",
        "address_components TEXT",
      ];

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
  },

  "create-tasks-tables": {
    description: "Create tasks and task_items tables with indexes",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

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
  },

  "add-city-zip-columns": {
    description: "Add city/zip columns and backfill from address",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;
      let skipped = 0;

      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN city TEXT").run();
        log.push("Added city column");
      } catch { log.push("city column already exists"); }
      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN zip TEXT").run();
        log.push("Added zip column");
      } catch { log.push("zip column already exists"); }

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
          log.push(`${row.slug}: city=${city || "(none)"}, zip=${zip || "(none)"}`);
          updated++;
        } else {
          log.push(`${row.slug}: could not parse city/zip from "${row.address}"`);
          skipped++;
        }
      }

      try {
        await db.prepare("CREATE INDEX IF NOT EXISTS idx_prospects_city ON prospects(city)").run();
        log.push("Created idx_prospects_city");
      } catch { log.push("idx_prospects_city already exists"); }

      return { updated, skipped, log };
    },
  },

  "add-booking-ip": {
    description: "Add ip column and index to bookings table",
    fn: async () => {
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
  },

  "add-user-ip-columns": {
    description: "Add wifi_ip and mobile_ip columns to users table",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

      try {
        await db.prepare("ALTER TABLE users ADD COLUMN wifi_ip TEXT").run();
        log.push("Added wifi_ip column");
        updated++;
      } catch { log.push("wifi_ip column already exists"); }

      try {
        await db.prepare("ALTER TABLE users ADD COLUMN mobile_ip TEXT").run();
        log.push("Added mobile_ip column");
        updated++;
      } catch { log.push("mobile_ip column already exists"); }

      return { updated, skipped: 0, log };
    },
  },

  "add-user-company-column": {
    description: "Add company column to users table",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

      try {
        await db.prepare("ALTER TABLE users ADD COLUMN company TEXT").run();
        log.push("Added company column");
        updated++;
      } catch { log.push("company column already exists"); }

      return { updated, skipped: 0, log };
    },
  },

  "disable-booking-form": {
    description: "Disable booking form on all businesses (set showBooking to false)",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;
      let skipped = 0;

      const { results } = await db
        .prepare("SELECT slug, content FROM businesses WHERE content LIKE '%\"showBooking\":true%' OR content LIKE '%\"showBooking\": true%'")
        .all<{ slug: string; content: string }>();

      log.push(`Found ${results.length} businesses with showBooking:true`);

      for (const row of results) {
        try {
          const content = row.content;
          const newContent = content
            .split('"showBooking":true').join('"showBooking":false')
            .split('"showBooking": true').join('"showBooking":false');

          if (newContent !== content) {
            await db
              .prepare("UPDATE businesses SET content = ? WHERE slug = ?")
              .bind(newContent, row.slug)
              .run();
            updated++;
          } else {
            skipped++;
          }
        } catch {
          log.push(`${row.slug}: failed`);
          skipped++;
        }
      }

      log.push(`Done: ${updated} updated, ${skipped} skipped`);
      return { updated, skipped, log };
    },
  },

  "update-barber-photos": {
    description: "Update barber business photos to new Pexels IDs",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;
      let skipped = 0;

      const idReplacements: [string, string][] = [
        ["1813272", "1860567"],
        ["1319460", "7697329"],
        ["3998429", "3998421"],
        ["1570807", "2809652"],
        ["3993449", "8867553"],
        ["3992874", "4625644"],
      ];

      const { results } = await db
        .prepare("SELECT slug, content FROM businesses WHERE LOWER(category) LIKE '%barber%' OR LOWER(category) LIKE '%hair salon%'")
        .all<{ slug: string; content: string }>();

      log.push(`Found ${results.length} barber/salon businesses`);

      for (const row of results) {
        if (!row.content) {
          log.push(`${row.slug}: no content, skipped`);
          skipped++;
          continue;
        }

        let content = row.content;
        let changed = false;

        for (const [oldId, newId] of idReplacements) {
          const oldPhoto = `pexels-photo-${oldId}`;
          const newPhoto = `pexels-photo-${newId}`;
          const oldPath = `photos/${oldId}/`;
          const newPath = `photos/${newId}/`;

          while (content.indexOf(oldPhoto) !== -1) {
            content = content.split(oldPhoto).join(newPhoto);
            changed = true;
          }
          while (content.indexOf(oldPath) !== -1) {
            content = content.split(oldPath).join(newPath);
            changed = true;
          }
        }

        if (changed) {
          await db
            .prepare("UPDATE businesses SET content = ? WHERE slug = ?")
            .bind(content, row.slug)
            .run();
          log.push(`${row.slug}: photos updated`);
          updated++;
        } else {
          log.push(`${row.slug}: no old photos found, skipped`);
          skipped++;
        }
      }

      return { updated, skipped, log };
    },
  },

  "add-contact-method-column": {
    description: "Add contact_method column to prospects table (visit, mail, phone, email)",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      try {
        await db.prepare("ALTER TABLE prospects ADD COLUMN contact_method TEXT").run();
        log.push("Added contact_method column to prospects table");
        return { updated: 1, skipped: 0, log };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("duplicate column") || msg.includes("already exists")) {
          log.push("contact_method column already exists, skipped");
          return { updated: 0, skipped: 1, log };
        }
        throw e;
      }
    },
  },

  "backfill-contact-method-visit": {
    description: "Set contact_method to 'visit' for all already-contacted leads that are missing it",
    fn: async () => {
      const db = await getD1();
      const { results } = await db
        .prepare(
          `SELECT slug, name FROM prospects
           WHERE contacted_by IS NOT NULL AND (contact_method IS NULL OR contact_method = '')`,
        )
        .all<{ slug: string; name: string }>();

      if (results.length === 0) {
        return { updated: 0, skipped: 0, log: ["No contacted leads missing contact_method"] };
      }

      const log: string[] = [];
      let updated = 0;
      for (const row of results) {
        await db
          .prepare("UPDATE prospects SET contact_method = 'visit' WHERE slug = ?")
          .bind(row.slug)
          .run();
        log.push(`Set contact_method=visit for ${row.name}`);
        updated++;
      }

      return { updated, skipped: 0, log };
    },
  },

  "backfill-contacted-attribution": {
    description: "Set contacted_by, contacted_by_name, and contact_method for contacted leads missing attribution",
    fn: async () => {
      const db = await getD1();
      const { results } = await db
        .prepare(
          `SELECT slug, name FROM prospects
           WHERE status IN ('contacted','interested','paid','delivered')
             AND contacted_by IS NULL`,
        )
        .all<{ slug: string; name: string }>();

      if (results.length === 0) {
        return { updated: 0, skipped: 0, log: ["All contacted leads already have attribution"] };
      }

      const log: string[] = [];
      let updated = 0;
      const now = new Date().toISOString();
      for (const row of results) {
        await db
          .prepare(
            `UPDATE prospects
             SET contacted_by = 'info@getyoursitelive.com',
                 contacted_by_name = 'Murtaza Ozdemir',
                 contact_method = 'visit',
                 contacted_at = ?
             WHERE slug = ?`,
          )
          .bind(now, row.slug)
          .run();
        log.push(`Set attribution for ${row.name}`);
        updated++;
      }

      return { updated, skipped: 0, log };
    },
  },

  "clean-invalid-state-values": {
    description: "Fix prospects where state column has city names instead of 2-letter state codes",
    fn: async () => {
      const VALID_STATES = new Set([
        "AL","AK","AZ","AR","CA","CO","CT","DC","DE","FL","GA","HI","ID","IL","IN",
        "IA","KS","KY","LA","MA","MD","ME","MI","MN","MS","MO","MT","NE","NV","NH",
        "NJ","NM","NY","NC","ND","OH","OK","OR","PA","PR","RI","SC","SD","TN","TX",
        "UT","VT","VA","WA","WV","WI","WY",
      ]);
      const db = await getD1();
      const { results } = await db
        .prepare("SELECT slug, name, state, city FROM prospects WHERE state IS NOT NULL AND state != ''")
        .all<{ slug: string; name: string; state: string; city: string | null }>();

      const log: string[] = [];
      let updated = 0;
      for (const row of results) {
        const st = row.state.trim().toUpperCase();
        if (VALID_STATES.has(st)) continue;

        // Invalid state value — move to city if city is empty, then clear state
        if (!row.city || row.city.trim() === "") {
          await db
            .prepare("UPDATE prospects SET city = ?, state = NULL WHERE slug = ?")
            .bind(row.state.trim(), row.slug)
            .run();
          log.push(`${row.name}: moved "${row.state}" to city, cleared state`);
        } else {
          await db
            .prepare("UPDATE prospects SET state = NULL WHERE slug = ?")
            .bind(row.slug)
            .run();
          log.push(`${row.name}: cleared invalid state "${row.state}" (city already: ${row.city})`);
        }
        updated++;
      }

      if (updated === 0) {
        log.push("All state values are valid 2-letter codes");
      }
      return { updated, skipped: results.length - updated, log };
    },
  },
  "create-state-visibility": {
    description: "Create state_visibility table and seed NJ, CO, DC as visible",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

      try {
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS state_visibility (
            state TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            visible INTEGER NOT NULL DEFAULT 0
          )
        `).run();
        log.push("Created state_visibility table");
        updated++;
      } catch { log.push("state_visibility table already exists"); }

      // Seed all 51 entries (50 states + DC)
      const states = [
        ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],
        ["CA","California"],["CO","Colorado"],["CT","Connecticut"],["DC","District of Columbia"],
        ["DE","Delaware"],["FL","Florida"],["GA","Georgia"],["HI","Hawaii"],
        ["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
        ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],
        ["MD","Maryland"],["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],
        ["MS","Mississippi"],["MO","Missouri"],["MT","Montana"],["NE","Nebraska"],
        ["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],["NM","New Mexico"],
        ["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
        ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],
        ["SC","South Carolina"],["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],
        ["UT","Utah"],["VT","Vermont"],["VA","Virginia"],["WA","Washington"],
        ["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
      ];
      const VISIBLE = new Set(["NJ", "CO", "DC"]);
      for (const [abbr, name] of states) {
        try {
          await db.prepare(
            "INSERT OR IGNORE INTO state_visibility (state, name, visible) VALUES (?, ?, ?)"
          ).bind(abbr, name, VISIBLE.has(abbr) ? 1 : 0).run();
        } catch { /* already exists */ }
      }
      log.push(`Seeded ${states.length} states (NJ, CO, DC visible)`);
      updated++;

      return { updated, skipped: 0, log };
    },
  },

  "create-platform-settings": {
    description: "Create platform_settings table for envelope margins and other settings",
    fn: async () => {
      const db = await getD1();
      const log: string[] = [];
      let updated = 0;

      try {
        await db.prepare(`
          CREATE TABLE IF NOT EXISTS platform_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT ''
          )
        `).run();
        log.push("Created platform_settings table");
        updated++;
      } catch { log.push("platform_settings table already exists"); }

      return { updated, skipped: 0, log };
    },
  },
};

/** Get list of migration names + descriptions for the UI */
export function listMigrations(): { name: string; description: string }[] {
  return Object.entries(MIGRATIONS).map(([name, m]) => ({
    name,
    description: m.description,
  }));
}

/** Run a migration by name */
export async function runMigration(name: string): Promise<MigrationResult> {
  const migration = MIGRATIONS[name];
  if (!migration) {
    return { updated: 0, skipped: 0, log: [`ERROR: Unknown migration "${name}"`] };
  }
  return migration.fn();
}
