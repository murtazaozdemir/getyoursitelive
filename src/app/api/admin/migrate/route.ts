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
        `SELECT slug, name, address, domain1, domain2, domain3
         FROM prospects
         WHERE (domain1 IS NULL OR domain1 = '')
         ORDER BY created_at DESC
         LIMIT 100`,
      )
      .all<{ slug: string; name: string; address: string; domain1: string | null; domain2: string | null; domain3: string | null }>();

    const log = results.map((r) => `${r.slug} | ${r.name} | ${r.address}`);
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

  // ── Add new migrations below this line ──────────────────────────────────────
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ available: Object.keys(MIGRATIONS) });
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
