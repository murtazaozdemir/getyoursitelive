/**
 * Shared proposal body — used by both single proposal page and bulk print.
 * Server component (no "use client").
 */

export interface ProposalContentProps {
  name: string;
  address: string;
  category: string;
  domains: string[];
  shortUrl: string | null;
  qrImageUrl: string;
  today: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string | null;
  sellerAddress: string | null;
}

/** Map DB category to customer-friendly terms used in proposal copy */
function categoryTerms(category: string): { searchTerm: string; placeLabel: string; domainExample: string } {
  const c = category.toLowerCase();
  if (c.includes("barber") || c.includes("hair"))
    return { searchTerm: "a barber", placeLabel: "shop", domainExample: "yourbarber.com" };
  if (c.includes("restaurant") || c.includes("food") || c.includes("dining"))
    return { searchTerm: "a restaurant", placeLabel: "restaurant", domainExample: "yourrestaurant.com" };
  if (c.includes("plumb"))
    return { searchTerm: "a plumber", placeLabel: "business", domainExample: "yourplumbing.com" };
  if (c.includes("auto body") || c.includes("collision") || c.includes("detail"))
    return { searchTerm: "an auto body shop", placeLabel: "shop", domainExample: "yourbodyshop.com" };
  if (c.includes("auto") || c.includes("repair") || c.includes("mechanic") || c.includes("car"))
    return { searchTerm: "a mechanic", placeLabel: "shop", domainExample: "yourautorepair.com" };
  return { searchTerm: "a local business like yours", placeLabel: "business", domainExample: "yourbusiness.com" };
}

export function ProposalContent({
  name,
  address,
  category,
  domains,
  shortUrl,
  qrImageUrl,
  today,
  sellerName,
  sellerEmail,
  sellerPhone,
  sellerAddress,
}: ProposalContentProps) {
  const terms = categoryTerms(category);
  return (
    <div className="proposal">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <header className="proposal-header">
        <div className="proposal-header-from">
          <strong>Get Your Site Live</strong>
          <span>getyoursitelive.com</span>
          <span>Proposal</span>
        </div>
        <div className="proposal-header-to">
          <span className="proposal-header-label">Prepared for</span>
          <strong className="proposal-header-shopname">{name}</strong>
          <span>{address}</span>
          <span>{today}</span>
        </div>
      </header>

      {/* ── OPENING LETTER ─────────────────────────────────────── */}
      <section className="proposal-letter">
        <p className="proposal-salutation">Dear {name} team,</p>
        <p>
          I put together a website preview for {name}. It&rsquo;s
          already live — you can scan the QR code below or type the
          link to see exactly how it looks on your phone.
        </p>
        <p>
          Everything you see can be changed. No commitment &mdash;
          just take a look and let me know what you think.
        </p>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">Why not just use Facebook or Yelp?</h2>
        <table className="proposal-table">
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Platform</span></th>
              <th>Found on Google</th>
              <th>Yours to keep</th>
              <th>No monthly cost</th>
              <th>Your own .com <span style={{ fontWeight: 400, fontSize: "0.85em" }}>(not a subdomain)</span></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Facebook page</td>
              <td className="no">&#x2717;</td><td className="no">&#x2717;</td>
              <td className="yes">&#x2713;</td><td className="no">&#x2717;</td>
            </tr>
            <tr>
              <td>Yelp / Yellow Pages</td>
              <td className="yes">&#x2713;</td><td className="no">&#x2717;</td>
              <td className="no">&#x2717;</td><td className="no">&#x2717;</td>
            </tr>
            <tr>
              <td>Wix / Squarespace</td>
              <td className="yes">&#x2713;</td><td className="no">&#x2717;</td>
              <td className="no">&#x2717;</td><td className="no">&#x2717;</td>
            </tr>
            <tr className="proposal-table-highlight">
              <td><strong>Your own site</strong></td>
              <td className="yes">&#x2713;</td><td className="yes">&#x2713;</td>
              <td className="yes">&#x2713;</td><td className="yes">&#x2713;</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ── DEMO ────────────────────────────────────────────────── */}
      <section className="proposal-section proposal-section--demo">
        <h2 className="proposal-section-title">Your site is already built</h2>
        <p className="proposal-body">
          Try it on your phone — scan the QR code or type the link below.
        </p>
        <div className="proposal-demo-row">
          <div className="proposal-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImageUrl} alt="QR code to preview site" className="proposal-qr-code" />
            <p className="proposal-qr-label">Scan to open your site</p>
          </div>
          <div className="proposal-demo-links">
            {shortUrl && (
              <a href={shortUrl} className="proposal-demo-url proposal-demo-url--short" target="_blank" rel="noreferrer">
                {shortUrl.replace("https://", "")}
              </a>
            )}
            <p className="proposal-body proposal-body--small" style={{ marginTop: 4 }}>
              This is a live preview. Once you go ahead, your site
              moves to your own domain.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT THIS DOES FOR YOUR SHOP ──────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">What this gets you</h2>
        <ul className="proposal-checklist proposal-checklist--single">
          {[
            `People searching for ${terms.searchTerm} nearby can actually find you`,
            "You stop losing calls to competitors who show up first",
            "Customers can call you in one tap from their phone",
            `Your ${terms.placeLabel} looks professional \u2014 not like a side hustle`,
            "You control everything: prices, hours, photos, services",
          ].map(item => (
            <li key={item}><span className="proposal-check">&#x2713;</span>{item}</li>
          ))}
        </ul>
      </section>

      {/* ── WHAT'S INCLUDED ───────────────────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">What&rsquo;s included</h2>
        <ul className="proposal-checklist">
          {[
            `Your own domain name (e.g. ${domains[0] ?? terms.domainExample}) \u2014 registered in your name`,
            "Full website with your services, pricing, hours, and location",
            "Appointment request form that works 24/7",
            "Click-to-call button on every page",
            "Google Maps showing your address",
            "Customer reviews section",
            "Works on phones, tablets, and computers",
            "Admin panel \u2014 change any text, photo, or price yourself",
          ].map(item => (
            <li key={item}><span className="proposal-check">&#x2713;</span>{item}</li>
          ))}
        </ul>
        <div className="proposal-no-fees">
          All of the above for a one-time $500 — no monthly fees, no subscriptions, no surprises.
        </div>
      </section>

      {/* ── DOMAIN SUGGESTIONS ─────────────────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">Domain options for {name}</h2>
        <div className="proposal-domains">
          {domains.map(d => (
            <div key={d} className="proposal-domain-chip">{d}</div>
          ))}
        </div>
        <p className="proposal-body proposal-body--small">
          These are suggestions — availability can change. When you&rsquo;re
          ready, I&rsquo;ll confirm which ones are still open. If none work,
          we&rsquo;ll find one you like. First year of registration is
          included; after that it renews for about $15/year directly with
          the registrar.
        </p>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">How it works</h2>
        <ol className="proposal-steps proposal-steps--how">
          <li>
            <strong>20-minute conversation.</strong> You tell me what
            services to list and what photos you have. No photos? I
            handle it.
          </li>
          <li>
            <strong>I build it in 1–2 days.</strong> You review it and
            tell me what to change.
          </li>
          <li>
            <strong>It goes live.</strong> Your domain, your site, done.
          </li>
        </ol>
      </section>

      {/* ── Q&A ──────────────────────────────────────────────────── */}
      <section className="proposal-section">
        <h2 className="proposal-section-title">Common questions</h2>
        <div className="proposal-qa">
          <div className="proposal-qa-item">
            <p className="proposal-qa-q">I already have a Facebook page.</p>
            <p className="proposal-qa-a">
              Facebook reaches people who already follow you. A website
              reaches the ones who don&rsquo;t know you exist yet — they&rsquo;re
              searching Google, and that&rsquo;s where a website shows up.
              They work together, not instead of each other.
            </p>
          </div>
          <div className="proposal-qa-item">
            <p className="proposal-qa-q">I have plenty of customers already.</p>
            <p className="proposal-qa-a">
              That&rsquo;s great — and that&rsquo;s the best time to set this
              up, not when business slows down or a competitor opens nearby.
              It costs nothing extra later, but takes weeks to build if you
              wait until you need it.
            </p>
          </div>
          <div className="proposal-qa-item">
            <p className="proposal-qa-q">I had a website before and it didn&rsquo;t help.</p>
            <p className="proposal-qa-a">
              Most generic builders don&rsquo;t set things up for local search
              — your address, phone, and hours need to be structured so Google
              can read them, and the site needs to load fast on phones. I
              handle both.
            </p>
          </div>
        </div>
      </section>

      {/* ── NEXT STEPS + CONTACT — kept together on same page ── */}
      <div className="proposal-closing">
        <section className="proposal-section">
          <h2 className="proposal-section-title">Next step</h2>
          <div className="proposal-next-steps">
            <div className="proposal-next-step">
              <p>
                If you like what you see, I can make this live for you
                within a few days. It takes about 20 minutes to set up.
              </p>
              <p style={{ marginTop: "0.5rem" }}>
                Call or text me and I&rsquo;ll handle everything &mdash;
                domain, setup, the whole thing.
              </p>
              <p style={{ marginTop: "0.5rem", fontSize: "9.5pt", color: "#666" }}>
                If now isn&rsquo;t the right time, keep this page &mdash;
                the offer stands whenever you&rsquo;re ready.
                One-time $500, no monthly costs.
              </p>
            </div>
          </div>
        </section>

        <footer className="proposal-footer">
          <div className="proposal-contact">
            <strong className="proposal-contact-name">{sellerName}</strong>
            {sellerAddress && <span>{sellerAddress}</span>}
            <span>{sellerEmail}</span>
            {sellerPhone && <span>{sellerPhone}</span>}
            <span className="proposal-contact-demo">getyoursitelive.com</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
