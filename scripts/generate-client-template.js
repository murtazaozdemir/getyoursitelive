#!/usr/bin/env node
/**
 * Generate Client Template
 *
 * Reads the platform's template data (via extract-template.ts) and produces
 * a complete client template package for deployment to a client's Cloudflare account.
 *
 * The content comes from the platform's TypeScript template system (single source of truth).
 * When a template is updated in src/lib/templates/, this script picks up the changes automatically.
 *
 * Usage:
 *   node scripts/generate-client-template.js <business-name> <phone> <address> <output-dir> [worker-url] [vertical]
 *
 * Example:
 *   node scripts/generate-client-template.js "Seed Reply Auto" "(555) 123-4567" "123 Main Street, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.getyoursitelive.workers.dev/api auto-repair
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Extract template data from platform TypeScript ───

function extractTemplateData(vertical, slug, name, phone, address) {
  const extractScript = path.resolve(__dirname, "extract-template.ts");
  const projectRoot = path.resolve(__dirname, "..");

  try {
    const result = execSync(
      `npx tsx "${extractScript}" "${vertical}" "${slug}" "${name}" "${phone}" "${address}"`,
      { cwd: projectRoot, encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] }
    );
    return JSON.parse(result);
  } catch (err) {
    console.error(`ERROR: Failed to extract template data for vertical "${vertical}".`);
    console.error(err.stderr || err.message);
    process.exit(1);
  }
}

// ─── Transform platform Business → client template JSON ───

function platformToClientTemplate(business) {
  // Deep clone
  const ct = JSON.parse(JSON.stringify(business));

  // Key mapping: teamMembers → team
  if (ct.teamMembers) {
    ct.team = ct.teamMembers;
    delete ct.teamMembers;
  }

  // Strip booking form fields from contact (client template has no email sending)
  if (ct.contact) {
    delete ct.contact.bookButtonLabel;
    delete ct.contact.extraServiceOptions;
    // Simplify contact heading for info-only display
    if (ct.contact.heading === "Book Your Service") {
      ct.contact.heading = "Contact Us";
    }
    if (ct.contact.description && ct.contact.description.includes("confirm timing and pricing")) {
      ct.contact.description = "Get in touch — we'd love to hear from you.";
    }
  }

  // Strip description field (platform-only, from Google Maps)
  delete ct.description;

  return ct;
}

// ─── Copy directory recursively ───

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".wrangler") continue;
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ─── Main ───

function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("Usage: node generate-client-template.js <name> <phone> <address> <output-dir> [worker-url] [vertical]");
    console.error('Example: node generate-client-template.js "Seed Reply Auto" "(555) 123-4567" "123 Main Street, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.getyoursitelive.workers.dev/api auto-repair');
    process.exit(1);
  }

  const [name, phone, address, outputDir, workerUrl, vertical] = args;
  const verticalId = vertical || "auto-repair";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  console.log(`\nGenerating client template for "${name}"...`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Vertical: ${verticalId}`);
  console.log(`  Output: ${outputDir}\n`);

  // 1. Extract business data from platform template (TypeScript → JSON)
  console.log("Extracting template data from platform...");
  const platformBusiness = extractTemplateData(verticalId, slug, name, phone, address);

  // 2. Transform to client template format
  const clientContent = platformToClientTemplate(platformBusiness);

  // 3. Source = client-template static files
  const templateSource = path.resolve(__dirname, "../../client-template");
  if (!fs.existsSync(templateSource)) {
    console.error(`ERROR: Client template source not found at ${templateSource}`);
    process.exit(1);
  }

  // 4. Copy static site files
  console.log("Copying site files...");
  copyDirSync(path.join(templateSource, "site"), path.join(outputDir, "site"));

  // 4b. Write config.js with the correct API_BASE
  const apiBase = workerUrl || "/api";
  const configContent = `/**
 * Shared config — loaded by all pages.
 *
 * API_BASE points to the Worker API.
 * - Same domain (Worker route on Pages): use "/api"
 * - Separate Worker subdomain: use full Worker URL
 */
const API_BASE = "${apiBase}";
`;
  fs.writeFileSync(path.join(outputDir, "site/js/config.js"), configContent);
  console.log(`Writing config.js with API_BASE = "${apiBase}"...`);

  // 4c. Write _headers with correct CSP (include Worker URL in connect-src if cross-origin)
  const connectSrc = workerUrl ? `'self' ${new URL(workerUrl).origin}` : "'self'";
  const headersContent = `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https:; connect-src ${connectSrc}; frame-src https://maps.google.com https://www.google.com; form-action 'self'; base-uri 'self'; frame-ancestors 'none'
`;
  fs.writeFileSync(path.join(outputDir, "site/_headers"), headersContent);
  console.log(`Writing _headers with connect-src = "${connectSrc}"...`);

  // 5. Copy worker files
  console.log("Copying worker files...");
  copyDirSync(path.join(templateSource, "worker"), path.join(outputDir, "worker"));

  // 6. Write the generated content JSON
  console.log("Writing sample-content.json...");
  const contentPath = path.join(outputDir, "sample-content.json");
  fs.writeFileSync(contentPath, JSON.stringify(clientContent, null, 2) + "\n");

  // 7. Copy supporting files
  for (const file of [".gitignore", "CLAUDE.md", "SECURITY.md", "AUDIT.md"]) {
    const src = path.join(templateSource, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outputDir, file));
    }
  }

  console.log("\nClient template generated successfully!");
  console.log(`  Output directory: ${outputDir}`);
  console.log(`  Content JSON: ${contentPath}`);
  console.log(`\nNext steps:`);
  if (!workerUrl) {
    console.log(`  1. Re-run with worker-url param once Worker is deployed, OR manually update ${outputDir}/site/js/config.js`);
  }
  console.log(`  ${workerUrl ? "1" : "2"}. Deploy worker/ to client's Cloudflare account`);
  console.log(`  ${workerUrl ? "2" : "3"}. Deploy site/ to Cloudflare Pages`);
  console.log(`  ${workerUrl ? "3" : "4"}. Seed KV with: wrangler kv:key put --binding CONTENT business '$(cat ${contentPath})' --remote\n`);
}

main();
