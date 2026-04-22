#!/usr/bin/env node
/**
 * find-domains.mjs
 *
 * For every business in data/businesses/, generates .com domain candidates
 * following the project domain rules, checks availability via whois,
 * and saves the top 3 available domains to the prospect record.
 *
 * Rules:
 *   - .com only
 *   - No Inc / LLC / Corp in domain
 *   - No dashes, no dots
 *   - Max 15 chars total (hard cap 17)
 *   - No numbers unless the business name itself contains a number
 *   - NJ suffix allowed as fallback
 *
 * Usage:
 *   node scripts/find-domains.mjs              # all businesses
 *   node scripts/find-domains.mjs star-auto    # single slug
 *   node scripts/find-domains.mjs --dry-run    # check + print, don't save
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = new URL("..", import.meta.url).pathname;
const BIZ_DIR = join(ROOT, "data/businesses");
const PROSPECTS_FILE = join(ROOT, "data/prospects.json");

const DRY_RUN = process.argv.includes("--dry-run");
const TARGET_SLUG = process.argv.slice(2).find((a) => !a.startsWith("--"));

// ── Rules ─────────────────────────────────────────────────────────────────

const NOISE = new Set(["inc", "llc", "corp", "co", "incorporated", "and", "the", "of", "ltd"]);
const ABBREV = { avenue: "ave", street: "st", road: "rd", north: "n", south: "s", east: "e", west: "w" };
// Words stripped from the name before generating candidates.
// Only strip truly generic filler words — NOT specialty words like tire/electric/body
// that define what makes this shop different.
// "complete" is intentionally kept — it can be a brand differentiator.
const GENERIC_AUTO = new Set(["auto", "repair", "repairs", "service", "services", "automotive", "shop", "garage", "center", "mechanic", "motors", "motor", "works", "excellence", "servs", "serv"]);
const SUFFIXES_SHORT = ["nj", "pro", "fix", "shop", "works"];
const SUFFIXES_WITH_AUTO = ["auto", "autonj", "repairnj"];
const MAX_LEN = 17; // hard cap including .com (target ≤ 15)

// ── Name → candidate domains ───────────────────────────────────────────────

function tokenize(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => !NOISE.has(w))
    .map((w) => ABBREV[w] ?? w);
}

function nameHasNumber(name) {
  return /\d/.test(name);
}

function candidate(label) {
  return label + ".com";
}

function validDomain(domain, bizHasNumber) {
  const label = domain.replace(".com", "");
  if (domain.length > MAX_LEN) return false;
  if (label.includes("-") || label.includes(".")) return false;
  if (!bizHasNumber && /\d/.test(label)) return false;
  return true;
}

const MIN_LABEL = 4;

function generateCandidates(name) {
  const tokens = tokenize(name);
  const hasNumber = nameHasNumber(name);
  const coreTokens = tokens.filter((w) => !GENERIC_AUTO.has(w));
  const core = coreTokens.join("");
  const full = tokens.join("");
  const first = coreTokens[0] ?? tokens[0] ?? "";

  const all = new Map();
  let pri = 0;
  const add = (label) => {
    const d = candidate(label);
    if (!all.has(d) && validDomain(d, hasNumber) && label.length >= MIN_LABEL) all.set(d, pri++);
  };

  if (core.length <= 4) {
    // Short initials (e.g. "ac", "ak", "amg") — always pair with auto words
    add(core + "auto");
    add(core + "autonj");
    add(core + "nj");
    add(core + "repairnj");
    for (const s of SUFFIXES_SHORT) add(core + s);
  } else {
    // Longer core
    add(core);
    add(core + "nj");
    add(core + "auto");
    for (const s of SUFFIXES_SHORT) add(core + s);
    for (const s of SUFFIXES_WITH_AUTO) add(core + s);
  }

  // Always try full join and full+nj
  add(full);
  add(full + "nj");
  for (const s of SUFFIXES_SHORT) add(full + s);

  // First core word standalone (when core is multi-word and first word is meaningful)
  if (first.length >= 5 && first !== core) {
    add(first + "auto");
    add(first + "nj");
    add(first + "autonj");
    for (const s of SUFFIXES_SHORT) add(first + s);
  }

  // Fallback: if nothing generated yet, try first two core tokens joined
  const coreTwo = coreTokens.slice(0, 2).join("");
  if (coreTwo.length >= 4 && coreTwo !== core) {
    add(coreTwo);
    add(coreTwo + "nj");
    add(coreTwo + "auto");
    for (const s of SUFFIXES_SHORT) add(coreTwo + s);
  }

  return [...all.entries()]
    .sort((a, b) => a[0].length - b[0].length || a[1] - b[1])
    .map(([d]) => d);
}

// ── whois check ────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isAvailable(domain) {
  try {
    const out = execSync(`whois ${domain}`, { timeout: 10000 }).toString().toLowerCase();
    return /no match|not found|no data found|domain not found/.test(out);
  } catch {
    return false; // treat errors as taken to be safe
  }
}

async function findAvailable(name, needed = 3) {
  const candidates = generateCandidates(name);
  const found = [];
  const checked = [];

  for (const domain of candidates) {
    if (found.length >= needed) break;
    const avail = isAvailable(domain);
    checked.push({ domain, avail });
    if (avail) found.push(domain);
    await sleep(650);
  }

  return { found, checked };
}

// ── Prospect record helpers ────────────────────────────────────────────────

function readAllProspects() {
  try {
    return JSON.parse(readFileSync(PROSPECTS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveAllProspects(prospects) {
  writeFileSync(PROSPECTS_FILE, JSON.stringify(prospects, null, 2));
}

// ── Main ───────────────────────────────────────────────────────────────────

const slugs = readdirSync(BIZ_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(".json", ""))
  .filter((s) => !TARGET_SLUG || s === TARGET_SLUG)
  .sort();

if (slugs.length === 0) {
  console.error(`No businesses found${TARGET_SLUG ? ` for slug "${TARGET_SLUG}"` : ""}`);
  process.exit(1);
}

console.log(`\nChecking domains for ${slugs.length} business(es)...\n${"─".repeat(60)}`);

const report = [];
const allProspects = readAllProspects();
const prospectMap = new Map(allProspects.map((p) => [p.slug, p]));

for (const slug of slugs) {
  const biz = JSON.parse(readFileSync(join(BIZ_DIR, `${slug}.json`), "utf8"));
  const name = biz.businessInfo.name;

  process.stdout.write(`\n[${slug}] ${name}\n`);

  const { found, checked } = await findAvailable(name);

  for (const { domain, avail } of checked) {
    process.stdout.write(`  ${avail ? "✅" : "❌"} ${domain}\n`);
  }

  if (found.length < 3) {
    process.stdout.write(`  ⚠️  Only found ${found.length}/3 available domains\n`);
  }

  report.push({ slug, name, domains: found });

  // Save to prospect record
  if (!DRY_RUN && found.length > 0) {
    const prospect = prospectMap.get(slug);
    if (prospect) {
      prospect.domain1 = found[0] ?? prospect.domain1 ?? "";
      prospect.domain2 = found[1] ?? prospect.domain2 ?? "";
      prospect.domain3 = found[2] ?? prospect.domain3 ?? "";
      prospect.updatedAt = new Date().toISOString();
      process.stdout.write(`  💾 Saved\n`);
    } else {
      process.stdout.write(`  ⚠️  No prospect record found — not saved\n`);
    }
  }
}

// Write all prospects back in one shot
if (!DRY_RUN) {
  saveAllProspects([...prospectMap.values()]);
}

console.log(`\n${"─".repeat(60)}\nSUMMARY\n${"─".repeat(60)}`);
for (const { name, domains } of report) {
  const status = domains.length >= 3 ? "✅" : domains.length > 0 ? "⚠️ " : "❌";
  console.log(`${status} ${name}`);
  for (const d of domains) console.log(`   • ${d}`);
}

console.log(`\nDone. ${report.filter((r) => r.domains.length >= 3).length}/${slugs.length} businesses got 3 domains.`);
if (DRY_RUN) console.log("(dry run — no prospect records were modified)");
