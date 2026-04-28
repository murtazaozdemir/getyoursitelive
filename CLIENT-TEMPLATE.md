# Client Template System

> All docs for the standalone client site template — architecture, deployment,
> troubleshooting, decisions, and change log. This file is the single source
> of truth. Template repos themselves have no docs beyond a pointer back here.

---

## What it is

When a client pays $500, we deploy a **standalone site** on their own free Cloudflare account.
Static HTML/CSS/JS + a Cloudflare Worker (~6KB API). Zero npm dependencies. Nothing to maintain.
The client owns the domain and site forever.

## How it differs from the platform

| | Main Platform (this repo) | Client Template |
|---|---|---|
| Stack | Next.js 16 + React 19 + D1 | Static HTML/CSS/JS + Worker |
| Database | D1 (SQLite, 650+ rows) | KV (one JSON blob per site) |
| Images | R2 (shared bucket, our account) | R2 (client's own bucket) |
| Auth | JWT session cookies via jose | HMAC-SHA256 tokens in sessionStorage |
| Editor | React components + server actions | Vanilla JS, data-attribute-driven |
| Templates | `src/lib/templates/` (6 verticals) | Content seeded from generated `sample-content.json` |
| Hosting | Our Cloudflare account | Client's own free Cloudflare account |

## Workflow: platform to client

1. Prospect found via zip search on platform → added to D1 as a lead
2. We build/preview their site on the platform at `getyoursitelive.com/[slug]`
3. Client pays $500
4. Run the generation script (produces site files + content JSON)
5. Deploy Worker + Pages to the client's Cloudflare account
6. Seed content to KV
7. Hand them their password — they're independent forever

---

## Local folders

| Folder | Purpose |
|--------|---------|
| `/Users/Shared/CarMechanic/` | Main platform. Generation script at `scripts/generate-client-template.js` |
| `/Users/Shared/client-template-autorepair/` | Source repo for site files. Contains shared CSS/JS/Worker + vertical subfolders |
| `/Users/Shared/client-template-barber/` | Standalone generated output for barber (from generation script) |

## Live URLs (demo site)

| URL | What |
|-----|------|
| `seedreply.com` | Welcome page |
| `seedreply.com/autorepair` | Auto repair demo |
| `seedreply.com/barber` | Barber demo |

## Git repos

| Repo | Branch | Deploys to |
|------|--------|------------|
| `client-template/auto-repair` | `main` | Cloudflare Pages → `seedreply.com` |
| `murtazaozdemir/getyoursitelive` | `main` | Cloudflare Pages → `getyoursitelive.com` |

Cloudflare account for client demos: `client-template@proton.me`

---

## Architecture

```
site/                        Static site → Cloudflare Pages
  index.html                 Welcome/landing page
  autorepair/                Auto repair vertical
    index.html               Public site
    config.js                API_BASE (no SITE_KEY — uses default KV key "business")
    mysite/
      login.html             Login
      index.html             12-tab form editor
      edit.html              Inline WYSIWYG editor
  barber/                    Barber vertical (same structure)
    index.html
    config.js                API_BASE + SITE_KEY = "barber"
    mysite/ ...
  css/
    themes.css               Theme variables (4 themes: modern, industrial, luxury, friendly)
    styles.css               All site + edit-mode styles
    mysite.css               Form editor styles
  js/
    app.js                   Site renderer — data-driven with data-edit attributes
    editsite.js              Inline editor — discovers editable elements via data attributes
    mysite.js                12-tab form editor
    login.js                 Login form handler
    boot-public.js           Boot script for public pages (sets page title)
    boot-editor.js           Boot script for inline editor

worker/                      Cloudflare Worker API (~6KB)
  src/index.js               Endpoints: content CRUD, login, upload, auth check, image serve
  wrangler.toml              Worker config (KV + R2 bindings — IDs are placeholders)

sample-content.json          Generated content (seeded to KV)
```

### Multi-site support

The Worker supports multiple verticals via `?site=` query param on content endpoints.
Each vertical's content is stored as a separate KV key (e.g., `"business"` for auto-repair,
`"barber"` for barber). The `ALLOWED_SITES` set in the Worker allowlists valid keys.

Each subfolder has its own `config.js` that sets `SITE_KEY`. The shared JS files
(app.js, mysite.js, editsite.js) append `?site=SITE_KEY` to API calls when defined.

### Generation script

```
scripts/generate-client-template.js    Main script (Node.js)
scripts/extract-template.ts           Bridges TypeScript templates → JSON via tsx
```

The generation script reads content from the platform's TypeScript template system
(`src/lib/templates/*.ts`) — single source of truth. No hardcoded content in the script.
When a template is updated in the platform, the generation script picks it up automatically.

Currently supported verticals: `auto-repair`, `barber`.

---

## Data-driven inline editor

The editor uses ZERO hardcoded selectors. Editing is declared in `app.js` via attributes:

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `data-edit="json.path"` | Click-to-edit text | `data-edit="hero.headline"` |
| `data-edit-image="json.path"` | Upload/replace image | `data-edit-image="hero.heroImage"` |
| `data-edit-list="json.path"` | Add/remove list items | `data-edit-list="hero.whyBullets"` |
| `data-list-template="..."` | Default for new items | `data-list-template='{"name":"New"}'` |
| `data-visibility="key"` | Section show/hide toggle | `data-visibility="showStats"` |

Adding a new editable element = add the attribute in app.js. No editsite.js changes.
Scales to unlimited verticals without editor modifications.

### Important patterns

- **SVG + text:** Never put `contenteditable` on an element containing SVG. Wrap text in a `<span data-edit="path">` sibling to the icon.
- **Dynamic re-binding:** Service tabs and testimonial carousel replace innerHTML. `app.js` fires `window.onServiceTabChange` / `window.onTestimonialChange` callbacks so the editor re-binds.
- **Edit mode guards:** Stats counter animation and testimonial auto-advance are disabled when `#app` has `.edit-mode` class.
- **Cache busting:** All `<script>` and `<link>` tags use `?v=N`. Bump in ALL HTML files when changing JS/CSS.

---

## Auth

- HMAC-SHA256 tokens with 7-day TTL, nonce-based, generation counter
- Token in sessionStorage (dies on tab close; acceptable for single-admin tool)
- Worker validates token on every mutation
- Single admin password per site (`wrangler secret put PASSWORD`)
- Separate `TOKEN_SECRET` for HMAC signing
- Rate limiting: 5 login attempts per 15 min per IP (KV-backed lockout)

---

## Deployment Guide: Zero to Live

Complete process tested with seedreply.com (2026-04-28).

### Prerequisites

- `npx wrangler` available and authenticated to target Cloudflare account
- Node.js + `tsx` (`npx tsx --version`)

### Step 1: Generate the client template

Run from `/Users/Shared/CarMechanic/`:

```bash
node scripts/generate-client-template.js \
  "Business Name" \
  "(555) 123-4567" \
  "123 Main Street, City, ST 07011" \
  /path/to/output \
  "https://WORKER-NAME.ACCOUNT.workers.dev/api" \
  auto-repair
```

Arguments: name, phone, address, output-dir, worker-url (optional), vertical (default: `auto-repair`).

This copies source files from `client-template-autorepair/`, generates `config.js`, `_headers`, and `sample-content.json`.

### Step 2: Create Cloudflare resources

```bash
npx wrangler kv namespace create CONTENT
npx wrangler kv namespace create RATE_LIMIT
# Note the IDs — needed for wrangler.toml
```

Create an R2 bucket via dashboard (name: `site-uploads`).

### Step 3: Configure wrangler.toml

Edit `worker/wrangler.toml` — paste actual KV namespace IDs and R2 bucket name.

### Step 4: Deploy the Worker

```bash
cd worker && npx wrangler deploy
```

### Step 5: Set Worker secrets

```bash
npx wrangler secret put PASSWORD          # Admin password for site editor
npx wrangler secret put TOKEN_SECRET      # Random 32+ char string for HMAC signing
npx wrangler secret put ALLOWED_ORIGIN    # Pages URL(s), comma-separated
```

### Step 6: Update config.js

If Worker URL wasn't known at generation time, edit the subfolder's `config.js`:
```javascript
const API_BASE = "https://your-worker.account.workers.dev/api";
```

### Step 7: Seed content to KV

```bash
cd worker
npx wrangler kv key put "business" --path ../sample-content.json --binding CONTENT --remote
```

**The KV key MUST be `"business"`** — that's `CONTENT_KEY` in the Worker.
For multi-site setups, use the site key name (e.g., `"barber"`).

### Step 8: Deploy Pages

Connect site/ to GitHub → Cloudflare Pages, or:
```bash
cd site && npx wrangler pages deploy . --project-name your-site
```

Production branch: `main`.

### Step 9: Custom domain (optional)

Add in Cloudflare Pages → Custom domains. Update `ALLOWED_ORIGIN` to include it.

### Step 10: Verify

1. Visit site — all sections render
2. Browser console — no CSP/CORS/fetch errors
3. Editor — `/mysite/login.html` → sign in → edit

---

## Troubleshooting

### "Site loading... Content not yet configured."

KV not seeded, or seeded with wrong key. Must be `"business"` (not `"content"`).

```bash
npx wrangler kv key put "business" --path ../sample-content.json --binding CONTENT --remote
```

### CSP errors in browser console

`_headers` file `connect-src` doesn't include Worker origin. Fix:
```
connect-src 'self' https://your-worker.account.workers.dev
```

Also check: `style-src` needs `'unsafe-inline' https://fonts.googleapis.com`, `frame-src` needs `https://maps.google.com https://www.google.com`.

### CORS errors

Worker's `ALLOWED_ORIGIN` doesn't include site origin:
```bash
npx wrangler secret put ALLOWED_ORIGIN
# https://customdomain.com,https://your-site.pages.dev
```

### Pushed to wrong branch

Cloudflare Pages Production deploys from `main`. Other branches create Preview deployments.
```bash
git push origin your-branch:main
```

---

## Security

All 19 audit findings + 5 Red Team simulation findings resolved. Key hardening:

- HMAC-based `timingSafeEqual` (eliminates length-leak side channel)
- Separate `TOKEN_SECRET` from `PASSWORD`
- Rate limiting: 5 attempts/15 min per IP, KV-backed lockout
- CORS locked to `ALLOWED_ORIGIN` (no wildcards)
- CSP: `script-src 'self'`, zero inline scripts
- SVG removed from upload allow-list (stored XSS vector)
- 512KB payload limit on content saves
- Path traversal prevention on image endpoint
- `CF-Connecting-IP` only for rate limiting (not spoofable `X-Forwarded-For`)

Full details: `SECURITY.md` in the template repo.

---

## Status

### Done
- [x] Public site renders all sections from JSON
- [x] 4 themes working (modern, industrial, luxury, friendly)
- [x] Inline WYSIWYG editor + 12-tab form editor
- [x] Worker API: content CRUD, auth, image upload to R2
- [x] Data-driven editor (zero hardcoded selectors)
- [x] Full security audit + hardening
- [x] `/admin` → `/mysite` rename
- [x] Generation script reads from platform TypeScript templates
- [x] Multi-site support (autorepair + barber on same Pages deploy)
- [x] seedreply.com deployed and verified

### TODO
- [ ] Extract shared utils (`esc()`, `getNestedValue()`, `setNestedValue()` duplicated in 3 files)
- [ ] Polish luxury + friendly themes
- [ ] Favicon + meta tags
- [ ] Booking form (removed — no email sending in Worker yet)

---

## Decisions Made

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-28 | Multi-site via `?site=` query param | Same Worker serves multiple verticals; each subfolder has own config.js with SITE_KEY |
| 2026-04-28 | Relative paths in JS redirects | Absolute `/mysite/login.html` broke in subfolders; relative `login.html` works everywhere |
| 2026-04-28 | Verticals as subfolders under one Pages deploy | Simpler than separate Cloudflare projects; shared CSS/JS/Worker |
| 2026-04-28 | Generation script reads from platform templates via tsx | Single source of truth; no hardcoded content to drift |
| 2026-04-27 | Data-driven editor via data attributes | Scales to unlimited verticals without editsite.js changes |
| 2026-04-27 | sessionStorage for auth tokens | Simpler Worker; token dies on tab close; acceptable for admin-only tool |
| 2026-04-27 | KV not D1 for storage | One JSON blob per site; no relational needs; KV is simpler |
| 2026-04-27 | Zero npm deps in site | Client gets plain files; no build step; nothing to break |

## What We've Tried and FAILED

| Date | What | Why it failed |
|------|------|---------------|
| 2026-04-28 | Seeding KV with key `"content"` | Worker reads `CONTENT_KEY = "business"`. Site showed "loading" until re-seeded. |
| 2026-04-28 | Pushing to `client-template` branch for production | Cloudflare Pages Production deploys from `main`. Push went to Preview. |
| 2026-04-28 | `connect-src 'self'` in CSP with cross-origin Worker | Browser blocked fetch. Must include Worker origin in connect-src. |
| 2026-04-27 | contenteditable on elements with SVG children | Editing modifies SVG; cursor jumps; breaks rendering |
| 2026-04-27 | Hardcoded CSS selectors in editor | Broke on markup changes; didn't scale to new verticals |

---

## Change Log

### 2026-04-28 — Multi-site, barber vertical, deployment guide

- Auto repair moved from root to `/autorepair` subfolder
- Barber demo added at `/barber`
- Root page: simple "Welcome to Client Sites"
- Worker: `?site=` param on content GET/POST, `ALLOWED_SITES` allowlist
- JS redirects changed from absolute to relative paths
- Generation script reads from platform TypeScript templates via `extract-template.ts`
- Local folder renamed: `client-template` → `client-template-autorepair`
- seedreply.com fully deployed and verified
- Full deployment guide written

### 2026-04-27 — Security hardening + path rename

- HMAC-based `timingSafeEqual`, separate `TOKEN_SECRET`, rate limiting, CORS lock
- All inline scripts extracted to external files, CSP enforced
- SVG removed from upload allow-list, 512KB payload limit
- `/admin` → `/mysite`, `editor.js` → `editsite.js`, `admin.js` → `mysite.js`

### 2026-04-27 — Data-driven editor + audit

- Rewrote editor from ~700 lines hardcoded to ~350 lines data-driven
- Every text element gets `data-edit` attribute, editor discovers automatically
- SVG+text conflicts fixed, animation disabled in edit mode
