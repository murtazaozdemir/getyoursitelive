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
