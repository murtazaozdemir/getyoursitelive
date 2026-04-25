import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";
import type { Business } from "@/lib/business-types";


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

interface BusinessRow {
  slug: string;
  content: string;
}

const MIGRATIONS: Record<string, () => Promise<{ updated: number; skipped: number; log: string[] }>> = {

  "fix-auto-repair-category": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, content FROM businesses WHERE category = 'Auto Repair' OR content LIKE '%\"category\":\"Auto Repair\"%'")
      .all<BusinessRow>();

    let updated = 0;
    const log: string[] = [];
    const correct = "Car repair and maintenance service";

    for (const row of results) {
      const biz = JSON.parse(row.content) as Business;
      biz.category = correct;
      await db
        .prepare("UPDATE businesses SET category = ?, content = ? WHERE slug = ?")
        .bind(correct, JSON.stringify(biz), row.slug)
        .run();
      log.push(row.slug);
      updated++;
    }

    return { updated, skipped: 0, log };
  },

  "google-category-lookup": async () => {
    // Look up businesses with non-Google categories on Google Places API
    // and update them with Google's primary type
    let apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      try {
        const { getCloudflareContext } = await import("@opennextjs/cloudflare");
        const { env } = await getCloudflareContext({ async: true });
        apiKey = (env as unknown as Record<string, string>).GOOGLE_PLACES_API_KEY;
      } catch { /* fallthrough */ }
    }
    if (!apiKey) {
      return { updated: 0, skipped: 0, log: ["ERROR: Google Places API key not configured"] };
    }

    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, name, category, content FROM businesses WHERE category NOT IN ('Car repair and maintenance service')")
      .all<{ slug: string; name: string; category: string; content: string }>();

    let updated = 0;
    let skipped = 0;
    const log: string[] = [];

    for (const row of results) {
      try {
        const res = await fetch(
          "https://places.googleapis.com/v1/places:searchText",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": "places.displayName,places.primaryTypeDisplayName",
            },
            body: JSON.stringify({
              textQuery: row.name,
              languageCode: "en",
              maxResultCount: 1,
            }),
          },
        );

        if (!res.ok) {
          log.push(`${row.slug}: Google API error ${res.status}`);
          skipped++;
          continue;
        }

        const data = (await res.json()) as { places?: Record<string, unknown>[] };
        const place = data.places?.[0];
        if (!place) {
          log.push(`${row.slug}: no Google result for "${row.name}"`);
          skipped++;
          continue;
        }

        const primaryType = place.primaryTypeDisplayName as { text?: string } | undefined;
        const googleCategory = primaryType?.text;
        if (!googleCategory) {
          log.push(`${row.slug}: Google returned no primaryTypeDisplayName`);
          skipped++;
          continue;
        }

        // Update both the DB column and the JSON content
        const biz = JSON.parse(row.content) as Business;
        biz.category = googleCategory;
        await db
          .prepare("UPDATE businesses SET category = ?, content = ? WHERE slug = ?")
          .bind(googleCategory, JSON.stringify(biz), row.slug)
          .run();

        log.push(`${row.slug}: "${row.category}" → "${googleCategory}"`);
        updated++;
      } catch (err) {
        log.push(`${row.slug}: error — ${err instanceof Error ? err.message : String(err)}`);
        skipped++;
      }
    }

    return { updated, skipped, log };
  },

  "fix-about-secondary-image": async () => {
    const DARK_URL =
      "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400";
    const GOOD_URL =
      "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400";

    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, content FROM businesses")
      .all<BusinessRow>();

    let updated = 0;
    let skipped = 0;
    const log: string[] = [];

    for (const row of results) {
      const biz = JSON.parse(row.content) as Business;
      if (biz.about?.secondaryImage === DARK_URL) {
        const patched = { ...biz, about: { ...biz.about, secondaryImage: GOOD_URL } };
        await db
          .prepare("UPDATE businesses SET content = ? WHERE slug = ?")
          .bind(JSON.stringify(patched), row.slug)
          .run();
        log.push(`${row.slug}: replaced dark secondary image`);
        updated++;
      } else {
        skipped++;
      }
    }

    return { updated, skipped, log };
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

  "list-prospects-no-domains": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare(
        `SELECT slug, name, address, state, domain1, domain2, domain3
         FROM prospects
         WHERE (domain1 IS NULL OR domain1 = '')
         ORDER BY state ASC, created_at DESC
         LIMIT 100`,
      )
      .all<{ slug: string; name: string; address: string; state: string | null; domain1: string | null; domain2: string | null; domain3: string | null }>();

    const log = results.map((r) => `${r.slug} | ${r.name} | ${r.state ?? "?"} | ${r.address}`);
    return { updated: 0, skipped: results.length, log };
  },

  "bulk-set-domains": async () => {
    const db = await getD1();
    const domains: [string, string, string, string][] = [
      ["rick-s-auto-repair-llc", "ricksautoco.com", "ricksfixco.com", "ricksauto.com"],
      ["marios-auto-care", "marioscareco.com", "mariosautoco.com", "mariosautocare.com"],
      ["star-tech-foreign-auto-repair", "startechca.com", "startechrep.com", "startechfix.com"],
      ["cal-s-garage", "calsgarageca.com", "calsautoca.com", "calsgarage.com"],
      ["yefrin-alignment", "yefrinauto.com", "yefrinco.com", "yefrinalign.com"],
      ["tony-s-auto-repair", "tonysfixca.com", "tonysglend.com", "tonysautopro.com"],
      ["patrick-s-auto-center", "patautoca.com", "patscenter.com", "patsautoca.com"],
      ["arlon-s-garage", "arlonsgarage.com", "arlonsauto.com", "arlonsfix.com"],
      ["auto-service-specialist", "autospecco.com", "autospecialist.com", "autospecco.com"],
      ["tulsa-auto-service-sales", "tulsakauto.com", "tulsaautook.com", "tulsaauto.com"],
      ["reds-automotive-services", "redsautoco.com", "redsautooh.com", "redscarfix.com"],
      ["columbus-auto-repair", "colsautooh.com", "colsrepair.com", "columbusfix.com"],
      ["joe-s-automotive-service-tire-s", "joesautoserv.com", "joesautoin.com", "joestirein.com"],
      ["american-auto-truck", "amtruckco.com", "amautoco.com", "amautotruck.com"],
      ["garcia-s-auto-repair-llc", "garciasco.com", "garciasfix.com", "garciasauto.com"],
      ["cox-auto-service", "coxservnc.com", "coxasheville.com", "coxcarsnc.com"],
      ["mission-hills-auto-repair", "mhautoca.com", "mhillsauto.com", "mhillsca.com"],
      ["protech-car-mechanic", "protechdenver.com", "protechautoco.com", "protechcar.com"],
      ["atlantis-auto-repair-llc", "atlantisautoco.com", "atlantisfix.com", "atlantisauto.com"],
      ["krumer-autotech-llc", "krumerauto.com", "krumerco.com", "krumertech.com"],
      ["platinum-motorsport", "platmotorco.com", "platinumco.com", "platmotors.com"],
      ["brake-s-auto", "brakesautoco.com", "brakesfix.com", "brakesauto.com"],
      ["aurora-auto-repair", "auroraautofix.com", "auroraautoco.com", "aurorafixco.com"],
      ["j-a-transmissions-and-gears", "jatransco.com", "jagearco.com", "jagearsco.com"],
      ["e-s-heavy-duty-repair-llc", "esheavyduty.com", "eshddrepair.com", "esrepairco.com"],
      ["alpha-auto-utv-services-llc", "alphaautoserv.com", "alphaautoco.com", "alphautv.com"],
      ["high-speed-automotive", "hispeedauto.com", "hispeedfix.com", "highspeedco.com"],
      ["cars-family-auto-repair", "carsfamauto.com", "carsfamco.com", "carsfamily.com"],
      ["auto-repair-apenitas", "apenitasco.com", "apenitasfix.com", "apenitauto.com"],
      ["maya-auto-repair", "mayaautoco.com", "mayarepair.com", "mayafix.com"],
      ["r-and-d-automotive", "rdautofix.com", "rdcarfix.com", "rdautoco.com"],
      ["pamir-auto-mechanic", "pamirautoco.com", "pamirfix.com", "pamirauto.com"],
      ["premium-auto-service", "premautoco.com", "premservice.com", "premiumfix.com"],
      ["meza-auto-repair", "mezaautoco.com", "mezafix.com", "mezarepco.com"],
      ["arden-automotive", "ardenautoco.com", "ardenfix.com", "ardenauto.com"],
      ["loretto-lube", "lorettolube.com", "lorettoco.com", "lorettofixco.com"],
      ["littleton-auto-services", "littonfix.com", "littonauto.com", "littonserv.com"],
      ["littleton-blvd-auto-care-center", "litblvdauto.com", "litblvdfix.com", "litblvdcare.com"],
      ["westview-automotive", "westviewauto.com", "westviewfix.com", "westviewco.com"],
      ["rauschy-repair", "rauschrep.com", "rauschyco.com", "rauschydiy.com"],
      ["westminster-rpm-mobile-mechanics", "westrpmco.com", "westrpmfix.com", "westrpmauto.com"],
      ["northside-auto-repair", "northautoco.com", "nthsideauto.com", "nsautoco.com"],
      ["automotive-technology-lakewood", "atechlkwd.com", "autotechfix.com", "atechautoco.com"],
      ["ali-s-auto-service", "alisautoco.com", "alisservice.com", "alisautofix.com"],
      ["ruben-s-mobile-mechanic", "rubensmech.com", "rubensfixco.com", "rubensautoco.com"],
      ["united-auto-care", "uautocare.com", "ucaredenver.com", "unitedcarco.com"],
      ["mile-high-automotive", "milehighfix.com", "milehiautoco.com", "milehiauto.com"],
      ["premier-automotive-repair", "premrepco.com", "premautorep.com", "premfixco.com"],
    ];

    let updated = 0;
    const log: string[] = [];
    for (const [slug, d1, d2, d3] of domains) {
      await db
        .prepare("UPDATE prospects SET domain1 = ?, domain2 = ?, domain3 = ?, updated_at = ? WHERE slug = ? AND (domain1 IS NULL OR domain1 = '')")
        .bind(d1, d2, d3, new Date().toISOString(), slug)
        .run();
      log.push(`${slug}: ${d1}, ${d2}, ${d3}`);
      updated++;
    }
    return { updated, skipped: 0, log };
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

  "auto-domains-nj": async () => {
    const db = await getD1();

    const NOISE = new Set(["inc","llc","corp","co","incorporated","and","the","of","s","a"]);
    const AUTO_WORDS = new Set(["auto","repair","tire","service","services","automotive","shop","garage","center","mechanic","car","truck","transmission","lube","alignment","body","motor","motors","motorsport","heavy","duty","mobile","foreign","specialist","care","works"]);

    function generateDomains(name: string, state: string): string[] {
      // Strip possessives and split
      const cleaned = name.toLowerCase().replace(/['']/g, "").replace(/&/g, "and");
      const words = cleaned.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
      const core = words.filter(w => !NOISE.has(w));
      const nonAuto = core.filter(w => !AUTO_WORDS.has(w));
      const st = state.toLowerCase();

      const candidates: string[] = [];
      const seen = new Set<string>();

      function add(d: string) {
        const full = d + ".com";
        if (d.length >= 4 && full.length <= 17 && !seen.has(d)) {
          seen.add(d);
          candidates.push(d);
        }
      }

      // 1. Core words joined
      const coreJoined = core.join("");
      add(coreJoined);

      // 2. Non-auto + "auto"
      if (nonAuto.length > 0) {
        add(nonAuto.join("") + "auto");
      }

      // 3. Core + state
      add(coreJoined + st);

      // 4. Non-auto + auto + state
      if (nonAuto.length > 0) {
        add(nonAuto.join("") + "auto" + st);
      }

      // 5. Non-auto + state
      if (nonAuto.length > 0) {
        add(nonAuto.join("") + st);
      }

      // 6. Suffixes: pro, fix, shop, works, co
      for (const suffix of ["pro", "fix", "co", "shop", "works"]) {
        if (nonAuto.length > 0) add(nonAuto.join("") + suffix);
        add(coreJoined + suffix);
      }

      // 7. Non-auto + "cars", "garage"
      if (nonAuto.length > 0) {
        add(nonAuto.join("") + "cars");
        add(nonAuto.join("") + "garage");
      }

      // 8. First word + auto
      if (core.length > 0) {
        add(core[0] + "auto");
        add(core[0] + "auto" + st);
        add(core[0] + "fix");
        add(core[0] + st);
      }

      return candidates.slice(0, 3);
    }

    const { results } = await db
      .prepare(
        `SELECT slug, name, state FROM prospects
         WHERE state = 'NJ' AND (domain1 IS NULL OR domain1 = '')
         ORDER BY created_at ASC`,
      )
      .all<{ slug: string; name: string; state: string }>();

    let updated = 0;
    let skipped = 0;
    const log: string[] = [];

    for (const row of results) {
      const domains = generateDomains(row.name, row.state);
      if (domains.length < 3) {
        log.push(`${row.slug}: only ${domains.length} candidates, skipped`);
        skipped++;
        continue;
      }
      await db
        .prepare("UPDATE prospects SET domain1 = ?, domain2 = ?, domain3 = ?, updated_at = ? WHERE slug = ? AND (domain1 IS NULL OR domain1 = '')")
        .bind(domains[0] + ".com", domains[1] + ".com", domains[2] + ".com", new Date().toISOString(), row.slug)
        .run();
      log.push(`${row.slug}: ${domains[0]}.com, ${domains[1]}.com, ${domains[2]}.com`);
      updated++;
    }

    return { updated, skipped, log };
  },

  "debug-nj-domains": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare(
        `SELECT slug, name, state, domain1, address FROM prospects
         WHERE state = 'NJ'
         ORDER BY domain1 IS NULL DESC, domain1 = '' DESC, created_at DESC
         LIMIT 30`,
      )
      .all<{ slug: string; name: string; state: string | null; domain1: string | null; address: string }>();

    const log = results.map((r) =>
      `${r.slug} | state=${r.state} | d1=${r.domain1 ?? "NULL"} | ${r.address}`
    );

    // Also count
    const countRow = await db
      .prepare("SELECT COUNT(*) as cnt FROM prospects WHERE state = 'NJ'")
      .first<{ cnt: number }>();
    const missingRow = await db
      .prepare("SELECT COUNT(*) as cnt FROM prospects WHERE state = 'NJ' AND (domain1 IS NULL OR domain1 = '')")
      .first<{ cnt: number }>();
    const noStateRow = await db
      .prepare("SELECT COUNT(*) as cnt FROM prospects WHERE state IS NULL")
      .first<{ cnt: number }>();

    log.unshift(`NJ total: ${countRow?.cnt}, NJ missing domains: ${missingRow?.cnt}, No state set: ${noStateRow?.cnt}`);
    return { updated: 0, skipped: 0, log };
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
    let noKey = false;

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

  "audit-empty-content": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, name, content FROM businesses")
      .all<{ slug: string; name: string; content: string }>();

    const log: string[] = [];
    log.push(`Total businesses: ${results.length}`);
    log.push("---");

    const issues: { slug: string; name: string; problems: string[] }[] = [];

    for (const row of results) {
      let biz: Business;
      try {
        biz = JSON.parse(row.content) as Business;
      } catch {
        issues.push({ slug: row.slug, name: row.name, problems: ["CORRUPT JSON — cannot parse"] });
        continue;
      }

      const problems: string[] = [];

      // Arrays that render as sections
      if (!biz.services || biz.services.length === 0) problems.push("services: EMPTY");
      if (!biz.testimonials || biz.testimonials.length === 0) problems.push("testimonials: EMPTY");
      if (!biz.teamMembers || biz.teamMembers.length === 0) problems.push("team: EMPTY");
      if (!biz.pricing || biz.pricing.length === 0) problems.push("pricing: EMPTY");
      if (!biz.faqs || biz.faqs.length === 0) problems.push("faqs: EMPTY");
      if (!biz.deals || biz.deals.length === 0) problems.push("deals: EMPTY");
      if (!biz.stats || biz.stats.length === 0) problems.push("stats: EMPTY");

      // Critical objects
      if (!biz.businessInfo) problems.push("businessInfo: MISSING");
      if (!biz.hero) problems.push("hero: MISSING");
      if (!biz.about) problems.push("about: MISSING");
      if (!biz.contact) problems.push("contact: MISSING");
      if (!biz.emergency) problems.push("emergency: MISSING");
      if (!biz.visibility) problems.push("visibility: MISSING");
      if (!biz.sectionTitles) problems.push("sectionTitles: MISSING");
      if (!biz.footer) problems.push("footer: MISSING");
      if (!biz.navLabels) problems.push("navLabels: MISSING");
      if (!biz.hoursSchedule) problems.push("hoursSchedule: MISSING");

      // Nested checks that could crash
      if (biz.hero && !biz.hero.whyBullets) problems.push("hero.whyBullets: MISSING");
      if (biz.about && !biz.about.bullets) problems.push("about.bullets: MISSING");
      if (biz.about && !biz.about.whyUsCards) problems.push("about.whyUsCards: MISSING");

      if (problems.length > 0) {
        issues.push({ slug: row.slug, name: row.name, problems });
      }
    }

    // Summary
    log.push(`Businesses with issues: ${issues.length} of ${results.length}`);
    log.push("---");

    // Group by problem type for quick view
    const problemCounts: Record<string, number> = {};
    for (const issue of issues) {
      for (const p of issue.problems) {
        problemCounts[p] = (problemCounts[p] || 0) + 1;
      }
    }
    for (const [problem, count] of Object.entries(problemCounts).sort((a, b) => b[1] - a[1])) {
      log.push(`  ${problem}: ${count} businesses`);
    }
    log.push("---");

    // Detail per business
    for (const issue of issues) {
      log.push(`${issue.slug} (${issue.name}): ${issue.problems.join(", ")}`);
    }

    return { updated: 0, skipped: issues.length, log };
  },

  "backfill-empty-content": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, name, content FROM businesses")
      .all<{ slug: string; name: string; content: string }>();

    let updated = 0;
    let skipped = 0;
    const log: string[] = [];

    for (const row of results) {
      let biz: Business;
      try {
        biz = JSON.parse(row.content) as Business;
      } catch {
        log.push(`${row.slug}: CORRUPT JSON, skipped`);
        skipped++;
        continue;
      }

      let dirty = false;
      const name = biz.businessInfo?.name || row.name;
      const phone = biz.businessInfo?.phone || "";
      const founded = biz.businessInfo?.founded || (new Date().getFullYear() - 11);
      const years = new Date().getFullYear() - founded;
      const patches: string[] = [];

      // Services
      if (!biz.services || biz.services.length === 0) {
        biz.services = [
          { id: "diagnostic", name: "Engine Diagnostic", priceRange: "$79–$129", duration: "30–60 min", description: "Full-system diagnostic scan to identify warning lights and performance issues.", features: ["OBD-II scan", "Check engine code reading", "Written diagnostic report", "Repair recommendations"] },
          { id: "brakes", name: "Brake Repair", priceRange: "$129–$349", duration: "1–2 hours", description: "Complete brake service — pads, rotors, calipers, fluid. Safe stopping power restored.", features: ["Pad and rotor replacement", "Caliper inspection", "Brake fluid flush", "Post-service test drive"] },
          { id: "oil", name: "Oil & Filter Change", priceRange: "$39–$79", duration: "20–30 min", description: "Keep your engine running clean with quality oil and a new filter.", features: ["Conventional or synthetic oil", "OEM-quality filter", "Fluid top-off", "Multi-point inspection"] },
          { id: "tires", name: "Tires & Alignment", priceRange: "$69–$229", duration: "45–90 min", description: "Tire mounting, balancing, rotation, and alignment.", features: ["Tire rotation and balance", "4-wheel alignment", "Tread depth check", "Pressure adjustment"] },
          { id: "inspection", name: "State Inspection", priceRange: "Included with service", duration: "30 min", description: "State safety and emissions inspection. Fast turnaround.", features: ["Full safety inspection", "Emissions test", "Courtesy pre-check", "Same-day results"] },
        ];
        dirty = true;
        patches.push("services");
      }

      // Testimonials
      if (!biz.testimonials || biz.testimonials.length === 0) {
        biz.testimonials = [
          { name: "John D.", context: "2020 Toyota Camry", quote: "Best mechanic shop in the area. Upfront about the cost and finished faster than expected. Will definitely be back." },
          { name: "Maria L.", context: "2018 Honda CR-V", quote: "Took my car in for a brake job. They showed me photos of the worn pads and explained everything. Fair price, great work." },
          { name: "Carlos R.", context: "2017 Ford F-150", quote: "Finally a mechanic I can trust. They didn't try to upsell me on anything I didn't need. Highly recommend." },
        ];
        dirty = true;
        patches.push("testimonials");
      }

      // Team
      if (!biz.teamMembers || biz.teamMembers.length === 0) {
        biz.teamMembers = [
          { name: "Mike", role: "Owner & Lead Mechanic", experience: "15+ years", specialty: "Domestic and import repair", image: "https://images.pexels.com/photos/4489743/pexels-photo-4489743.jpeg?auto=compress&cs=tinysrgb&w=800" },
          { name: "Sarah", role: "Senior Technician", experience: "10+ years", specialty: "Diagnostics and brake systems", image: "https://images.pexels.com/photos/4489730/pexels-photo-4489730.jpeg?auto=compress&cs=tinysrgb&w=800" },
        ];
        dirty = true;
        patches.push("team");
      }

      // Pricing
      if (!biz.pricing || biz.pricing.length === 0) {
        biz.pricing = [
          { id: "oil-change", name: "Oil Change", price: "$49", note: "Synthetic blend + multi-point inspection", popular: false },
          { id: "brake-service", name: "Brake Service", price: "$189", note: "Pads, rotor inspection, safety check", popular: true },
          { id: "diagnostic", name: "Full Diagnostic", price: "$89", note: "Digital scan + road test report", popular: false },
        ];
        dirty = true;
        patches.push("pricing");
      }

      // FAQs
      if (!biz.faqs || biz.faqs.length === 0) {
        biz.faqs = [
          { id: "f1", question: "How long does an oil change take?", answer: "Most oil changes are done in 30–45 minutes. We'll text you when your car is ready." },
          { id: "f2", question: "Do I need an appointment?", answer: "Walk-ins are welcome, but scheduling online ensures minimal wait time." },
          { id: "f3", question: "What warranty do you offer?", answer: "All repairs come with a 24-month / 24,000-mile parts and labor warranty." },
          { id: "f4", question: "Do you offer loaner cars?", answer: "Yes — call ahead and we'll arrange a loaner for longer repairs." },
        ];
        dirty = true;
        patches.push("faqs");
      }

      // Deals
      if (!biz.deals || biz.deals.length === 0) {
        biz.deals = [
          { id: "d1", title: "Oil Change Special", badge: "Limited Time", originalPrice: "$79", price: "$49", description: "Full synthetic oil change with filter. Up to 5 quarts." },
          { id: "d2", title: "Brake Inspection", badge: "Free", originalPrice: "", price: "Free", description: "No-charge brake inspection with any service visit." },
        ];
        dirty = true;
        patches.push("deals");
      }

      // Stats
      if (!biz.stats || biz.stats.length === 0) {
        biz.stats = [
          { label: "Years in Business", value: years, suffix: "+" },
          { label: "Satisfied Customers", value: 1200, suffix: "+" },
          { label: "Repairs Completed", value: 6000, suffix: "+" },
          { label: "Certified Technicians", value: 4, suffix: "" },
        ];
        dirty = true;
        patches.push("stats");
      }

      // Missing critical objects
      if (!biz.hero) {
        biz.hero = {
          eyebrowPrefix: `Family-owned since ${founded}`,
          headline: "Expert Auto Repair You Can Trust.",
          lead: "ASE-certified technicians. Same-day service on most repairs. Clear pricing before we start.",
          primaryCta: "See Our Services",
          secondaryCta: "Request an Estimate",
          whyTitle: "Why customers keep coming back",
          heroImage: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=1400",
          whyBullets: ["Photo-backed diagnostics — we show you what's wrong.", "Same-day turnaround on most repairs.", "24-month / 24,000-mile warranty on parts and labor.", "Friendly, plain-language explanations."],
        };
        dirty = true;
        patches.push("hero");
      }

      if (!biz.about) {
        biz.about = {
          heading: "Where Expertise Meets Honesty",
          narrative: `${name} has been serving the local community for over ${years} years. We're a family-owned shop that treats every customer like a neighbor. No upsells, no guesswork. Just honest work and fair prices.`,
          bullets: ["Free digital inspections with photos and videos", "Written estimates before any work begins", "No surprise pricing — ever"],
          primaryImage: "https://images.pexels.com/photos/4489713/pexels-photo-4489713.jpeg?auto=compress&cs=tinysrgb&w=1400",
          secondaryImage: "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400",
          whyUsCards: [
            { title: "Honest Diagnostics", description: "We show photos of every issue before recommending repairs." },
            { title: "Same-Day Service", description: "Most repairs completed within 24 hours." },
            { title: "Real-Time Updates", description: "Text and email updates from check-in to pickup." },
            { title: "2-Year Warranty", description: "24,000-mile parts and labor protection on every job." },
          ],
        };
        dirty = true;
        patches.push("about");
      }

      if (!biz.emergency) {
        biz.emergency = { heading: "Car Won't Start? We're Here for You.", description: "Emergency towing referrals and after-hours assistance available. Call us first.", ctaLabel: "Call Us Now" };
        dirty = true;
        patches.push("emergency");
      }

      if (!biz.contact) {
        biz.contact = { heading: "Book Your Service", description: "Tell us what your vehicle needs and we'll confirm timing and pricing quickly.", bookButtonLabel: "Request Service", extraServiceOptions: ["General Inspection", "Other"] };
        dirty = true;
        patches.push("contact");
      }

      if (!biz.sectionTitles) {
        biz.sectionTitles = { services: "Our Services", deals: "Current Specials", dealsEyebrow: "Deals & Offers", dealsLede: "Limited-time offers on common repairs.", dealsCta: "Claim This Deal", pricing: "Transparent Pricing", pricingPopular: "Most Popular", pricingRegular: "Standard", team: "Meet Our Technicians", testimonials: "What Our Customers Say", faq: "Frequently Asked Questions" } as Business["sectionTitles"];
        dirty = true;
        patches.push("sectionTitles");
      }

      if (!biz.navLabels) {
        biz.navLabels = { home: "Home", about: "About", services: "Services", technicians: "Technicians", contact: "Contact" };
        dirty = true;
        patches.push("navLabels");
      }

      if (!biz.footer) {
        biz.footer = { locationLabel: "Location", phoneLabel: "Call us", copyrightSuffix: "All rights reserved." };
        dirty = true;
        patches.push("footer");
      }

      if (dirty) {
        await db
          .prepare("UPDATE businesses SET content = ?, updated_at = ? WHERE slug = ?")
          .bind(JSON.stringify(biz), new Date().toISOString(), row.slug)
          .run();
        log.push(`${row.slug}: backfilled ${patches.join(", ")}`);
        updated++;
      } else {
        skipped++;
      }
    }

    log.unshift(`Updated: ${updated}, Already complete: ${skipped}`);
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
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const migration = url.searchParams.get("run");
  if (!migration) {
    return NextResponse.json({ available: Object.keys(MIGRATIONS) });
  }

  const fn = MIGRATIONS[migration];
  if (!fn) {
    return NextResponse.json(
      { error: `Unknown migration: "${migration}". Available: ${Object.keys(MIGRATIONS).join(", ")}` },
      { status: 404 },
    );
  }

  try {
    const result = await fn();
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
