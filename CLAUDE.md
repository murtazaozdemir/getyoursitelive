@AGENTS.md

# Project: Multi-Tenant Local Business Website Builder

## What this is

A Next.js template for building $500 flat-fee websites for local businesses
(auto repair shops, body shops, barbers, restaurants, plumbers, etc.). Each
business is a row in Cloudflare D1 with a minimal JSON blob (name, address,
phone, visibility). All default content comes from vertical templates at
render time. Served via dynamic routing at `/[slug]`.

The site is sold by **Murtaza Ozdemir** (Clifton, NJ) under the brand
**"Get Your Site Live"** for a one-time $500, no monthly fees, the client
owns the domain and site forever.

## Architecture summary

- **Stack:** Next.js 16 (Turbopack) · React 19 · TypeScript · Tailwind 4 · Cloudflare Pages (hosting) · Cloudflare D1 (SQLite edge DB) · Cloudflare R2 (file uploads) · Server-rendered
- **Auth:** signed-JWT session cookies via `jose` (HS256, 7-day TTL). Roles: `admin` (platform-wide) and `owner` (one slug).
- **Data queries:** `src/lib/db.ts` reads/writes via D1 (SQLite). `src/lib/db-d1.ts` returns the D1 binding via `getRequestContext().env.DB`. All queries async.
- **Routing:**
  - `/` → editorial landing page selling the service (Fraunces serif design)
  - `/[slug]` → per-business public site
  - `/[slug]/admin` → per-shop tabbed editor (Form mode)
  - `/[slug]/admin/edit` → per-shop inline WYSIWYG editor (Inline mode)
  - `/[slug]/admin/login` → branded per-shop login
  - `/admin`, `/admin/login`, `/admin/business/new` → platform-wide admin (Murtaza only)
  - `/api/auth/{login,logout,me}` → auth endpoints
  - `/api/upload` → authenticated file upload (saves to `public/uploads/{slug}/`)
  - `/not-found.tsx` → 404
- **Template-at-render architecture:** DB stores only what's unique per business (name, address, phone, visibility, owner customizations). `rowToBusiness()` in `db.ts` fills all missing sections from the vertical template (`src/lib/templates/`) at load time. Adding a new vertical = one template file + one line in the registry.
- **Data flow:**
  - D1 row → `rowToBusiness()` (fills template defaults) → `getBusinessBySlug()` (server) → `<BusinessProvider>` (client context) → `useBusiness()` hook in components
  - In Inline mode, `<EditModeProvider>` sits between and holds live editable state; changes auto-save via server action
- **Editing surfaces:**
  - **Form mode** — tabbed forms, in-memory edits, explicit Save. Best for bulk work, reordering, structured fields.
  - **Inline mode** — WYSIWYG click-to-edit on the actual public page. Every text is clickable. Every image has an Upload/Replace/Remove pill. Every section has a Visible/Hidden toggle. Changes auto-save.

## Important file locations

```
public/
  uploads/{slug}/         User-uploaded images (logo, hero, about, team photos).
                          Gitignored; produced by /api/upload.

src/lib/
  db.ts                   Server-only query layer (async, via D1) + template-at-render fallback
  db-d1.ts                Returns D1Database binding via getRequestContext()
  business-types.ts       Business interface, visibility flags, HoursSchedule
  business-validation.ts  Slug/hours/IDs validator
  business-context.tsx    BusinessProvider + useBusiness() hook
  edit-mode-context.tsx   EditModeProvider + useEditMode() — live state + auto-save
  hours.ts                Open-status & multi-day formatting utilities
  service-icons.tsx       Service ID → Lucide icon component (delegates to template icon map)
  users.ts                bcrypt verify + role helpers
  session.ts              Signed-JWT cookie sessions (jose)
  slugify.ts              Unique slug generation (name → slug, with city/state dedup)
  templates/
    types.ts              VerticalTemplate interface
    shared.ts             Shared defaults (hours, visibility, footer, navLabels, sectionTitles)
    registry.ts           Category string → template lookup + getAllTemplates/getAllCategories
    auto-repair.ts        Auto repair shops (default vertical)
    auto-body.ts          Auto body / collision / detailing shops
    barber.ts             Barber shops
    restaurant.ts         Restaurants
    plumber.ts            Plumbers
    generic.ts            Fallback for unknown categories

src/components/site/
  home-page.tsx           Top-level composer — section order lives here
  home-chrome.tsx         SiteHeader (with BrandMark), Topbar, theme switcher
  home-primary-sections.tsx    Hero / Stats / About / Services
  home-secondary-sections.tsx  Team / Testimonials / Emergency / Pricing / FAQ / Contact / Footer
  deals-section.tsx            Promotional offers section
  section-h2.tsx               Editable section heading helper (backed by sectionTitles)
  open-status.tsx              Live "Open now / Closed" pill
  hours-list.tsx               Multi-day hours list (edit-aware)

src/components/editable/
  editable-text.tsx       Click-to-edit text primitive
  editable-list.tsx       Reorder / remove / + Add wrapper
  editable-image.tsx      File picker + uploader (hits /api/upload)
  save-indicator.tsx      Floating "Saving / Saved" pill
  section-block.tsx       Section wrapper with visibility toggle + hidden-banner
  editable.css            All edit-mode affordance styles

src/app/
  page.tsx                           Landing page (editorial Fraunces design)
  layout.tsx                         Root layout
  globals.css                        Theme variables + all site CSS
  middleware.ts                      Gates /admin/* and /{slug}/admin/*
  not-found.tsx                      404
  [slug]/
    page.tsx                         Per-business public site
    admin/
      page.tsx                       Tabbed Form editor (shell)
      editor.tsx                     Tab switcher + toolbar
      actions.ts                     Server actions (save/create/delete)
      shop-admin-header.tsx          Admin top bar with Inline/Form mode toggle
      layout.tsx                     Per-shop admin shell (header + footer)
      login/page.tsx + login-form    Branded per-shop login
      _tabs/                         12 form-mode tab components
      edit/
        page.tsx                     Inline editor route
        editable-home.tsx            Wraps HomePage in EditModeProvider
  admin/
    page.tsx                         Platform dashboard (all businesses)
    login/                           Platform login
    business/new/                    Create a new business
    layout.tsx + admin-header.tsx    Platform admin shell
    actions.ts                       (Shared server actions live here)
    admin.css                        Admin form styles
  api/
    auth/{login,logout,me}/route.ts  Auth endpoints
    upload/route.ts                  Authenticated file upload
```

## Theme system

Four themes via CSS variables, applied through `data-theme` attribute on a
wrapper element (not just `:root`). Each business's seeded theme auto-loads
on visit; user can switch via the header dropdown (session-only, not persisted).

- **`industrial`** — dark, orange accent, **Chakra Petch** display font
- **`modern`** — warm off-white, deep teal accent, **Fraunces** serif display
- **`luxury`** — black/gold, Geist (not yet polished)
- **`friendly`** — cream/coral, Geist (not yet polished)

Star Auto Repair Center seeds with `modern` (the primary/only demo business).

## Deployment & infrastructure

**Live site:** `https://getyoursitelive.com` (and `www.`)

**Platform:** Cloudflare Workers (via OpenNext). The DNS points to a Worker, NOT Pages Functions.

**CRITICAL: How to deploy:**
```bash
npx @opennextjs/cloudflare build   # builds Next.js → .open-next/
npx wrangler deploy                # deploys worker + assets to Cloudflare
```
**Git push alone does NOT deploy the worker.** The Cloudflare Pages GitHub integration only deploys static assets. New/changed server-side routes (pages, API routes, server actions) require `wrangler deploy` to take effect. If a new route returns 500 after push, run `wrangler deploy` — don't chase code bugs.

**Build command:** `npx @opennextjs/cloudflare build` (builds Next.js then processes output into `.open-next/`).

**Bindings (wrangler.toml):**
- `DB` → Cloudflare D1 database `getyoursitelive-d1`
- `R2` → Cloudflare R2 bucket for file uploads

**Why Cloudflare over Vercel:**
- D1 and R2 are effectively free at this scale; Vercel Postgres/Blob get expensive quickly
- Better long-term cost as client count grows
- Trade-off: harder to set up (see lessons below)

**Why NOT to switch back to Vercel:**
The migration from Vercel → Cloudflare was painful. Don't redo it. Vercel Postgres would have been simpler to set up initially, but it's done now and stable. Every new business is just a D1 row — no config changes needed.

## Cloudflare edge runtime — hard-learned rules

These are non-obvious constraints discovered during the Vercel → Cloudflare migration. Breaking any of these causes silent 500s in production.

**1. Never use `import "server-only"` in lib files**
`server-only` v0.0.1 has two export conditions: `"react-server"` (safe) and `"default"` (throws with "This module cannot be imported from a Client Component"). The Cloudflare edge worker bundler resolves `"default"`, not `"react-server"` → every route that imports an affected lib crashes at runtime. Remove `import "server-only"` from all files in `src/lib/`. Already done as of `eabd495`.

**2. Every dynamic route/page must export `export const runtime = "edge"`**
`@opennextjs/cloudflare` only bundles routes marked as edge. Routes without this export are silently skipped and serve stale cached versions from older deploys. Add to every file in `src/app/**/{page,route,layout}.ts(x)`. This was the cause of a hard-to-debug issue where the migrate route appeared deployed but served old code.

**3. `src/middleware.ts` — not `src/proxy.ts`**
Next.js 16 renamed the middleware convention from `middleware.ts` → `proxy.ts`. But the Cloudflare build tooling was written for the old name and only recognises `middleware.ts`. Keep the file as `middleware.ts` despite the deprecation warning. Do NOT add `export const runtime = "edge"` to it — middleware is always edge, and adding the export causes a build error.

**4. D1 binding is only available inside a request context**
`getCloudflareContext()` (from `@opennextjs/cloudflare`) throws if called at module load time. Always call `getD1()` inside a route handler, server action, or server component — never at the top level of a module.

**5. Local dev uses `--experimental-edge` flag**
Run dev with `npx wrangler pages dev` or ensure the dev server wires up miniflare. Plain `next dev` won't have D1 bindings.

**6. Never use `db.exec()` for D1 queries — use `db.prepare().run()`**
D1's `exec()` method is unreliable on the Cloudflare Pages edge runtime and causes silent 500s. Always use `db.prepare("...").run()` for DDL and write operations, and `db.prepare("...").bind(...).first()` / `.all()` for reads. This applies to `CREATE TABLE`, `INSERT`, `UPDATE`, and all other SQL statements. Wrap DDL in try-catch since `CREATE TABLE IF NOT EXISTS` can still throw on some edge deployments.

## Convention notes

- **No inline `style={{...}}` props in components.** All visual decisions live
  in `globals.css`. Components carry semantic class names only.
- **Server components vs client components:** Database access stays server-side
  via `import "server-only"` guards. Anything using hooks is `"use client"`.
- **React 19 strictness:** The `react-hooks/static-components` rule fires when
  components are "created" during render. Pattern: instead of returning a
  component reference (`const Icon = pickIcon(id); <Icon />`), return JSX
  directly via a wrapper component (`<ServiceIcon id={id} />`).
## Conventions for adding a new business

1. Copy `data/businesses/star-auto.json` → `data/businesses/{new-slug}.json`
2. Edit the slug, name, address, phone, hours, theme, and all content fields
3. Add an owner entry to `data/users.json` with `"ownedSlug": "{new-slug}"`
4. `npm run dev` and visit `/{new-slug}`

## Run scripts

```bash
npm run dev        # Next.js dev server (run from /Users/Shared/CarMechanic)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
```

---

# ✅ DONE

## Phase 1 — DB infrastructure
- [x] SQLite schema with businesses + bookings tables
- [x] Init + seed scripts (`npm run db:setup`)
- [x] Server-only query layer (`getBusinessBySlug`, `listBusinesses`, `getAllSlugs`)
- [x] One active business: Star Auto Repair Center (Clifton NJ, modern theme)

## Phase 2 — Multi-tenant routing
- [x] Dynamic route `/[slug]/page.tsx` with `generateStaticParams()`
- [x] Per-page metadata via `generateMetadata()` (title, OG, Twitter)
- [x] BusinessProvider + useBusiness() hook
- [x] Refactored 4 components (home-page, home-chrome, home-primary-sections, home-secondary-sections) from direct imports → context
- [x] Landing page at `/` with editorial Fraunces design (replaced original site)
- [x] 404 page (`not-found.tsx`)
- [x] Updated layout, sitemap, robots
- [x] `serverExternalPackages: ["better-sqlite3"]` in next.config

## Theme system
- [x] Per-business theme auto-loads from DB on visit (Zustand state, not persisted)
- [x] Theme support via `data-theme` on any wrapping element (not just :root)
- [x] **Modern** theme overhauled — warm off-white, deep teal accent, Fraunces display
- [x] **Industrial** theme strengthened — Chakra Petch display font
- [x] Custom theme switcher dropdown — icon + checkmark + animated open/close
- [x] Removed inline theme bootstrap script (was throwing React 19 errors)
- [x] All inline `style={{}}` props moved to semantic CSS classes

## Per-business page polish
- [x] Hero redesigned: 2-column with photo on right (no full-bleed dark overlay)
- [x] Hero card "Why our customers choose us" sits in left column under CTAs
- [x] Brand name sized up + uses theme display font
- [x] Trust pills + Book Now button removed (per user feedback)
- [x] City/year derived from DB instead of hardcoded "Springfield/2009"
- [x] Service icons (Lucide via `<ServiceIcon id="..." />`)
- [x] Deals/promotions section with cards, badges, strikethrough pricing
- [x] Live open/closed status (`<OpenStatus />`) — re-evaluates every 60s
- [x] Multi-day hours list with full day names, smart day-range collapsing
- [x] Reordered section flow (About moved up below Hero; Process removed; Emergency Banner moved to before Contact)
- [x] Pexels images replacing flaky Unsplash URLs

## Landing page (`/`)
- [x] Editorial design — warm cream paper, Fraunces serif, JetBrains Mono accents
- [x] Crop marks in corners, paper grain texture, registration marks
- [x] Section numbering (001, 002, 003…) like a magazine
- [x] Asymmetric layout, no card-grid clichés
- [x] Contact form (Formspree-ready, falls back to console log in dev)
- [x] All "Murtaza" / "Clifton" / personal email references removed from visible UI
- [x] Brand named "Get Your Site Live"

## DB schema additions
- [x] `hours_schedule` JSON column (structured weekly hours for open/closed logic)
- [x] `deals` JSON column (promotional offers)
- [x] `show_deals` visibility toggle
- [x] All visibility flags wired up: services, team, testimonials, booking, hours, deals

## Documents created (in `mnt/CarMechanic/`)
- [x] `HANDOUT-PROPOSAL-StarAuto.md` — finalized customer-facing proposal
- [x] `HANDOUT-PROPOSAL-StarAuto.docx` — Word version with full design (navy, orange, price stamp, etc.)
- [x] `INTERNAL-Purpose-and-Pitch.md` — Murtaza's "why I'm doing this" + elevator pitches + scripts
- [x] `frontend-design.skill` — installed design skill for distinctive frontend work

---

# 📋 TODO — Future Phases

## Phase 3 — Admin section ✅ DONE

> Architecture decisions made: server-rendered Next.js (no more static export),
> JSON-file storage (not SQLite) via a pluggable Storage interface,
> custom JWT session auth (not NextAuth) for simplicity and edge-runtime
> compatibility with Cloudflare Pages. Deploy target: Cloudflare Pages + R2.

### 3a — Storage & data
- [x] `src/lib/storage.ts` — pluggable `Storage` interface (read/write/list/delete)
- [x] `src/lib/storage-local.ts` — local-filesystem impl (uses `STORAGE_LOCAL_PATH`)
- [x] `src/lib/storage-r2.ts` — Cloudflare R2 impl (stub, completed in Phase 3d)
- [x] SQLite dropped; data lives in `data/businesses/{slug}.json` + `data/users.json`
- [x] `src/lib/db.ts` refactored to use the Storage abstraction (all queries async)
- [x] `src/lib/business-validation.ts` — shared slug/hours/ID validation
- [x] `output: "export"` removed from `next.config.ts` (site now server-rendered)

### 3b — Auth
- [x] `data/users.json` schema: `[{ id, email, passwordHash, role, name, ownedSlug, createdAt }]`
- [x] `src/lib/users.ts` — bcrypt verify, role helpers (`canEditBusiness`, `canManageBusinesses`)
- [x] `src/lib/session.ts` — signed-JWT cookie sessions (`jose`, HS256, 7-day TTL)
- [x] `src/app/api/auth/login/route.ts` — POST, sets HttpOnly cookie
- [x] `src/app/api/auth/logout/route.ts` — POST, clears cookie
- [x] `src/app/api/auth/me/route.ts` — GET current user
- [x] `src/middleware.ts` — gates `/admin/*`, redirects to login with `?next=`
- [x] Seeded users: admin (`murtaza@getyoursitelive.com` / `admin123`), one shop owner (`owner@starauto.com`)

### 3c — Admin UI

**URL structure — two distinct admin spaces:**

```
/admin                          Platform admin (Murtaza only)
  /admin/login                  Platform login
  /admin/business/new           Create a new business (admin-only)

/{slug}/admin                   Per-shop admin (shop owner or platform admin)
  /{slug}/admin/login           Per-shop login branded with the shop name
```

Shop owners sign in at `/star-auto/admin/login` and land on `/star-auto/admin`.
The platform admin can sign in at `/admin/login` and see a dashboard of all
businesses; clicking a card takes them to `/{slug}/admin` to edit that shop.
If an owner tries `/admin` they're redirected to their own shop's admin.

- [x] `/admin/login` — platform login form; redirects owners to their shop after success
- [x] `/admin` — admin-only dashboard listing every business
- [x] `/admin/business/new` — admin-only "create from blank" form
- [x] `/{slug}/admin/login` — per-shop login branded with the shop's name
- [x] `/{slug}/admin` — tabbed editor (admin OR owner of this slug)
- [x] 12 modular tabs in `src/app/[slug]/admin/_tabs/`, ordered top-to-bottom to match the public page flow:
  - `identity-tab.tsx` — name, slug (admin-only edit), tagline, founded, category, theme
  - `hero-tab.tsx` — eyebrow prefix, headline, italic accent, lead, CTA labels, why-us bullets
  - `about-tab.tsx` — heading, narrative, numbered bullets, two image URLs, why-us cards (repeatable)
  - `stats-tab.tsx` — 4-card numeric stats (label, value, suffix)
  - `services-tab.tsx` — repeatable ServiceItem[]
  - `deals-tab.tsx` — repeatable DealItem[] with badge + strikethrough price
  - `pricing-tab.tsx` — repeatable PricingCard[] with "popular" highlight
  - `team-tab.tsx` — repeatable TeamMember[]
  - `testimonials-tab.tsx` — repeatable Testimonial[]
  - `faq-tab.tsx` — repeatable FaqItem[] (question + answer)
  - `contact-hours-tab.tsx` — phone, email, address, social, weekly schedule, emergency banner copy
  - `visibility-tab.tsx` — 11 section toggles
  - `repeatable.tsx` — shared reorder/remove/add wrapper

### Data model expansion (Phase 3 follow-up — full content migration)
- [x] All hardcoded copy migrated into per-business JSON (old `home.constants.ts` deleted)
- [x] New types in `src/types/site.ts`: `HeroContent`, `AboutContent`, `StatItem`, `PricingCard`, `FaqItem`, `EmergencyContent`
- [x] `Business` interface expanded with `hero`, `about`, `stats`, `pricing`, `faqs`, `emergency`
- [x] `BusinessVisibility` expanded from 6 to 11 toggles (added showAbout, showStats, showPricing, showFaq, showEmergencyBanner)
- [x] Both `data/businesses/*.json` reseeded with full content
- [x] All public components (Hero/About/Stats/Pricing/FAQ/Emergency) now read from `useBusiness()` context, no constants
- [x] `home.constants.ts` deleted — `navItems` inlined, `processSteps` removed (dead code)
- [x] `new-business-form.tsx` seeds blank business with sensible defaults for every new section
- [x] `src/app/admin/actions.ts` — Server Actions: save / create / delete with role guards + `revalidatePath`
- [x] `src/app/admin/admin.css` — self-contained admin styles (reused by /{slug}/admin via `../../admin/admin.css`)
- [x] `src/app/admin/admin-header.tsx` — platform-admin header
- [x] `src/app/[slug]/admin/shop-admin-header.tsx` — per-shop header, shows shop name as brand, "All sites →" button for platform admins
- [x] `src/app/admin/layout.tsx` — platform-admin shell
- [x] `src/app/[slug]/admin/layout.tsx` — per-shop admin shell
- [x] `src/middleware.ts` — matches BOTH `/admin/:path*` and `/:slug/admin/:path*`

### Form-mode admin status
- [x] All 12 tabs functional (see list above)
- [x] Save action with role guards + `revalidatePath` on every save
- [x] In-progress edits held in local state until "Save changes"
- [x] Audit log (`/admin/audit`) — tracks who changed what, when
- [x] User management UI (`/admin/users`) — add/remove users + invite links
- [ ] Change email flow — user can update their login email from account settings
- [ ] Change password flow — user can update their password from account settings; "forgot password" reset link via email

## Phase 4 — WYSIWYG inline editor ✅ DONE

> **Major UX shift.** Form mode (12 tabs) still exists at `/{slug}/admin` for
> bulk edits, but there's now a second mode at `/{slug}/admin/edit` that
> renders the actual public homepage with click-to-edit affordances on every
> piece. Owners switch between Form / Inline via a toggle in the shop-admin
> header. Every edit auto-saves (optimistic) — no global Save button.

### Architecture
- `src/lib/edit-mode-context.tsx` — `EditModeProvider` holds live business state, `updateField()` and `updateFields()` mutate + auto-save via `saveBusinessAction`. Save state pill: idle / saving / saved / error.
- `src/app/[slug]/admin/edit/page.tsx` — server component, auth + permission gate, hands business to `<EditableHome>`.
- `src/app/[slug]/admin/edit/editable-home.tsx` — wraps `<HomePage>` in `EditModeProvider` + a `BusinessBridge` that pipes the live state into `BusinessProvider`. Also wraps everything in `data-theme` + `.edit-mode` so editing affordances activate via CSS.

### Editable primitives (`src/components/editable/`)
- `editable-text.tsx` — click-to-edit span/heading. Supports single-line + multiline. Enter / blur commit, Esc cancels. Hover reveals dashed outline + pencil icon.
- `editable-list.tsx` — wraps a list with hover-revealed reorder (↑↓), delete (×), and "+ Add" controls. Used for bullets, services, deals, team, testimonials, FAQs, etc.
- `editable-image.tsx` — file-picker primitive backed by `/api/upload`. Hover reveals "Upload / Replace / Remove" pills. 5MB limit, image-type allow-list.
- `save-indicator.tsx` — floating top-right pill showing the auto-save state.
- `section-block.tsx` — wraps a major section with visibility toggle. Public mode hides if toggle off; edit mode shows dimmed with a "Hidden from customers" banner so the owner can flip it back on.
- `editable.css` — all the affordance styles (dashed outlines, pencils, save pill, block toolbars, dimmed-block state).

### Helper components for the page
- `src/components/site/section-h2.tsx` — `<SectionH2 titleKey="services" />` renders an editable H2 backed by `business.sectionTitles[key]`. Used everywhere a section heading lives.

### Block visibility system (every block independently togglable)
`BusinessVisibility` now has these flags. Public site renders only blocks with toggles ON. Edit mode shows everything (with dim+banner for OFF).

```
Hero:              showHeroEyebrow, showHeroHeadline, showHeroLead,
                   showHeroCtas, showHeroCard, showHeroImage
About:             showAbout (story), showAboutWhyUs (cards row)
Stats:             showStats
Services:          showServices
Deals:             showDeals
Pricing:           showPricing
Team:              showTeam
Testimonials:      showTestimonials
FAQ:               showFaq
Emergency banner:  showEmergencyBanner
Booking form:      showBooking
Contact info:      showContactInfo
Map (nested):      showMap
Hours (nested):    showHours
```

Hero, Footer have no top-level toggle (always visible chrome).

### File upload (`/api/upload`)
- `src/app/api/upload/route.ts` — POST `multipart/form-data` with `file` + `slug`. Auth-checked (must be admin or owner of slug). Validates type allow-list (png/jpg/webp/svg/gif) and 5MB limit. Sanitizes filename. Saves to `public/uploads/{slug}/{timestamp}-{name}.{ext}` and returns `{ url }`.
- `public/uploads/` is gitignored.
- **Production note:** on Cloudflare Pages the filesystem is read-only; the route's save step needs to swap to R2 `putObject` before deploy. Interface stays the same.
- Used by: logo (`businessInfo.logoUrl`), hero image (`hero.heroImage`), about primary + secondary images, team member photos.

### Full content migration (everything visible on the public page is editable)
Every hardcoded string in the components has been moved into per-business JSON. The full set of editable surfaces:

**Chrome / nav:**
- `businessInfo.logoUrl` — custom logo image (falls back to wrench icon if empty)
- `businessInfo.name` — brand name
- `navLabels.{home,about,services,technicians,contact}` — navigation item labels

**Hero:**
- `hero.eyebrowPrefix` — eyebrow pill text
- `hero.headline` — main headline (plain text, no markdown)
- `hero.lead` — sub-headline paragraph
- `hero.primaryCta` / `hero.secondaryCta` — button labels
- `hero.whyTitle` — credibility-card title
- `hero.whyBullets[]` — bullets (reorderable)
- `hero.heroImage` — right-column photo URL

**About:**
- `about.heading`, `about.narrative`, `about.bullets[]`
- `about.primaryImage`, `about.secondaryImage`
- `about.whyUsCards[].{title,description}` (reorderable)

**Stats / Services / Deals / Pricing / Team / Testimonials / FAQ:**
- All section H2 titles via `sectionTitles.{services,deals,dealsEyebrow,dealsLede,dealsCta,pricing,pricingPopular,pricingRegular,team,testimonials,faq}`
- Each section's items fully editable + add/remove/reorder

**Emergency banner:**
- `emergency.{heading,description,ctaLabel}`

**Contact:**
- `contact.{heading,description,bookButtonLabel,extraServiceOptions[]}`
- `contact.extraServiceOptions[]` adds dropdown choices after the shop's services. The exact value `"Other"` is special — selecting it reveals a free-text input for the customer.

**Footer:**
- `businessInfo.name` + `businessInfo.tagline` (top of footer)
- `footer.locationLabel` + `businessInfo.address`
- `footer.phoneLabel` + `businessInfo.phone`
- `footer.copyrightSuffix` (e.g. "All rights reserved.")
- (`footer.visitHeading` / `footer.servicesHeading` are kept in the type for back-compat but no longer rendered — the Services column was removed as redundant with the main Services section.)

### Booking form enhancements
- Customer-facing dropdown auto-shows the shop's services + admin-curated extras (default "General Inspection", "Other")
- Selecting "Other" reveals a "What service do you need?" text input
- Schema (`home.schema.ts`) requires `serviceOther` when `service === "Other"`
- `home-page.tsx` now passes `watch` through to `ContactSection` so the conditional input works

### Layout fixes for inline edit
- Hero `min-height: calc(100vh - 4rem)` removed — page collapses smoothly when blocks are toggled off
- Hero `align-items: center` → `align-items: start` so columns top-anchor (no centered-gap when one is short)
- Footer redesigned to a single compact row (was 4-column grid with Services column)

## Phase 5 — Cloudflare Pages + D1 deploy ✅ DONE

> Originally planned as R2+JSON storage. Changed to D1 (SQLite edge DB) for
> proper relational storage. Migration from Vercel was complex — see
> "Cloudflare edge runtime — hard-learned rules" section above.

- [x] Migrated storage from JSON files → Cloudflare D1 (SQLite)
- [x] `src/lib/db-d1.ts` — returns D1 binding via `getRequestContext().env.DB`
- [x] `src/lib/db.ts` — rewrote all queries to use D1 prepared statements
- [x] `export const runtime = "edge"` added to all 26 dynamic routes/pages
- [x] `src/middleware.ts` created (replaces `src/proxy.ts` — Next.js 16 renamed convention but Cloudflare build tooling requires old name)
- [x] Removed `import "server-only"` from all lib files (incompatible with edge bundler)
- [x] `src/app/api/upload/route.ts` rewrote to use R2 binding (not S3 SDK)
- [x] Cloudflare Pages project created, connected to GitHub, auto-deploys on push
- [x] Custom domains `getyoursitelive.com` + `www.getyoursitelive.com` added to Pages project
- [x] `getyoursitelive.com` DNS cut over from Vercel to Cloudflare Pages
- [x] D1 seeded with all business data (92 businesses migrated)

## Phase 6 — Wire up forms *(~30 min)*
- [ ] Sign up for Formspree (or use a bookings store)
- [ ] Set `NEXT_PUBLIC_FORMSPREE_ID` in `.env.local`
- [ ] Wire booking form (`ContactSection` in `home-secondary-sections.tsx`) to save + email the shop owner
- [ ] Per-shop email routing (each shop's submissions go to *their* email, not Murtaza's)
- [ ] Replace `alert()` success messages with proper success/error UI
- [ ] Include `serviceOther` + chosen dropdown value in the submission payload

## Polish — Remaining themes *(~1-2 hours)*
- [ ] **Luxury** theme — currently bare bones (gold/black, Geist). Define a display font, refine spacing, polish to Modern/Industrial level
- [ ] **Friendly** theme — same treatment, warmer/softer

## SEO + structured data *(~30 min)*
- [ ] Add `AutoRepair` schema.org JSON-LD per business (currently removed because of React 19 script-tag warning — needs cleaner injection via Next.js metadata `other` field or layout-level Script)
- [ ] Add `LocalBusiness` markup
- [ ] FAQ structured data on per-business pages
- [ ] OpenGraph image generation per business

## Accessibility audit *(~1 hour)*
- [ ] Keyboard navigation for theme dropdown, mobile menu, FAQ accordion
- [ ] Focus rings everywhere
- [ ] ARIA roles on testimonial carousel
- [ ] Color contrast check across all 4 themes

## Performance *(~1 hour)*
- [ ] Self-host Pexels images (download + commit) for full control
- [ ] `<Image>` `sizes` attribute audit
- [ ] Font subsetting if Fraunces or Chakra Petch are too large
- [ ] Lighthouse score > 90 mobile

## Feature expansion *(future / nice-to-have)*
- [ ] Real calendar booking (date picker showing actual availability)
- [ ] Google Reviews integration (pull live reviews per shop)
- [ ] Vehicle year/make/model selector in booking form
- [ ] Before/after gallery section
- [ ] Multi-language support (Spanish for NJ market)
- [ ] Customer dashboard — shop owner can edit their own content
- [ ] Stripe checkout to accept the $500 online (currently Venmo/cash)
- [x] Zip-code search feature (`/admin/leads/search`) — enter a zip code, query Google Places API for local businesses without websites, one-click add as leads. Live with Google Places API key. Active in NJ, CO, VA.

## Content / copy improvements ✅ ALL DONE (Phase 4)
- [x] Hero headline now per-business via `hero.headline`
- [x] About narrative + heading + bullets per-business via `about.*`
- [x] FAQ questions + answers per-business via `faqs[]`
- [x] Pricing cards per-business via `pricing[]` (own section, separate from Deals)

## Remaining admin / editor polish
- [ ] Per-business publish-time preview (show unpublished drafts before going live)
- [ ] Undo / redo for inline edits (currently each save is final)
- [ ] Image cropping / resizing on upload (currently raw upload, no processing)
- [ ] Bulk image management (dedup, GC orphan uploads when business or photo is replaced)
- [ ] Deal images, service icons, testimonial headshots (sections without photo slots — add if shops ask)
- [ ] Rich-text control for bold/italic emphasis (current text is plain)

## Cleanup tasks
- [x] SQLite deps removed; `db/` folder emptied; old init/seed scripts deleted
- [x] `src/data/site-content.ts` removed
- [x] `test-query.ts` removed
- [x] `home.constants.ts` deleted — `navItems` inlined into `home-chrome.tsx`, `processSteps` was dead code
- [x] Remove the parent-folder `package.json` and `package-lock.json` that cause multi-lockfile warnings
- [x] `src/lib/storage.ts`, `storage-local.ts`, `storage-r2.ts` deleted — dead since D1 migration
- [x] 9 one-time cleanup migrations removed from `migrate/route.ts` (575 lines deleted)
- [x] Unused `SESSION_COOKIE_NAME` export removed from `session.ts`
- [ ] `middleware.ts` → `proxy.ts` rename (Next.js 16 deprecation warning)
- [ ] Remove `out/` directory (leftover from the old `output: "export"` build, gitignored)
- [ ] `footer.visitHeading` / `footer.servicesHeading` are unused after footer redesign — remove from type + seeds once we're sure no rollback needed
- [ ] Rename `businesses` table → `prospect_site_previews` (or similar) — these are preview sites built for prospects, not standalone businesses. Touches 30+ files; do when stable.

---

# 📦 Client Template (standalone deliverable)

> Full docs: [CLIENT-TEMPLATE.md](CLIENT-TEMPLATE.md) — architecture, deployment guide,
> troubleshooting, decisions, and change log. Generation script: `scripts/generate-client-template.js`.

---

## 2026-04-25 — Template-at-render architecture + dead code cleanup

### Multi-vertical template system
- Created `src/lib/templates/` with 6 vertical templates: auto-repair, auto-body, barber, restaurant, plumber, generic (fallback)
- `VerticalTemplate` interface defines `buildProspectBusiness()` + `buildBlankBusiness()` per vertical
- `registry.ts` maps Google category strings → template (case-insensitive lookup)
- `rowToBusiness()` in `db.ts` now fills ALL missing sections from the matching template at render time
- DB only stores what's unique: `businessInfo` (name/phone/address), `slug`, `category`, `theme`, `visibility`, and any owner customizations
- Stripped ~15KB of duplicated template content from each of 653 auto repair business JSON blobs
- Fixed category mismatches: "Auto Repair" → "Car repair and maintenance service" via Google Places API lookup
- Renamed `Testimonial.vehicle` → `Testimonial.context` with read-time migration for old data

### Dead code removal
- Deleted `src/lib/storage.ts`, `storage-local.ts`, `storage-r2.ts` — dead since D1 migration
- Deleted `src/components/site/home.constants.ts` — `navItems` inlined, `processSteps` was unused
- Removed 9 completed one-time migrations from `migrate/route.ts` (575 lines)
- Removed unused `SESSION_COOKIE_NAME` export from `session.ts`

### Admin tables
- Built reusable `SortableTable` component with search, column sorting, and filters
- Applied to audit log, users, and visits pages

## 2026-04-21 — Project cleanup + repo reorganization

### Removed Precision Auto Care
- Deleted `data/businesses/precision-auto-care.json` — Star Auto (modern theme) is the only business
- Removed `u-precision-auto` owner entry from `data/users.json`
- Decision rationale: Modern theme is objectively more polished (Fraunces serif, warm paper gradient, editorial depth); Industrial was the default/base styles with minimal theme-specific CSS
- `theme-store.ts` default fallback changed from `"industrial"` → `"modern"`

### Repo moved: `/CarMechanic/precision-auto-care` → `/CarMechanic`
- All project files moved one level up — project root is now `/Users/Shared/CarMechanic`
- Stale parent `package.json`, `package-lock.json`, `node_modules` removed (were causing Turbopack multi-lockfile warning)
- Non-project files kept in place: `AutoRepairSiteTemp/`, `HANDOUT-PROPOSAL-*.md`, `INTERNAL-Purpose-and-Pitch.md`
- **Claude Code must be launched from `/Users/Shared/CarMechanic`** going forward

## 2026-04-20 — WYSIWYG + image upload + full block visibility
- Built inline edit mode at `/{slug}/admin/edit` with click-to-edit primitives (text, list, image)
- Every visible string on the public page migrated to per-business JSON (chrome + hero + about + stats + services + deals + pricing + team + testimonials + FAQ + emergency + contact + footer)
- `SectionBlock` wrapper + 16 visibility flags so each block has its own Visible/Hidden toggle
- `/api/upload` route + `EditableImage` primitive — logo, hero, about, team photos all uploadable from the computer (no URL pasting)
- Booking form: admin-editable dropdown extras, "Other" reveals free-text input, button label editable
- Footer redesigned to a compact single-line layout; Services column removed as redundant with the main Services section; "Location:" / "Phone:" inline labels
- Hero layout fix: removed `min-height: 100vh` and switched to `align-items: start` so hidden blocks don't leave gaps
- `businessInfo.logoUrl` with `<BrandMark>` fallback to wrench icon
- `sectionTitles` bag holds all editable section H2s (and nav labels via `navLabels`)

## 2026-04-19 — Admin module (Phase 3)
- Switched `output: "export"` → server-rendered
- SQLite → JSON via pluggable Storage abstraction
- Custom JWT session auth (jose) — no NextAuth
- 12-tab Form-mode admin at `/{slug}/admin`
- Split routes: `/admin/*` platform vs `/{slug}/admin/*` shop-owner
- User roles: `admin` + `owner`; login/logout/me routes; middleware gating

## Earlier — see DONE section above
Landing page, theme system, multi-tenant routing, database, seeding, demos.
