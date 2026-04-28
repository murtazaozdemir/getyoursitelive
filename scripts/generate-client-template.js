#!/usr/bin/env node
/**
 * Generate Client Template
 *
 * Produces a standalone client template package from the master template repo
 * (client-template-autorepair) + platform template data. Single source of truth —
 * shared JS/CSS comes from the master, content comes from platform templates.
 *
 * Usage:
 *   node scripts/generate-client-template.js <name> <phone> <address> <output-dir> [worker-url] [vertical]
 *
 * Example:
 *   node scripts/generate-client-template.js "Star Auto" "(555) 123-4567" "78 Arlington Ave, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.getyoursitelive.workers.dev/api auto-repair
 *
 * Available verticals: auto-repair (default), auto-body, barber, restaurant, plumber
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Cache-bust version — bump when shared JS/CSS changes
const CACHE_VERSION = 10;

// ─── Shared JS files to copy from master ─────────────────────────────
const SHARED_JS = ["app.js", "mysite.js", "editsite.js", "login.js", "boot-public.js", "boot-editor.js"];
const SHARED_CSS = ["styles.css", "themes.css", "mysite.css"];

// ─── Extract template data from platform TypeScript ──────────────────

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

// ─── Transform platform Business → client template JSON ─────────────

function platformToClientTemplate(business) {
  const ct = JSON.parse(JSON.stringify(business));

  // Key mapping: teamMembers → team
  if (ct.teamMembers) {
    ct.team = ct.teamMembers;
    delete ct.teamMembers;
  }

  // Strip booking form fields (client template has no email sending)
  if (ct.contact) {
    delete ct.contact.bookButtonLabel;
    delete ct.contact.extraServiceOptions;
    if (ct.contact.heading === "Book Your Service") {
      ct.contact.heading = "Contact Us";
    }
    if (ct.contact.description && ct.contact.description.includes("confirm timing and pricing")) {
      ct.contact.description = "Get in touch — we'd love to hear from you.";
    }
  }

  // Strip platform-only fields
  delete ct.description;

  return ct;
}

// ─── Copy specific files ─────────────────────────────────────────────

function copyFiles(srcDir, destDir, files) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of files) {
    const src = path.join(srcDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(destDir, file));
    } else {
      console.warn(`  WARNING: Source file not found: ${src}`);
    }
  }
}

// ─── Copy directory recursively (for worker/) ────────────────────────

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

// ─── Generate HTML files with absolute paths ─────────────────────────

const V = CACHE_VERSION;

function htmlPublic() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Loading...</title>
  <link rel="stylesheet" href="/css/themes.css?v=${V}">
  <link rel="stylesheet" href="/css/styles.css?v=${V}">
</head>
<body>
  <div id="app"></div>
  <script src="/js/config.js?v=${V}"></script>
  <script src="/js/app.js?v=${V}"></script>
  <script src="/js/boot-public.js?v=${V}"></script>
</body>
</html>
`;
}

function htmlFormEditor() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Editor</title>
  <link rel="stylesheet" href="/css/themes.css?v=${V}">
  <link rel="stylesheet" href="/css/styles.css?v=${V}">
  <link rel="stylesheet" href="/css/mysite.css?v=${V}">
</head>
<body>
  <div id="adminRoot"></div>
  <script src="/js/config.js?v=${V}"></script>
  <script src="/js/mysite.js?v=${V}"></script>
</body>
</html>
`;
}

function htmlInlineEditor() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inline Editor</title>
  <link rel="stylesheet" href="/css/themes.css?v=${V}">
  <link rel="stylesheet" href="/css/styles.css?v=${V}">
</head>
<body>
  <div id="app"></div>
  <script src="/js/config.js?v=${V}"></script>
  <script src="/js/app.js?v=${V}"></script>
  <script src="/js/editsite.js?v=${V}"></script>
  <script src="/js/boot-editor.js?v=${V}"></script>
</body>
</html>
`;
}

function htmlLogin() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In</title>
  <link rel="stylesheet" href="/css/themes.css?v=${V}">
  <link rel="stylesheet" href="/css/styles.css?v=${V}">
</head>
<body>
  <div class="login-page" data-theme="modern">
    <div class="login-card">
      <h1 class="login-title">Site Editor</h1>
      <p class="login-subtitle">Enter your password to edit your website.</p>
      <form class="login-form" id="loginForm">
        <div id="loginError" class="login-error" style="display:none"></div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-input" type="password" name="password" required autofocus>
        </div>
        <button type="submit" class="btn-primary">Sign In</button>
      </form>
    </div>
  </div>
  <script src="/js/config.js?v=${V}"></script>
  <script src="/js/login.js?v=${V}"></script>
</body>
</html>
`;
}

// ─── Strip multi-site lines from Worker ──────────────────────────────

function stripMultiSiteFromWorker(workerCode) {
  return workerCode
    // Remove ALLOWED_SITES declaration
    .replace(/^const ALLOWED_SITES\s*=.*;\n/m, "")
    // GET: replace site param lookup with direct CONTENT_KEY
    .replace(
      /const siteParam = url\.searchParams\.get\("site"\);\n\s*const siteKey = siteParam && ALLOWED_SITES\.has\(siteParam\) \? siteParam : CONTENT_KEY;\n\s*const data = await env\.CONTENT\.get\(siteKey,/m,
      "const data = await env.CONTENT.get(CONTENT_KEY,"
    )
    // POST: replace site param lookup with direct CONTENT_KEY
    .replace(
      /const saveSiteParam = url\.searchParams\.get\("site"\);\n\s*const saveSiteKey = saveSiteParam && ALLOWED_SITES\.has\(saveSiteParam\) \? saveSiteParam : CONTENT_KEY;\n\s*await env\.CONTENT\.put\(saveSiteKey,/m,
      "await env.CONTENT.put(CONTENT_KEY,"
    );
}

// ─── Main ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    console.error("Usage: node generate-client-template.js <name> <phone> <address> <output-dir> [worker-url] [vertical]");
    console.error('Example: node generate-client-template.js "Star Auto" "(555) 123-4567" "78 Arlington Ave, Clifton, NJ 07011" /Users/Shared/client-template-2 https://auto-repair-api.workers.dev/api auto-repair');
    console.error("\nAvailable verticals: auto-repair (default), auto-body, barber, restaurant, plumber");
    process.exit(1);
  }

  const [name, phone, address, outputDir, workerUrl, vertical] = args;
  const verticalId = vertical || "auto-repair";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  console.log(`\nGenerating client template for "${name}"...`);
  console.log(`  Slug: ${slug}`);
  console.log(`  Vertical: ${verticalId}`);
  console.log(`  Output: ${outputDir}\n`);

  // Source = master template repo
  const templateSource = path.resolve(__dirname, "../../client-template-autorepair");
  if (!fs.existsSync(templateSource)) {
    console.error(`ERROR: Master template not found at ${templateSource}`);
    console.error("The client-template-autorepair repo must be a sibling of the CarMechanic project.");
    process.exit(1);
  }

  // 1. Extract business data from platform template
  console.log("1. Extracting template data from platform...");
  const platformBusiness = extractTemplateData(verticalId, slug, name, phone, address);
  const clientContent = platformToClientTemplate(platformBusiness);

  // 2. Copy shared JS files
  console.log("2. Copying shared JS files...");
  copyFiles(path.join(templateSource, "site/js"), path.join(outputDir, "site/js"), SHARED_JS);

  // 3. Copy shared CSS files
  console.log("3. Copying shared CSS files...");
  copyFiles(path.join(templateSource, "site/css"), path.join(outputDir, "site/css"), SHARED_CSS);

  // 4. Generate HTML files with absolute paths
  console.log("4. Generating HTML files...");
  fs.writeFileSync(path.join(outputDir, "site/index.html"), htmlPublic());
  fs.mkdirSync(path.join(outputDir, "site/mysite"), { recursive: true });
  fs.writeFileSync(path.join(outputDir, "site/mysite/index.html"), htmlFormEditor());
  fs.writeFileSync(path.join(outputDir, "site/mysite/edit.html"), htmlInlineEditor());
  fs.writeFileSync(path.join(outputDir, "site/mysite/login.html"), htmlLogin());

  // 5. Generate config.js
  const apiBase = workerUrl || "/api";
  console.log(`5. Writing config.js (API_BASE = "${apiBase}")...`);
  fs.writeFileSync(path.join(outputDir, "site/js/config.js"), `/**
 * Site config — loaded by all pages.
 * API_BASE points to the Cloudflare Worker API.
 */
const API_BASE = "${apiBase}";
`);

  // 6. Copy worker and strip multi-site logic
  console.log("6. Copying worker (standalone mode)...");
  copyDirSync(path.join(templateSource, "worker"), path.join(outputDir, "worker"));
  const workerPath = path.join(outputDir, "worker/src/index.js");
  const workerCode = fs.readFileSync(workerPath, "utf-8");
  fs.writeFileSync(workerPath, stripMultiSiteFromWorker(workerCode));

  // 7. Generate _headers with correct CSP
  const connectSrc = workerUrl ? `'self' ${new URL(workerUrl).origin}` : "'self'";
  console.log(`7. Writing _headers (connect-src = "${connectSrc}")...`);
  fs.writeFileSync(path.join(outputDir, "site/_headers"), `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https:; connect-src ${connectSrc}; frame-src https://maps.google.com https://www.google.com; form-action 'self'; base-uri 'self'; frame-ancestors 'none'
`);

  // 8. Write sample-content.json
  console.log("8. Writing sample-content.json...");
  const contentPath = path.join(outputDir, "sample-content.json");
  fs.writeFileSync(contentPath, JSON.stringify(clientContent, null, 2) + "\n");

  // 9. Copy supporting files
  for (const file of [".gitignore", "CLAUDE.md"]) {
    const src = path.join(templateSource, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(outputDir, file));
    }
  }

  console.log("\n✓ Client template generated successfully!");
  console.log(`  Output: ${outputDir}`);
  console.log(`  Vertical: ${verticalId}`);
  console.log(`  Content: ${contentPath}`);
  console.log(`\nNext steps:`);
  const step = { n: 1 };
  if (!workerUrl) {
    console.log(`  ${step.n++}. Re-run with worker-url once Worker is deployed, OR update ${outputDir}/site/js/config.js`);
  }
  console.log(`  ${step.n++}. Deploy worker/: cd ${outputDir}/worker && npx wrangler deploy`);
  console.log(`  ${step.n++}. Set secrets: wrangler secret put PASSWORD && wrangler secret put TOKEN_SECRET`);
  console.log(`  ${step.n++}. Seed KV: wrangler kv key put --binding CONTENT business --path ${contentPath} --remote`);
  console.log(`  ${step.n++}. Deploy site/: wrangler pages deploy ${outputDir}/site`);
  console.log("");
}

main();
