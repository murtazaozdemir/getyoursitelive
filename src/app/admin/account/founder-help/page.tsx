import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isFounder } from "@/lib/users";
import Link from "next/link";

export const metadata = {
  title: "Founder Help · Admin",
  robots: { index: false, follow: false },
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="help-section">
      <h2 className="help-h2">{title}</h2>
      {children}
    </section>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="help-step">
      <span className="help-step-num">{n}</span>
      <div>{children}</div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return <div className="help-tip">{children}</div>;
}

export default async function FounderHelpPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isFounder(user)) redirect("/admin");

  return (
    <div className="admin-page help-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Founder Only Help</h1>
          <p className="admin-lede">
            Tools and features available only to the platform founder.
          </p>
        </div>
        <Link href="/admin/help" className="admin-btn admin-btn--ghost">
          &larr; General Help
        </Link>
      </div>

      {/* Table of contents */}
      <nav className="help-toc">
        <h3 className="help-toc-title">Contents</h3>
        <ol className="help-toc-list">
          <li><a href="#client-onboarding">Client Onboarding (Domain to Live)</a></li>
          <li><a href="#zip-search">Zip Search</a></li>
          <li><a href="#users">User Management</a></li>
          <li><a href="#templates">Business Categories &amp; Templates</a></li>
          <li><a href="#tools">Founder Tools</a></li>
        </ol>
      </nav>

      {/* ─── CLIENT ONBOARDING ─── */}
      <Section id="client-onboarding" title="Client Onboarding (Domain to Live)">
        <p>
          Complete steps for taking a paying client from zero to a live site on their own
          Cloudflare account. Follow every step in order.
        </p>

        <h3>Part 1 — Buy the Domain</h3>
        <Step n={1}>
          <strong>Find a .com domain.</strong> Use IONOS (ionos.com) or another registrar.
          Search for the client&apos;s business name as a .com. Keep it short, no dashes, no
          Inc/LLC. If the exact name is taken, try adding the state abbreviation
          (e.g., <code>starautonj.com</code>).
        </Step>
        <Step n={2}>
          <strong>Purchase the domain.</strong> Use the cheapest plan (typically $1/year for the
          first year on IONOS). Register under the client&apos;s business name if possible.
        </Step>

        <h3>Part 2 — Email Account</h3>
        <Step n={3}>
          <strong>Create a Tuta email account.</strong> Go to <code>tuta.com</code> and create a free
          account for this client (e.g., <code>businessname@tuta.com</code>). This email will be
          used for all service accounts below.
        </Step>
        <Tip>
          Use a consistent naming convention for client emails. The Tuta account is for
          service signups only — the client never needs to access it.
        </Tip>

        <h3>Part 3 — Cloudflare Account</h3>
        <Step n={4}>
          <strong>Create a Cloudflare account.</strong> Go to <code>dash.cloudflare.com</code> and
          sign up with the Tuta email. When asked for account type, select <strong>Personal</strong>.
        </Step>
        <Step n={5}>
          <strong>Add the domain to Cloudflare.</strong> Click <strong>Add a site or application</strong> &rarr;
          enter the domain name &rarr; select the <strong>Free</strong> plan &rarr;
          click <strong>Continue</strong>.
        </Step>
        <Step n={6}>
          <strong>Update nameservers at the registrar.</strong> Cloudflare shows two nameservers
          (e.g., <code>alice.ns.cloudflare.com</code>). Go to IONOS (or your registrar) &rarr;
          domain settings &rarr; <strong>Use custom nameservers</strong> &rarr; paste both Cloudflare
          nameservers &rarr; save.
        </Step>
        <Step n={7}>
          <strong>Confirm in Cloudflare.</strong> Back in Cloudflare, click <strong>&ldquo;I&apos;ve updated
          my nameservers&rdquo;</strong> &rarr; then <strong>Check nameservers</strong>. It can take up
          to 24 hours but usually completes in minutes.
        </Step>
        <Tip>
          Wait until Cloudflare shows the domain as <strong>Active</strong> before proceeding
          to deployment. You can continue with GitHub setup in the meantime.
        </Tip>

        <h3>Part 4 — GitHub Account &amp; Repository</h3>
        <Step n={8}>
          <strong>Create a GitHub account.</strong> Go to <code>github.com</code> and sign up with
          the same Tuta email.
        </Step>
        <Step n={9}>
          <strong>Generate the client template locally.</strong> From the CarMechanic
          project root, run:
          <pre className="help-code">
{`node scripts/generate-client-template.js \\
  "Business Name" \\
  "(555) 123-4567" \\
  "123 Main St, City, ST 07011" \\
  /Users/Shared/client-template-OUTPUT \\
  "" \\
  auto-repair`}
          </pre>
          Leave the worker URL empty for now — you&apos;ll set it after deploying the Worker.
        </Step>
        <Step n={10}>
          <strong>Create a GitHub repo and push.</strong> In the generated output directory:
          <pre className="help-code">
{`cd /Users/Shared/client-template-OUTPUT
git init
git add -A
git commit -m "Initial client site"
# Create repo on GitHub, then:
git remote add origin https://github.com/ACCOUNT/REPO.git
git push -u origin main`}
          </pre>
        </Step>

        <h3>Part 5 — Cloudflare Workers &amp; KV</h3>
        <Step n={11}>
          <strong>Authenticate wrangler.</strong> Run <code>npx wrangler login</code> and sign in
          with the client&apos;s Cloudflare account.
        </Step>
        <Step n={12}>
          <strong>Create KV namespaces.</strong>
          <pre className="help-code">
{`npx wrangler kv namespace create CONTENT
npx wrangler kv namespace create RATE_LIMIT`}
          </pre>
          Copy both IDs — you&apos;ll need them for <code>wrangler.toml</code>.
        </Step>
        <Step n={13}>
          <strong>Create R2 bucket.</strong> In the Cloudflare dashboard, go to
          R2 &rarr; <strong>Create bucket</strong> &rarr; name it <code>site-uploads</code>.
        </Step>
        <Step n={14}>
          <strong>Update wrangler.toml.</strong> Edit <code>worker/wrangler.toml</code> — paste the
          KV namespace IDs and R2 bucket name.
        </Step>
        <Step n={15}>
          <strong>Deploy the Worker.</strong>
          <pre className="help-code">
{`cd worker
npx wrangler deploy`}
          </pre>
          Note the Worker URL printed (e.g., <code>https://site-api.account.workers.dev</code>).
        </Step>
        <Step n={16}>
          <strong>Set Worker secrets.</strong>
          <pre className="help-code">
{`npx wrangler secret put PASSWORD
# Enter the admin password for the site editor

npx wrangler secret put TOKEN_SECRET
# Enter a random 32+ character string

npx wrangler secret put ALLOWED_ORIGIN
# Enter the site URL, e.g.: https://clientdomain.com`}
          </pre>
        </Step>

        <h3>Part 6 — Update Config &amp; Seed Content</h3>
        <Step n={17}>
          <strong>Update config.js with Worker URL.</strong> Edit the site&apos;s <code>config.js</code> and
          set <code>API_BASE</code> to the Worker URL from step 15 (e.g.,
          <code>https://site-api.account.workers.dev/api</code>).
        </Step>
        <Step n={18}>
          <strong>Seed content to KV.</strong>
          <pre className="help-code">
{`cd worker
npx wrangler kv key put "business" \\
  --path ../sample-content.json \\
  --binding CONTENT --remote`}
          </pre>
        </Step>
        <Tip>
          The KV key MUST be <code>&ldquo;business&rdquo;</code> — that&apos;s what the Worker reads.
          Using <code>&ldquo;content&rdquo;</code> or any other key name will show
          &ldquo;Site loading... Content not yet configured.&rdquo;
        </Tip>

        <h3>Part 7 — Deploy to Cloudflare Pages</h3>
        <Step n={19}>
          <strong>Connect GitHub to Cloudflare Pages.</strong> In the Cloudflare dashboard &rarr;
          <strong>Workers &amp; Pages</strong> &rarr; <strong>Create</strong> &rarr;
          <strong>Pages</strong> &rarr; <strong>Connect to Git</strong>.
        </Step>
        <Step n={20}>
          <strong>Select the repo</strong> you pushed in step 10. Set these build settings:
          <ul>
            <li>Framework preset: <strong>None</strong></li>
            <li>Build command: <em>(leave empty)</em></li>
            <li>Build output directory: <code>site</code></li>
          </ul>
        </Step>
        <Step n={21}>
          <strong>Set production branch</strong> to <code>main</code> and click <strong>Save and Deploy</strong>.
        </Step>

        <h3>Part 8 — Custom Domain</h3>
        <Step n={22}>
          <strong>Add custom domain.</strong> In the Pages project &rarr;
          <strong>Custom domains</strong> &rarr; add the client&apos;s domain
          (e.g., <code>clientdomain.com</code>). Also add <code>www.clientdomain.com</code>.
        </Step>
        <Step n={23}>
          <strong>Update ALLOWED_ORIGIN.</strong> If you set the Pages URL earlier, update it to
          include the custom domain:
          <pre className="help-code">
{`npx wrangler secret put ALLOWED_ORIGIN
# Enter: https://clientdomain.com,https://www.clientdomain.com`}
          </pre>
        </Step>

        <h3>Part 9 — Verify</h3>
        <Step n={24}>
          <strong>Check the public site.</strong> Visit the domain — all sections should render
          with the client&apos;s content.
        </Step>
        <Step n={25}>
          <strong>Check the browser console.</strong> No CSP, CORS, or fetch errors.
        </Step>
        <Step n={26}>
          <strong>Test the editor.</strong> Go to <code>/mysite/login.html</code> &rarr; sign in
          with the password from step 16 &rarr; edit content &rarr; verify it saves and
          persists on reload.
        </Step>
        <Step n={27}>
          <strong>Hand over credentials.</strong> Give the client:
          <ul>
            <li>Their site URL</li>
            <li>The admin password</li>
            <li>Quick walkthrough of the editor (click to edit, drag to reorder)</li>
          </ul>
        </Step>
        <Tip>
          After handover, the client&apos;s site runs independently forever. No server to maintain,
          no database to manage, no monthly fees. They edit their own content and Cloudflare
          handles hosting, CDN, and SSL for free.
        </Tip>
      </Section>

      {/* ─── ZIP SEARCH ─── */}
      <Section id="zip-search" title="Zip Search">
        <p>
          The Zip Search tool finds local businesses via Google Places API and adds them
          as leads with one click.
        </p>
        <h3>How to Use</h3>
        <Step n={1}>
          <strong>Pick a search mode.</strong> &ldquo;Search by City&rdquo; searches all zip codes
          in a city automatically. &ldquo;Single Zip&rdquo; searches one zip code.
        </Step>
        <Step n={2}>
          <strong>Choose a category.</strong> The dropdown has all supported business types
          (auto repair, barber, restaurant, plumber, etc.). This controls what Google returns.
        </Step>
        <Step n={3}>
          <strong>Review results.</strong> Each result shows name, address, phone, rating,
          review count, and website status. The &ldquo;No website only&rdquo; filter (on by default)
          hides businesses that already have a real website.
        </Step>
        <Step n={4}>
          <strong>Add leads.</strong> Click <strong>+ Add as Lead</strong> on individual results,
          or <strong>+ Add/Update All</strong> to batch-add everything.
        </Step>
        <Tip>
          Results are cached per zip code. Searching the same zip again costs zero API calls.
          City searches batch multiple zips — you can see progress per-zip in real time.
        </Tip>
        <Tip>
          Each Google Places API call costs ~$0.032. The search page shows a running cost
          estimate so you can monitor spend.
        </Tip>
      </Section>

      {/* ─── USER MANAGEMENT ─── */}
      <Section id="users" title="User Management">
        <p>
          Manage platform users at <strong>My Account &rarr; Users</strong>.
        </p>
        <h3>Roles</h3>
        <ul>
          <li><strong>Founder</strong> — full access to everything, including Zip Search, Users, Audit Log, Setup, and Backup</li>
          <li><strong>Admin</strong> — access to Leads, Tasks, Clients, proposals, and site editing. Cannot access founder-only tools.</li>
          <li><strong>Business Owner</strong> — can only access their own site&apos;s editor. Cannot see the admin platform.</li>
        </ul>
        <h3>Inviting Users</h3>
        <Step n={1}>
          Go to <strong>Users &rarr; + Invite user</strong>.
        </Step>
        <Step n={2}>
          Enter their email and pick a role. For Business Owners, also enter the business slug
          they&apos;ll manage.
        </Step>
        <Step n={3}>
          An invite email is sent with a link to create their account. You can also copy the
          invite URL directly.
        </Step>
        <Tip>
          You can resend or revoke pending invitations from the Users page.
        </Tip>
      </Section>

      {/* ─── TEMPLATES ─── */}
      <Section id="templates" title="Business Categories &amp; Templates">
        <p>
          The platform supports multiple business types. Each type has a <strong>template</strong> that
          generates realistic preview content (services, testimonials, FAQs, pricing) when a lead
          is added.
        </p>
        <h3>Current Templates</h3>
        <div className="help-template-list">
          <div><strong>Auto Repair</strong> — mechanic shops, tire shops, brake shops, transmission, oil change, etc.</div>
          <div><strong>Auto Body</strong> — collision repair, auto painting, car detailing</div>
          <div><strong>Barber</strong> — barber shops, hair salons, beauty salons</div>
          <div><strong>Restaurant</strong> — restaurants, cafes, pizzerias, bakeries, bars, delis, etc.</div>
          <div><strong>Plumber</strong> — plumbers, plumbing services, drain cleaning</div>
          <div><strong>Generic</strong> — fallback for any category without a dedicated template (minimal content)</div>
        </div>
        <h3>How Templates Get Matched</h3>
        <p>
          When a lead is added via Zip Search, Google provides a business category (e.g., &ldquo;Barber shop&rdquo;).
          The system matches this category string to the right template. The match must be exact
          wording (case doesn&apos;t matter).
        </p>
        <Tip>
          If a Google category doesn&apos;t match any template, you&apos;ll get an email alert
          with the category name and instructions for adding it. Check <strong>Google Maps Info</strong> to
          see all categories and which ones are unmapped.
        </Tip>
        <h3>Adding a New Template</h3>
        <p>To support a new business type (e.g., dentists):</p>
        <Step n={1}>
          Create a template file at <code>src/lib/templates/dentist.ts</code> — use any existing
          template as a starting point.
        </Step>
        <Step n={2}>
          Add one import line and one array entry in <code>src/lib/templates/registry.ts</code>.
        </Step>
        <Step n={3}>
          Build and push. New leads with matching Google categories will automatically get
          the new template content.
        </Step>
      </Section>

      {/* ─── FOUNDER TOOLS ─── */}
      <Section id="tools" title="Founder Tools">
        <p>
          These tools are in the <strong>My Account</strong> dropdown:
        </p>
        <ul>
          <li><strong>Users</strong> — manage platform users and invitations</li>
          <li><strong>Audit Log</strong> — every sign-in, edit, and action with timestamps and who did it</li>
          <li><strong>Setup</strong> — run data migrations and see database commands</li>
          <li><strong>Google Maps Info</strong> — see all Google categories fetched, mapped vs unmapped, field fill rates, data sizes</li>
          <li><strong>Zip Search</strong> — find and add leads via Google Places</li>
          <li><strong>Download Backup</strong> — exports all database tables as a JSON file</li>
        </ul>
        <Tip>
          Download a backup regularly. It contains every table in D1 but does <strong>not</strong> include
          uploaded images (those are in Cloudflare R2).
        </Tip>
      </Section>
    </div>
  );
}
