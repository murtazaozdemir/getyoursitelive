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
          <li><a href="#zip-search">Zip Search</a></li>
          <li><a href="#users">User Management</a></li>
          <li><a href="#templates">Business Categories &amp; Templates</a></li>
          <li><a href="#tools">Founder Tools</a></li>
        </ol>
      </nav>

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
