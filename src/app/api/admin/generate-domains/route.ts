import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";

// ── Inline domain generation (avoids bundling issue with separate module) ──

const NOISE_WORDS = new Set([
  "auto", "repair", "center", "shop", "garage", "service", "services",
  "automotive", "motors", "motor", "car", "cars", "mechanic", "body",
  "care", "tire", "tires", "motorsport", "inc", "llc", "corp", "co",
  "incorporated", "the", "and", "of",
]);

const RDAP_URL = "https://rdap.verisign.com/com/v1/domain";

function domainSlugify(name: string): string {
  return name.toLowerCase().replace(/[''&]/g, "").replace(/\bavenue\b/g, "ave")
    .replace(/\bstreet\b/g, "st").replace(/\broad\b/g, "rd").replace(/[^a-z0-9]/g, "").trim();
}

function coreFromName(name: string): string {
  const words = name.toLowerCase().split(/\s+/);
  const core = words.map((w) => w.replace(/[^a-z0-9]/g, "")).filter((w) => w && !NOISE_WORDS.has(w)).join("");
  return core || domainSlugify(name);
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
  const core = coreFromName(name);
  const st = state.toLowerCase();
  if (!core) return [];
  const suffixes = [
    "auto", "fix", "pro", `auto${st}`, st, "works", "car", "mech",
    "ride", "shop", "serv", `${st}auto`, "autofix", "autopro",
    `car${st}`, `fix${st}`, `pro${st}`, "hub", "crew", "spot",
    `shop${st}`, "zone", "cars", `ride${st}`, `mech${st}`,
  ];
  const candidates: string[] = [];
  for (const s of suffixes) {
    const d = `${core}${s}.com`;
    if (d.length <= 17 && !d.includes("-")) candidates.push(d);
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
