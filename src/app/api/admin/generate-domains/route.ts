import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";

// ── Inline domain generation (avoids bundling issue with separate module) ──

const NOISE_WORDS = new Set([
  "auto", "repair", "center", "shop", "garage", "service", "services",
  "automotive", "motors", "motor", "car", "cars", "mechanic", "body",
  "care", "tire", "tires", "motorsport", "inc", "llc", "corp", "co",
  "incorporated", "the", "and", "of", "specialist", "specialists",
  "express", "mobile", "complete", "quality", "advanced", "custom",
  "reliable", "professional", "certified", "expert", "new", "used",
  "discount", "muffler", "mufflers", "brake", "brakes", "transmission",
  "transmissions", "electric", "electrical", "lube", "oil", "wash",
  "detailing", "collision", "towing", "welding", "paint", "painting",
  "group", "gold", "century", "machine", "racing",
]);

const RDAP_URL = "https://rdap.verisign.com/com/v1/domain";

function domainSlugify(name: string): string {
  return name.toLowerCase().replace(/[''&]/g, "").replace(/\bavenue\b/g, "ave")
    .replace(/\bstreet\b/g, "st").replace(/\broad\b/g, "rd").replace(/[^a-z0-9]/g, "").trim();
}

function coreFromName(name: string): string {
  // Strip parenthetical content first — e.g. "Car Care Specialists (Richard's Cars...)"
  const clean = name.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const words = clean.toLowerCase().split(/\s+/);
  const filtered = words.map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w && !NOISE_WORDS.has(w));
  if (filtered.length > 0) return filtered.join("");
  // All words were noise — use the slugified clean name (without parens)
  const slug = domainSlugify(clean);
  return slug || domainSlugify(name);
}

async function isDomainAvailable(domain: string): Promise<boolean> {
  const n = domain.replace(/\.com$/i, "");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${RDAP_URL}/${n}.com`, { method: "HEAD", signal: controller.signal });
    clearTimeout(timer);
    return res.status === 404;
  } catch { return false; }
}

function generateCandidates(name: string, state: string): string[] {
  const fullCore = coreFromName(name);
  const st = state.toLowerCase();
  if (!fullCore) return [];

  // Try full core, then truncated to 14 chars, then first word only
  const cores = [fullCore];
  if (fullCore.length > 14) cores.push(fullCore.slice(0, 14));
  if (fullCore.length > 10) cores.push(fullCore.slice(0, 10));
  // Also try just the first meaningful word
  const clean = name.replace(/\s*\(.*?\)\s*/g, " ").trim();
  const firstWord = clean.toLowerCase().split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .find((w) => w && w.length >= 3 && !NOISE_WORDS.has(w));
  if (firstWord && !cores.includes(firstWord)) cores.push(firstWord);

  const suffixes = [
    "", st, "auto", "fix", "pro", "hub", "crew", "spot", "zone",
    "works", "car", "mech", "ride", "shop", "serv", "cars",
    `${st}auto`, `auto${st}`, `fix${st}`, `pro${st}`, `car${st}`,
    `shop${st}`, `ride${st}`, `mech${st}`, "autofix", "autopro",
  ];
  const candidates: string[] = [];
  for (const core of cores) {
    for (const s of suffixes) {
      const d = `${core}${s}.com`;
      if (d.length <= 24 && !d.includes("-")) candidates.push(d);
    }
  }
  return [...new Set(candidates)];
}

async function generateVerifiedDomains(name: string, state: string): Promise<string[]> {
  const candidates = generateCandidates(name, state || "nj");
  const verified: string[] = [];
  for (const domain of candidates) {
    if (verified.length >= 3) break;
    if (await isDomainAvailable(domain)) verified.push(domain);
  }
  return verified;
}

/**
 * POST /api/admin/generate-domains
 * Body: { slug: string }
 *
 * Generates up to 3 verified-available .com domains for a prospect
 * and saves them to the DB. Only runs if the prospect has no domains yet.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = (await req.json()) as { slug: string };
    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" });
    }

    const prospect = await getProspect(slug);
    if (!prospect) {
      return NextResponse.json({ ok: false, error: "Prospect not found" });
    }

    // Skip if domains already exist
    if (prospect.domain1 && prospect.domain2 && prospect.domain3) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const state = prospect.address?.match(/\b([A-Z]{2})\s+\d{5}/)?.[1] || "NJ";
    const domains = await generateVerifiedDomains(prospect.name, state);

    if (domains.length === 0) {
      return NextResponse.json({ ok: true, domains: [] });
    }

    await updateProspect(slug, {
      domain1: prospect.domain1 || domains[0] || undefined,
      domain2: prospect.domain2 || domains[1] || undefined,
      domain3: prospect.domain3 || domains[2] || undefined,
    });

    return NextResponse.json({ ok: true, domains });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-domains] error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
