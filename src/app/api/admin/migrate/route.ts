import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getStorage } from "@/lib/storage";
import { readJson, writeJson } from "@/lib/storage";
import type { Business } from "@/lib/business-types";

/**
 * POST /api/admin/migrate
 * Body: { migration: string }
 *
 * Runs a named migration against live production data (Blob).
 * Each migration reads the current state, applies a transform, writes back.
 * Safe to run multiple times — migrations are idempotent.
 *
 * Admin-only.
 */

// ─── Register migrations here ────────────────────────────────────────────────
// When Claude needs to bulk-modify existing data, add a migration function here,
// deploy, then trigger it once from /admin/setup. Never touch local data files
// for existing-record modifications — always go through here.

const MIGRATIONS: Record<string, () => Promise<{ updated: number; skipped: number; log: string[] }>> = {

  // Example (safe to run, adds nothing if field already exists):
  "ensure-category": async () => {
    const storage = await getStorage();
    const keys = (await storage.list("businesses")).filter((k) => k.endsWith(".json"));
    let updated = 0, skipped = 0;
    const log: string[] = [];

    for (const key of keys) {
      const biz = await readJson<Business>(storage, key);
      if (!biz) { log.push(`${key}: not found`); skipped++; continue; }

      if (!biz.category) {
        const patched = { ...biz, category: "Auto Repair" };
        await writeJson(storage, key, patched);
        log.push(`${key}: set category = "Auto Repair"`);
        updated++;
      } else {
        skipped++;
      }
    }

    return { updated, skipped, log };
  },

  // ── Add new migrations below this line ──────────────────────────────────────
  // Pattern:
  //   "migration-name": async () => {
  //     const storage = await getStorage();
  //     // read businesses/prospects from storage
  //     // apply your transform
  //     // write back with writeJson(storage, key, patched)
  //     return { updated, skipped, log };
  //   },

  // Fix dark secondary image in About section (pexels 3807517 renders nearly black)
  "fix-about-secondary-image": async () => {
    const DARK_URL = "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1400";
    const GOOD_URL = "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1400";
    const storage = await getStorage();
    const keys = (await storage.list("businesses")).filter((k) => k.endsWith(".json"));
    let updated = 0, skipped = 0;
    const log: string[] = [];

    for (const key of keys) {
      const biz = await readJson<Business>(storage, key);
      if (!biz) { log.push(`${key}: not found`); skipped++; continue; }

      if (biz.about?.secondaryImage === DARK_URL) {
        const patched = { ...biz, about: { ...biz.about, secondaryImage: GOOD_URL } };
        await writeJson(storage, key, patched);
        log.push(`${key}: replaced dark secondary image`);
        updated++;
      } else {
        skipped++;
      }
    }

    return { updated, skipped, log };
  },

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
