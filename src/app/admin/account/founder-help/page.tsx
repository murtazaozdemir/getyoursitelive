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
          <strong>Create a Protonmail account.</strong> Go to <code>proton.me</code> and create a free
          account for this client (e.g., <code>businessname@proton.me</code>). This email will be
          used for all service accounts below.
        </Step>
        <Tip>
          Use a consistent naming convention for client emails. The Protonmail account is for
          service signups only — the client never needs to access it.
        </Tip>

        <h3>Part 3 — Cloudflare Account</h3>
        <Step n={4}>
          <strong>Create a Cloudflare account.</strong> Go to <code>dash.cloudflare.com/sign-up</code>.
          Enter the Protonmail email and a password. When it asks &ldquo;What type of account
          are you creating?&rdquo; select <strong>Personal</strong>. You&apos;ll land on the
          Cloudflare dashboard.
        </Step>
        <Step n={5}>
          <strong>Add the domain to Cloudflare.</strong> On the dashboard home, click
          <strong> Add a site or application</strong> (blue button, top right). On the next screen:
          <ul>
            <li>Type the domain name (e.g., <code>clientdomain.com</code>) — no <code>www</code>, just the root</li>
            <li>Click <strong>Continue</strong></li>
            <li>It shows plan options — scroll down and select <strong>Free</strong> ($0/month)</li>
            <li>Click <strong>Continue</strong> again</li>
          </ul>
          Cloudflare will scan existing DNS records. You can skip/continue through this —
          the domain is new so there are no records to import.
        </Step>
        <Step n={6}>
          <strong>Copy the Cloudflare nameservers.</strong> Cloudflare now shows two nameserver
          addresses (e.g., <code>alice.ns.cloudflare.com</code> and <code>bob.ns.cloudflare.com</code>).
          Copy both of them.
        </Step>
        <Step n={7}>
          <strong>Update nameservers at IONOS.</strong> Open IONOS in another tab &rarr; log in &rarr;
          go to <strong>Domains &amp; SSL</strong> &rarr; click the domain &rarr;
          <strong>DNS Settings</strong> or <strong>Nameservers</strong> &rarr;
          select <strong>Use custom nameservers</strong> &rarr; paste both Cloudflare nameservers
          (one per field) &rarr; <strong>Save</strong>.
        </Step>
        <Step n={8}>
          <strong>Confirm in Cloudflare.</strong> Go back to the Cloudflare tab. At the bottom of the
          nameserver page, click <strong>&ldquo;I&apos;ve updated my nameservers, check now&rdquo;</strong>.
          Cloudflare will check — it can take a few minutes up to 24 hours, but usually
          activates within 5-10 minutes. You&apos;ll see the domain status change
          to <strong>Active</strong> with a green checkmark.
        </Step>
        <Tip>
          You don&apos;t need to wait for nameserver activation to continue. Do the GitHub and
          Worker setup while it propagates. Just come back to verify it&apos;s <strong>Active</strong> before
          adding the custom domain to Pages (Part 8).
        </Tip>

        <h3>Part 4 — GitHub Account &amp; Repository</h3>
        <Step n={9}>
          <strong>Create a GitHub account.</strong> Go to <code>github.com</code> and sign up with
          the same Protonmail email. Choose the free plan. Verify the email.
        </Step>
        <Step n={10}>
          <strong>Generate the client template locally.</strong> From the CarMechanic
          project root (<code>/Users/Shared/CarMechanic</code>), run:
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
          The last argument is the vertical: <code>auto-repair</code> or <code>barber</code>.
        </Step>
        <Step n={11}>
          <strong>Create a GitHub repo and push.</strong> On GitHub, click <strong>+ New repository</strong>.
          Name it something like <code>client-site</code>. Keep it <strong>Private</strong>. Don&apos;t
          add a README. Then in your terminal:
          <pre className="help-code">
{`cd /Users/Shared/client-template-OUTPUT
git init
git add -A
git commit -m "Initial client site"
git remote add origin https://github.com/ACCOUNT/REPO.git
git push -u origin main`}
          </pre>
        </Step>

        <h3>Part 5 — Cloudflare Workers &amp; KV</h3>
        <Step n={12}>
          <strong>Authenticate wrangler to the client&apos;s account.</strong> In your terminal, run
          <code>npx wrangler login</code>. A browser window opens — sign in with the
          client&apos;s Cloudflare credentials (the Protonmail account from step 4). Once
          authenticated, wrangler commands will target their account.
        </Step>
        <Step n={13}>
          <strong>Create KV namespaces.</strong> These are the key-value stores for site content
          and rate limiting:
          <pre className="help-code">
{`npx wrangler kv namespace create CONTENT
npx wrangler kv namespace create RATE_LIMIT`}
          </pre>
          Each command prints an <code>id</code> — copy both. You&apos;ll paste them
          into <code>wrangler.toml</code> in step 15.
        </Step>
        <Step n={14}>
          <strong>Create R2 bucket for image uploads.</strong> In the Cloudflare dashboard &rarr;
          sidebar &rarr; <strong>R2 Object Storage</strong> &rarr; <strong>Create bucket</strong>.
          Name it <code>site-uploads</code>. Default settings are fine.
        </Step>
        <Step n={15}>
          <strong>Update wrangler.toml.</strong> Open <code>worker/wrangler.toml</code> in the
          generated output. Replace the placeholder IDs:
          <pre className="help-code">
{`[[kv_namespaces]]
binding = "CONTENT"
id = "paste-content-kv-id-here"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "paste-rate-limit-kv-id-here"

[[r2_buckets]]
binding = "UPLOADS"
bucket_name = "site-uploads"`}
          </pre>
        </Step>
        <Step n={16}>
          <strong>Deploy the Worker.</strong>
          <pre className="help-code">
{`cd worker
npx wrangler deploy`}
          </pre>
          The output prints the Worker URL (e.g.,
          <code>https://site-api.username.workers.dev</code>). Copy this — you need it
          for config.js and ALLOWED_ORIGIN.
        </Step>
        <Step n={17}>
          <strong>Set Worker secrets.</strong> These are encrypted environment variables — never
          visible in code or dashboard:
          <pre className="help-code">
{`npx wrangler secret put PASSWORD
# Type the admin password the client will use to log in

npx wrangler secret put TOKEN_SECRET
# Type a random 32+ character string (used for signing auth tokens)
# e.g.: client-site-secret-2026-randomchars

npx wrangler secret put ALLOWED_ORIGIN
# Type the site URL, e.g.: https://clientdomain.com
# For multiple: https://clientdomain.com,https://www.clientdomain.com`}
          </pre>
        </Step>
        <Tip>
          Keep a record of the PASSWORD you set — you&apos;ll give it to the client at handover.
          TOKEN_SECRET is internal, the client never sees it.
        </Tip>

        <h3>Part 6 — Update Config &amp; Seed Content</h3>
        <Step n={18}>
          <strong>Update config.js with Worker URL.</strong> Open the site&apos;s <code>config.js</code> file
          (in the subfolder, e.g., <code>site/autorepair/config.js</code>). Set <code>API_BASE</code> to
          the Worker URL from step 16 with <code>/api</code> appended:
          <pre className="help-code">
{`const API_BASE = "https://site-api.username.workers.dev/api";`}
          </pre>
        </Step>
        <Step n={19}>
          <strong>Commit and push the config change.</strong>
          <pre className="help-code">
{`git add -A
git commit -m "Set Worker API URL"
git push`}
          </pre>
        </Step>
        <Step n={20}>
          <strong>Seed content to KV.</strong> This loads the sample business data into the Worker&apos;s
          key-value store:
          <pre className="help-code">
{`cd worker
npx wrangler kv key put "business" \\
  --path ../sample-content.json \\
  --binding CONTENT --remote`}
          </pre>
        </Step>
        <Tip>
          The KV key MUST be <code>&ldquo;business&rdquo;</code> — that&apos;s the key name the Worker
          reads from. Using <code>&ldquo;content&rdquo;</code> or any other name will show
          &ldquo;Site loading... Content not yet configured.&rdquo;
        </Tip>

        <h3>Part 7 — Deploy to Cloudflare Pages</h3>
        <Step n={21}>
          <strong>Go to Cloudflare Pages.</strong> In the Cloudflare dashboard sidebar &rarr;
          <strong>Workers &amp; Pages</strong>. At the top it may say
          &ldquo;Looking to deploy Pages? Get started.&rdquo; — click that, or click
          <strong>Create</strong> &rarr; <strong>Pages</strong> &rarr; <strong>Connect to Git</strong>.
        </Step>
        <Step n={22}>
          <strong>Connect GitHub.</strong> Authorize Cloudflare to access the GitHub account.
          Select the repository you pushed in step 11.
        </Step>
        <Step n={23}>
          <strong>Configure build settings:</strong>
          <ul>
            <li>Framework preset: <strong>None</strong></li>
            <li>Build command: <em>(leave empty — the site is static, no build needed)</em></li>
            <li>Build output directory: <code>site</code></li>
            <li>Production branch: <code>main</code></li>
          </ul>
        </Step>
        <Step n={24}>
          <strong>Add environment variables (if needed).</strong> Under
          <strong>Environment variables</strong>, add:
          <ul>
            <li><code>NODE_VERSION</code> = <code>20</code></li>
          </ul>
          Then click <strong>Save and Deploy</strong>. Wait for the first deploy to complete —
          you&apos;ll see a green &ldquo;Success&rdquo; status and a <code>.pages.dev</code> URL.
        </Step>

        <h3>Part 8 — Custom Domain</h3>
        <Step n={25}>
          <strong>Add custom domain to Pages.</strong> In the Pages project &rarr;
          <strong>Custom domains</strong> tab &rarr; <strong>Set up a custom domain</strong>.
          Enter <code>clientdomain.com</code>, click <strong>Continue</strong> &rarr;
          <strong>Activate domain</strong>. Repeat for <code>www.clientdomain.com</code>.
          Cloudflare automatically creates the DNS records since the domain is already
          on this account.
        </Step>
        <Step n={26}>
          <strong>Update ALLOWED_ORIGIN to include the custom domain.</strong> The Worker
          needs to know which origins are allowed to call it:
          <pre className="help-code">
{`npx wrangler secret put ALLOWED_ORIGIN
# Enter: https://clientdomain.com,https://www.clientdomain.com`}
          </pre>
        </Step>
        <Tip>
          SSL certificates are provisioned automatically by Cloudflare. The site should be
          accessible via HTTPS within a few minutes of adding the custom domain.
        </Tip>

        <h3>Part 9 — Verify &amp; Handover</h3>
        <Step n={27}>
          <strong>Check the public site.</strong> Visit the custom domain in a browser — all
          sections should render with the client&apos;s business name, phone, and address.
        </Step>
        <Step n={28}>
          <strong>Check the browser console.</strong> Open DevTools (F12) &rarr; Console tab.
          There should be no errors — specifically no CSP, CORS, or fetch errors. If you
          see CORS errors, the ALLOWED_ORIGIN secret doesn&apos;t match the site URL.
        </Step>
        <Step n={29}>
          <strong>Test the editor.</strong> Go to <code>clientdomain.com/mysite/login.html</code>
          (or <code>/autorepair/mysite/login.html</code> for subfolder setups). Sign in with the
          PASSWORD from step 17. Edit some text, upload an image, toggle a section &mdash; verify
          changes save and persist on page reload.
        </Step>
        <Step n={30}>
          <strong>Hand over to the client.</strong> Give them:
          <ul>
            <li>Their site URL (e.g., <code>https://clientdomain.com</code>)</li>
            <li>The editor URL (e.g., <code>https://clientdomain.com/mysite/login.html</code>)</li>
            <li>The admin password</li>
            <li>A quick walkthrough: click any text to edit, hover images to replace,
                toggle sections on/off, changes save automatically</li>
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
