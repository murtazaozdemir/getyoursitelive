import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, isFounder } from "@/lib/users";

export const metadata = {
  title: "Help · Admin",
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

function FounderBadge() {
  return <span className="help-founder-badge">Founder only</span>;
}

export default async function HelpPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!canManageBusinesses(user)) redirect("/admin");

  const founder = isFounder(user);

  return (
    <div className="admin-page help-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Help &amp; Guide</h1>
          <p className="admin-lede">
            Everything you need to know about using the admin platform.
          </p>
        </div>
      </div>

      {/* Table of contents */}
      <nav className="help-toc">
        <h3 className="help-toc-title">Contents</h3>
        <ol className="help-toc-list">
          <li><a href="#overview">How the Platform Works</a></li>
          <li><a href="#leads">Managing Leads</a></li>
          <li><a href="#pipeline">Pipeline Stages</a></li>
          <li><a href="#lead-detail">Working a Lead</a></li>
          <li><a href="#tasks">Tasks &amp; Canvassing</a></li>
          <li><a href="#proposals">Proposals</a></li>
          <li><a href="#clients">Clients</a></li>
          <li><a href="#sites">Preview Sites &amp; Editing</a></li>
          <li><a href="#account">Your Account</a></li>
          {founder && <li><a href="#zip-search">Zip Search</a></li>}
          {founder && <li><a href="#users">User Management</a></li>}
          {founder && <li><a href="#templates">Business Categories &amp; Templates</a></li>}
          {founder && <li><a href="#tools">Founder Tools</a></li>}
          <li><a href="#commission">Commission &amp; Attribution</a></li>
          <li><a href="#tips">Tips &amp; Best Practices</a></li>
        </ol>
      </nav>

      {/* ─── OVERVIEW ─── */}
      <Section id="overview" title="How the Platform Works">
        <p>
          Get Your Site Live sells $500 one-time websites to local businesses.
          The system works like this:
        </p>
        <Step n={1}>
          <strong>Find leads.</strong> Discover local businesses that need a website
          — either by searching Google Places (Zip Search) or adding them manually.
        </Step>
        <Step n={2}>
          <strong>Preview site is auto-created.</strong> The moment a lead is added,
          the system generates a full preview website at <code>getyoursitelive.com/business-name</code> with
          realistic content tailored to their business type (auto repair, barber shop, restaurant, etc.).
        </Step>
        <Step n={3}>
          <strong>Contact the business.</strong> Visit the shop in person with a printed
          proposal showing a QR code to their preview site. Move them through the pipeline:
          Found &rarr; Contacted &rarr; Interested &rarr; Paid &rarr; Delivered.
        </Step>
        <Step n={4}>
          <strong>Close the sale.</strong> Once they pay, customize their site with real
          content, buy their domain, and deliver. They graduate from Leads to Clients automatically.
        </Step>
      </Section>

      {/* ─── LEADS ─── */}
      <Section id="leads" title="Managing Leads">
        <h3>Adding a Lead</h3>
        <p>
          Click <strong>+ Add lead</strong> on the Leads page. Only the business name is required.
          The system will:
        </p>
        <ul>
          <li>Generate a unique URL slug (appends city/state if the name collides with an existing lead)</li>
          <li>Create a full preview site with template content matching their business category</li>
          <li>Suggest up to 3 domain names automatically</li>
          <li>Check for duplicate phone numbers to prevent adding the same business twice</li>
        </ul>

        <h3>Two View Modes</h3>
        <p>
          <strong>Pipeline view</strong> shows leads as a kanban board grouped by stage — best for tracking
          progress at a glance.
        </p>
        <p>
          <strong>Cards view</strong> shows leads as selectable cards with checkboxes — best for
          bulk actions like creating tasks, printing proposals, or printing labels.
        </p>

        <h3>Filtering &amp; Sorting</h3>
        <p>
          Use the filter bar to narrow down by status, city, state, zip, category, or data
          completeness (domains missing, no website, etc.). The geo dropdowns cascade — picking a
          state filters the city and zip lists.
        </p>
        <p>
          The <strong>Distance</strong> filter lets you enter a zip code and sort leads by how far
          they are from that location. Useful for planning canvassing routes.
        </p>
      </Section>

      {/* ─── PIPELINE ─── */}
      <Section id="pipeline" title="Pipeline Stages">
        <div className="help-stages">
          <div className="help-stage">
            <span className="help-stage-badge help-stage--found">Found</span>
            <p>Discovered but not yet contacted. Every new lead starts here.</p>
          </div>
          <div className="help-stage">
            <span className="help-stage-badge help-stage--contacted">Contacted</span>
            <p>
              First outreach made (visited, called, or emailed). <strong>Important:</strong> the
              first person to move a lead to Contacted gets permanently credited for commission.
              After this, only that person (or the Founder) can advance the lead further.
            </p>
          </div>
          <div className="help-stage">
            <span className="help-stage-badge help-stage--interested">Interested</span>
            <p>
              The business owner has shown interest — they looked at the preview, asked questions,
              or said they want to move forward.
            </p>
          </div>
          <div className="help-stage">
            <span className="help-stage-badge help-stage--paid">Paid</span>
            <p>
              Payment received. The lead automatically moves to the <strong>Clients</strong> page.
              Time to customize their site with real content.
            </p>
          </div>
          <div className="help-stage">
            <span className="help-stage-badge help-stage--delivered">Delivered</span>
            <p>
              Domain purchased, site fully customized and handed off. The job is done.
            </p>
          </div>
        </div>
      </Section>

      {/* ─── LEAD DETAIL ─── */}
      <Section id="lead-detail" title="Working a Lead">
        <p>
          Click any lead to open its detail page. Everything you need is here:
        </p>
        <ul>
          <li><strong>Stage buttons</strong> — click any stage to move the lead forward (or back)</li>
          <li><strong>Contact info</strong> — edit name, phone, address, and category inline</li>
          <li><strong>Preview link</strong> — the full URL and a short print-friendly URL with copy buttons</li>
          <li><strong>Notes</strong> — add timestamped notes about interactions, calls, visits</li>
          <li><strong>Activity log</strong> — see every action taken on this lead and by whom</li>
          <li><strong>Domain options</strong> — suggest and save up to 3 domain names</li>
          <li><strong>Google data</strong> — rating, reviews, category, website, and Maps link (if available)</li>
        </ul>
        <h3>Quick Actions</h3>
        <ul>
          <li><strong>View preview site</strong> — opens the auto-generated site in a new tab</li>
          <li><strong>Edit site</strong> — opens the site editor to customize content</li>
          <li><strong>View proposal</strong> — opens the printable sales proposal</li>
          <li><strong>Delete lead</strong> — permanently removes the lead and its preview site (use with caution)</li>
        </ul>
      </Section>

      {/* ─── TASKS ─── */}
      <Section id="tasks" title="Tasks &amp; Canvassing">
        <p>
          Tasks are checklists for in-person canvassing runs. Here&apos;s the workflow:
        </p>
        <Step n={1}>
          <strong>Select leads.</strong> Go to Leads &rarr; Cards view, check the boxes next to
          the businesses you want to visit.
        </Step>
        <Step n={2}>
          <strong>Create a task.</strong> Click <strong>Create task</strong>. A new task is
          created with today&apos;s date and all selected leads as items.
        </Step>
        <Step n={3}>
          <strong>Prepare materials.</strong> From the task page, use the toolbar buttons:
        </Step>
        <ul>
          <li><strong>Print proposals</strong> — generates all proposals back-to-back, auto-opens print dialog</li>
          <li><strong>Print labels</strong> — generates mailing/envelope labels for each lead</li>
          <li><strong>Print task list</strong> — a formatted checklist to carry with you</li>
          <li><strong>Show map</strong> — opens Google Maps with a route from your home address to all leads</li>
        </ul>
        <Step n={4}>
          <strong>Hit the road.</strong> Visit each business. Check off items as you drop off
          proposals. Add notes about each visit directly on the task page.
        </Step>
        <Step n={5}>
          <strong>Mark complete.</strong> When all items are done, mark the task as complete.
        </Step>
        <Tip>
          Set your home address in <strong>My Account &rarr; Account settings</strong> so the map
          route starts from the right place and distance calculations on the Leads page work correctly.
        </Tip>
      </Section>

      {/* ─── PROPOSALS ─── */}
      <Section id="proposals" title="Proposals">
        <p>
          Each lead has a print-ready proposal you can hand or mail to the business owner.
          Access it from the lead detail page or print in bulk from Tasks.
        </p>
        <h3>What&apos;s in a Proposal</h3>
        <ul>
          <li>Personalized letter addressed to the business</li>
          <li>QR code linking directly to their preview site</li>
          <li>Comparison table: Facebook vs Yelp vs Wix vs their own site</li>
          <li>Feature checklist: domain, website, appointment form, click-to-call, maps, reviews, admin panel</li>
          <li>Pricing: $500 one-time, no monthly fees</li>
          <li>Up to 3 suggested domain names</li>
          <li>Common objections answered</li>
          <li>Your contact info (from your Account settings)</li>
        </ul>
        <Tip>
          The first time you view a proposal, it records <strong>Proposal sent</strong> with your
          name and the date. This shows up on the lead card and in the audit log.
        </Tip>
      </Section>

      {/* ─── CLIENTS ─── */}
      <Section id="clients" title="Clients">
        <p>
          The Clients page shows businesses that have been paid for. Leads automatically
          graduate here when moved to the <strong>Paid</strong> stage.
        </p>
        <p>
          From here you can filter and sort clients, view their site preview, access the site editor,
          and see who was credited for the sale.
        </p>
      </Section>

      {/* ─── SITES ─── */}
      <Section id="sites" title="Preview Sites &amp; Editing">
        <p>
          Every lead gets a live preview site the moment they&apos;re added. The content is
          auto-generated based on their business category — an auto repair shop gets mechanic-specific
          services, testimonials, and FAQs; a barber shop gets haircut services, etc.
        </p>
        <h3>Two Editing Modes</h3>
        <p>
          <strong>Inline mode</strong> (recommended) — click <strong>Edit site</strong> on the lead
          detail page. You&apos;ll see the actual public site with click-to-edit text, image upload
          buttons, and section visibility toggles. Every edit auto-saves instantly.
        </p>
        <p>
          <strong>Form mode</strong> — available at <code>/business-name/admin</code>. Shows the same
          content as tabbed forms. Better for bulk edits and structured fields.
        </p>
        <h3>What You Can Edit</h3>
        <ul>
          <li>Business name, tagline, logo, phone, email, address</li>
          <li>Hero section: headline, description, call-to-action buttons, background image</li>
          <li>About section: story, key selling points, images</li>
          <li>Services: name, description, price, duration, features</li>
          <li>Deals &amp; specials with badge and pricing</li>
          <li>Team members with photos</li>
          <li>Testimonials with customer names and context</li>
          <li>FAQs, pricing cards, stats</li>
          <li>Contact info, business hours, emergency banner</li>
          <li>Section visibility toggles — show or hide any section</li>
        </ul>
        <h3>Short URLs</h3>
        <p>
          Each lead has a short URL (e.g., <code>getyoursitelive.com/p/42</code>) that&apos;s
          easier to print on proposals and labels. Find it on the lead detail page.
        </p>
      </Section>

      {/* ─── ACCOUNT ─── */}
      <Section id="account" title="Your Account">
        <p>
          Go to <strong>My Account &rarr; Account settings</strong> to manage your profile.
        </p>
        <h3>Profile Info</h3>
        <p>
          Your name, phone, and <strong>home address</strong> are used in two places:
        </p>
        <ul>
          <li><strong>Proposals</strong> — your contact info appears at the bottom</li>
          <li><strong>Distance &amp; Maps</strong> — your address is the starting point for map routes and distance calculations</li>
        </ul>
        <Tip>
          Make sure your address is filled in. Without it, the map route button and distance
          sorting won&apos;t work.
        </Tip>
        <h3>Email &amp; Password</h3>
        <p>
          You can change your login email and password from the same page. Changing your email
          signs you out immediately — you&apos;ll need to sign back in with the new email.
        </p>
      </Section>

      {/* ─── FOUNDER-ONLY SECTIONS ─── */}
      {founder && (
        <>
          <Section id="zip-search" title="Zip Search">
            <FounderBadge />
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

          <Section id="users" title="User Management">
            <FounderBadge />
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

          <Section id="templates" title="Business Categories &amp; Templates">
            <FounderBadge />
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

          <Section id="tools" title="Founder Tools">
            <FounderBadge />
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
        </>
      )}

      {/* ─── COMMISSION ─── */}
      <Section id="commission" title="Commission &amp; Attribution">
        <p>
          The platform tracks who converts each lead for commission purposes.
        </p>
        <ul>
          <li>
            The <strong>first person</strong> to move a lead from &ldquo;Found&rdquo; to &ldquo;Contacted&rdquo;
            is permanently credited. Their name, email, and timestamp are stored.
          </li>
          <li>
            After a lead is contacted, <strong>only the credited person</strong> (or the Founder)
            can advance it further. Other admins will see a lock icon.
          </li>
          <li>
            Attribution is visible on the lead detail page, on pipeline cards, and on client cards.
          </li>
        </ul>
        <Tip>
          Don&apos;t click &ldquo;Contacted&rdquo; until you&apos;ve actually made contact.
          Once set, attribution cannot be changed (except by the Founder).
        </Tip>
      </Section>

      {/* ─── TIPS ─── */}
      <Section id="tips" title="Tips &amp; Best Practices">
        <h3>Before You Start</h3>
        <ul>
          <li>Fill in your full profile in Account settings — your address powers distance sorting and map routes, and your contact info appears on proposals</li>
          <li>Familiarize yourself with the Pipeline and Cards views — use Pipeline for daily tracking, Cards for bulk operations</li>
        </ul>
        <h3>Canvassing Workflow</h3>
        <ul>
          <li>Use distance sorting to find leads near your location</li>
          <li>Select nearby leads in Cards view and create a task</li>
          <li>Print proposals and labels from the task page</li>
          <li>Use the map button to plan your driving route</li>
          <li>Check off leads as you drop off proposals</li>
          <li>Add notes immediately — &ldquo;owner was interested, call back Tuesday&rdquo;</li>
        </ul>
        <h3>Follow-Up</h3>
        <ul>
          <li>Move leads to &ldquo;Interested&rdquo; as soon as they engage</li>
          <li>Use notes to track every interaction</li>
          <li>Filter by &ldquo;Contacted&rdquo; stage to see your active follow-up list</li>
          <li>Check the preview site before visiting — make sure it looks good for their category</li>
        </ul>
        <h3>Keeping Data Clean</h3>
        <ul>
          <li>The &ldquo;Data&rdquo; filter shows leads with missing domains or addresses — clean these up regularly</li>
          <li>Always add a phone number if you have one — the system uses it to prevent duplicates</li>
          <li>If a lead is a dead end, you can delete it (but consider just leaving it at &ldquo;Found&rdquo; as a record)</li>
        </ul>
      </Section>
    </div>
  );
}
