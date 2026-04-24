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

  "ensure-category": async () => {
    const db = await getD1();
    const { results } = await db
      .prepare("SELECT slug, content FROM businesses")
      .all<BusinessRow>();

    let updated = 0;
    let skipped = 0;
    const log: string[] = [];

    for (const row of results) {
      const biz = JSON.parse(row.content) as Business;
      if (!biz.category) {
        const patched = { ...biz, category: "Auto Repair" };
        await db
          .prepare("UPDATE businesses SET category = ?, content = ? WHERE slug = ?")
          .bind("Auto Repair", JSON.stringify(patched), row.slug)
          .run();
        log.push(`${row.slug}: set category = "Auto Repair"`);
        updated++;
      } else {
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

  // ── Add new migrations below this line ──────────────────────────────────────
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
