import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { PrintButton } from "./print-button";
import "./proposal.css";

const NOISE_WORDS = [
  "auto","repair","center","shop","garage","service","services",
  "automotive","motors","car","cars","mechanic","llc","inc","&","and",
];

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/^-+|-+$/g, "");
}

function domainSuggestions(name: string): string[] {
  const baseClean = slugify(name);
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const words = name.toLowerCase().split(/\s+/);
  const core = words.filter(w => !NOISE_WORDS.includes(slugify(w))).map(slugify).join("") || baseClean;
  return [...new Set([
    `${baseClean}.com`,
    `${core}auto.com`,
    `${base.replace(/-/g, "")}nj.com`,
  ])].slice(0, 3);
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return <div style={{ padding: "2rem" }}>Not authorized.</div>;
  }

  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const domains = domainSuggestions(biz.businessInfo.name);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const previewUrl = `${siteUrl}/${slug}`;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const name = biz.businessInfo.name;

  return (
    <>
      {/* Print toolbar — hidden when printing */}
      <div className="proposal-toolbar no-print">
        <span className="proposal-toolbar-label">Proposal for {name}</span>
        <PrintButton />
      </div>

      <div className="proposal">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header className="proposal-header">
          <div className="proposal-header-from">
            <strong>Murtaza Ozdemir</strong>
            <span>Get Your Site Live · Local web design, NJ</span>
            <span>murtazaozdemir@gmail.com</span>
            <span>862-686-1571</span>
          </div>
          <div className="proposal-header-to">
            <span className="proposal-header-label">Prepared for</span>
            <strong className="proposal-header-shopname">{name}</strong>
            <span>{biz.businessInfo.address}</span>
            <span>{today}</span>
          </div>
        </header>

        {/* ── OPENING LETTER ─────────────────────────────────────── */}
        <section className="proposal-letter">
          <p className="proposal-salutation">Dear {name} owner,</p>
          <p>
            When someone needs a mechanic and doesn&rsquo;t have a shop in
            mind, they search Google — not Facebook, not Yelp. A website
            is how {name} shows up in those results.
          </p>
          <p>
            I&rsquo;ve been working in web design and technology for around
            20&nbsp;years. I&rsquo;m now focused on helping local businesses
            get a proper website — built once, no monthly fees,
            no subscriptions, you own it.
          </p>
        </section>

        {/* ── COMPARISON TABLE ───────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">How the options compare</h2>
          <table className="proposal-table">
            <thead>
              <tr>
                <th></th>
                <th>Shows on Google</th>
                <th>You own it</th>
                <th>No monthly fees</th>
                <th>Professional look</th>
                <th>Takes bookings</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Facebook page</td>
                <td className="no">✗</td><td className="no">✗</td>
                <td className="yes">✓</td><td className="no">✗</td><td className="no">✗</td>
              </tr>
              <tr>
                <td>Google Sites / free builders</td>
                <td className="no">✗</td><td className="no">✗</td>
                <td className="yes">✓</td><td className="no">✗</td><td className="no">✗</td>
              </tr>
              <tr>
                <td>Wix / Squarespace</td>
                <td className="yes">✓</td><td className="no">✗</td>
                <td className="no">✗</td><td className="yes">✓</td><td className="yes">✓</td>
              </tr>
              <tr>
                <td>Yelp / Yellow Pages</td>
                <td className="yes">✓</td><td className="no">✗</td>
                <td className="no">✗</td><td className="no">✗</td><td className="no">✗</td>
              </tr>
              <tr className="proposal-table-highlight">
                <td><strong>Your own website</strong></td>
                <td className="yes">✓</td><td className="yes">✓</td>
                <td className="yes">✓</td><td className="yes">✓</td><td className="yes">✓</td>
              </tr>
            </tbody>
          </table>
          <p className="proposal-body proposal-body--small">
            Each option has trade-offs. The main difference with your own site
            is that you control it and there&rsquo;s no ongoing fee to a platform.
          </p>
        </section>

        {/* ── WHAT YOU GET ───────────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">What I build for you</h2>
          <ul className="proposal-checklist">
            {[
              "Your address, phone, hours, and services — laid out clearly",
              "Services and pricing page (you choose what to list)",
              "Appointment request form — customers can send requests 24/7",
              "Customer review section",
              "Google Maps pointing to your address",
              "Click-to-call button — one tap and it dials your number",
              "4 design styles to choose from",
              "Works perfectly on phones, tablets, and computers",
              "Simple admin panel — change any text, photo, or hours yourself, no technical knowledge needed",
            ].map(item => (
              <li key={item}><span className="proposal-check">✓</span>{item}</li>
            ))}
          </ul>
        </section>

        {/* ── DOMAIN SUGGESTIONS ─────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">Your domain name</h2>
          <p className="proposal-body">
            The $500 package includes registering a domain name for your shop —
            that&rsquo;s the web address customers type to reach you
            (e.g.&nbsp;<em>starautorepair.com</em>). It&rsquo;s registered in
            your name, so you own it. Based on your shop name, here are
            a few options worth considering:
          </p>
          <p className="proposal-body">
            Having your own domain makes a difference in a few practical ways:
          </p>
          <ul className="proposal-checklist proposal-checklist--single">
            {[
              "Looks professional — starautorepair.com vs. starauto.wixsite.com/home",
              "Google treats it as a real business, not a subdomain of someone else's platform",
              "Your email can match — contact@starautorepair.com instead of a Gmail address",
              "You own it permanently — it stays yours even if you switch who builds your site",
              "Customers remember it and type it directly",
            ].map(item => (
              <li key={item}><span className="proposal-check">✓</span>{item}</li>
            ))}
          </ul>
          <div className="proposal-domains">
            {domains.map(d => (
              <div key={d} className="proposal-domain-chip">{d}</div>
            ))}
          </div>
          <p className="proposal-body proposal-body--small">
            These are suggestions — if you have a preference for something
            different, we can check availability when we talk. I generally
            recommend <strong>.com</strong> since most people default to
            typing it. The first year of registration is included; after
            that it renews directly with the registrar for around $15/year.
          </p>
        </section>

        {/* ── DEMO ───────────────────────────────────────────────── */}
        <section className="proposal-section proposal-section--demo">
          <h2 className="proposal-section-title">See your preview site</h2>
          <p className="proposal-body">
            In the meantime, I&rsquo;ve already built and parked a complete
            site for {name} at the address below. You can open it right now
            and see exactly what it looks like — try it on your phone too.
            Once your domain is registered, your site will move there and
            this temporary address won&rsquo;t be used anymore.
          </p>
          <a href={previewUrl} className="proposal-demo-url" target="_blank" rel="noreferrer">
            {previewUrl}
          </a>

          <div className="proposal-screenshots">
            <img
              src="/proposal-screenshots/desktop.png"
              alt="Website — desktop view"
              className="proposal-screenshot"
            />
            <img
              src="/proposal-screenshots/fullpage.png"
              alt="Website — full page"
              className="proposal-screenshot"
            />
            <img
              src="/proposal-screenshots/mobile.png"
              alt="Website — mobile view"
              className="proposal-screenshot"
            />
          </div>
        </section>

        {/* ── HOW IT WORKS ───────────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">How it works</h2>
          <ol className="proposal-steps proposal-steps--how">
            <li>
              <strong>We sit down for 20 minutes.</strong> You tell me what you
              want on the site, what services to list, and what photos you have.
              If you don&rsquo;t have photos, I can work around it.
            </li>
            <li>
              <strong>I build your site in 1–2 days.</strong> I use
              modern tools that let me build quickly without cutting corners.
            </li>
            <li>
              <strong>You review it</strong> and we tweak anything you want.
            </li>
            <li>
              <strong>It goes live.</strong> You own it.
            </li>
          </ol>
        </section>

        {/* ── PRICE ──────────────────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">What it costs</h2>
          <p className="proposal-body">
            <strong>$500, one time.</strong> That covers the website, registering
            the domain name, and getting everything set up and live.
          </p>
          <p className="proposal-body">
            The first year of your domain name is included. After that, you
            continue paying for it directly — it&rsquo;s a small annual fee
            that keeps the domain yours.
          </p>
          <p className="proposal-body">
            Hosting is free as long as you stay on the same platform. No
            monthly bills, no subscriptions from me.
          </p>
        </section>

        {/* ── THE MATH ───────────────────────────────────────────── */}
        <section className="proposal-section proposal-section--math">
          <p className="proposal-math-line">
            To put it in perspective: <strong>$500 once</strong> vs. $500 every month for ads that stop the moment you stop paying.
          </p>
          <p className="proposal-math-sub">
            A website keeps working whether you&rsquo;re open, closed, or busy.
          </p>
        </section>

        {/* ── Q&A ────────────────────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">Common questions</h2>

          <div className="proposal-qa">
            <div className="proposal-qa-item">
              <p className="proposal-qa-q">I already have a Facebook page — isn&rsquo;t that enough?</p>
              <p className="proposal-qa-a">
                Facebook works well for people who already follow you. But when
                a new customer is searching Google for a mechanic nearby,
                Facebook pages don&rsquo;t show up in the results — a website
                does. The two serve different purposes. A website reaches people
                who don&rsquo;t know you exist yet.
              </p>
            </div>

            <div className="proposal-qa-item">
              <p className="proposal-qa-q">Why $500? Is it worth it?</p>
              <p className="proposal-qa-a">
                The $500 covers the full build — design, your domain name,
                hosting setup, and getting everything live. It&rsquo;s a
                one-time cost, not a subscription. If it brings in a few new
                customers over the course of a year, it more than pays for
                itself. And even if it doesn&rsquo;t, you still walk away with
                an asset rather than a monthly bill.
              </p>
            </div>

            <div className="proposal-qa-item">
              <p className="proposal-qa-q">My nephew can build it for me.</p>
              <p className="proposal-qa-a">
                Perfectly fair. If it gets done and works well, great. If they
                get busy or it never finishes, I&rsquo;m still here. A lot of
                shops I talk to went down that path and ended up with an
                unfinished site or one that looked rough on phones.
              </p>
            </div>

            <div className="proposal-qa-item">
              <p className="proposal-qa-q">I have plenty of customers already. Do I really need this?</p>
              <p className="proposal-qa-a">
                The site really isn&rsquo;t for today — it&rsquo;s for when
                you need it. A competitor opening nearby, a slow month, a key
                employee leaving. Having the site ready when that happens costs
                nothing extra now, but it takes weeks to build if you wait.
              </p>
            </div>

            <div className="proposal-qa-item">
              <p className="proposal-qa-q">I had a website before and it didn&rsquo;t bring me customers.</p>
              <p className="proposal-qa-a">
                Most generic website builders don&rsquo;t set things up properly
                for local search. The main fixes aren&rsquo;t complicated —
                making sure your address, phone, and hours are listed correctly,
                and that the site loads fast on phones. I handle both as part of
                the build.
              </p>
            </div>

            <div className="proposal-qa-item">
              <p className="proposal-qa-q">What if I&rsquo;m not ready to decide right now?</p>
              <p className="proposal-qa-a">
                No pressure. Keep this page somewhere handy. Whenever you&rsquo;re
                ready — next week, next month, next year — just reach out.
              </p>
            </div>
          </div>
        </section>

        {/* ── NEXT STEPS ─────────────────────────────────────────── */}
        <section className="proposal-section">
          <h2 className="proposal-section-title">Next steps</h2>
          <div className="proposal-next-steps">
            <div className="proposal-next-step">
              <span className="proposal-next-step-label">Ready to go</span>
              <p>Reach out and we&rsquo;ll set up a 20-minute conversation to work out the details. I&rsquo;ll confirm domain availability while we talk.</p>
            </div>
            <div className="proposal-next-step">
              <span className="proposal-next-step-label">Have questions</span>
              <p>Email or call. No pressure — I&rsquo;ll answer anything straight.</p>
            </div>
            <div className="proposal-next-step">
              <span className="proposal-next-step-label">Not the right time</span>
              <p>Keep this page. Whenever the timing is right, reach out.</p>
            </div>
          </div>
        </section>

        {/* ── CONTACT ────────────────────────────────────────────── */}
        <footer className="proposal-footer">
          <div className="proposal-contact">
            <strong className="proposal-contact-name">Murtaza Ozdemir</strong>
            <span>78 Arlington Ave, Clifton, NJ 07011</span>
            <span>murtazaozdemir@gmail.com</span>
            <span>862-686-1571</span>
          </div>
        </footer>

      </div>
    </>
  );
}
