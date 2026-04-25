/**
 * Domain generation + availability verification via Verisign RDAP.
 * All domains are verified as available before being returned or stored.
 * Works on Cloudflare edge runtime (HTTP-only, no shell commands).
 */

const NOISE_WORDS = new Set([
  "auto", "repair", "center", "shop", "garage", "service", "services",
  "automotive", "motors", "motor", "car", "cars", "mechanic", "body",
  "care", "tire", "tires", "motorsport", "inc", "llc", "corp", "co",
  "incorporated", "the", "and", "of",
]);

const RDAP_URL = "https://rdap.verisign.com/com/v1/domain";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''&]/g, "")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bstreet\b/g, "st")
    .replace(/\broad\b/g, "rd")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

function coreFromName(name: string): string {
  const words = name.toLowerCase().split(/\s+/);
  const core = words
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w && !NOISE_WORDS.has(w))
    .join("");
  return core || slugify(name);
}

/** Check if a .com domain is available via Verisign RDAP (HTTP). */
async function isDomainAvailable(domain: string): Promise<boolean> {
  const name = domain.replace(/\.com$/i, "");
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${RDAP_URL}/${name}.com`, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timer);
    // 404 = not found = available. 200 = registered = taken.
    return res.status === 404;
  } catch {
    // Network error / timeout — assume taken (safe default)
    return false;
  }
}

/** Generate candidate domains following the project rules. */
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
    // Max 17 chars total (prefer ≤15), no dashes
    if (d.length <= 17 && !d.includes("-")) {
      candidates.push(d);
    }
  }
  return [...new Set(candidates)];
}

/**
 * Generate 3 verified-available .com domains for a business.
 * Checks each candidate against Verisign RDAP before returning.
 * Returns only domains confirmed as available (may return fewer than 3).
 */
export async function generateVerifiedDomains(
  name: string,
  state: string,
): Promise<string[]> {
  const candidates = generateCandidates(name, state || "nj");
  const verified: string[] = [];

  for (const domain of candidates) {
    if (verified.length >= 3) break;
    const available = await isDomainAvailable(domain);
    if (available) {
      verified.push(domain);
    }
  }

  return verified;
}
