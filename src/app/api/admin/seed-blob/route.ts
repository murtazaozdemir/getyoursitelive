import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { createLocalStorage } from "@/lib/storage-local";
import { getStorage } from "@/lib/storage";

/**
 * POST /api/admin/seed-blob
 *
 * One-time endpoint: reads all data files that shipped with the deployment
 * (data/businesses/*.json and data/prospects.json) and writes them to
 * the configured storage backend (R2, Blob, etc.).
 *
 * Admin-only. Safe to run multiple times — existing objects are overwritten.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const src = createLocalStorage();
  const dst = await getStorage();

  const results: { key: string; ok: boolean; error?: string }[] = [];

  // ── Businesses ──────────────────────────────────────────────────────
  let bizKeys: string[] = [];
  try {
    bizKeys = await src.list("businesses");
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to list businesses: ${err}` },
      { status: 500 },
    );
  }

  for (const key of bizKeys.filter((k) => k.endsWith(".json"))) {
    try {
      const content = await src.read(key);
      if (!content) {
        results.push({ key, ok: false, error: "empty" });
        continue;
      }
      await dst.write(key, content);
      results.push({ key, ok: true });
    } catch (err) {
      results.push({ key, ok: false, error: String(err) });
    }
  }

  // ── Prospects ────────────────────────────────────────────────────────
  try {
    const content = await src.read("prospects.json");
    if (content) {
      await dst.write("prospects.json", content);
      results.push({ key: "prospects.json", ok: true });
    } else {
      results.push({ key: "prospects.json", ok: false, error: "not found in deployment" });
    }
  } catch (err) {
    results.push({ key: "prospects.json", ok: false, error: String(err) });
  }

  const ok = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return NextResponse.json({ uploaded: ok, failed, total: results.length });
}
