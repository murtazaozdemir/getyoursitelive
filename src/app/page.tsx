import type { Metadata } from "next";
import Link from "next/link";
import { listBusinesses } from "@/lib/db";
import { ContactForm } from "@/components/contact-form";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export const metadata: Metadata = {
  title: "Get Your Site Live — Websites for Local Business",
  description:
    "Professionally built websites for auto repair shops, salons, restaurants, and other local businesses. $500 flat, no monthly fees, yours forever.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Get Your Site Live — Websites for Local Business",
    description:
      "Professionally built websites for local businesses. $500 flat, no monthly fees, yours forever.",
    url: BASE_URL,
    type: "website",
    siteName: "Get Your Site Live",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Your Site Live — Websites for Local Business",
    description: "Professionally built websites for local businesses. $500 flat, no monthly fees.",
  },
};

// ======================================================================
// Editorial / print-magazine landing page
// Palette:  paper #F5EFE3 · ink #1A1815 · accent #E85D29 · muted #6B6660
// Type:     Fraunces (display serif) · Instrument Sans (body) · JetBrains Mono (accents)
// ======================================================================

export default async function LandingPage() {
  const demos = await listBusinesses();
  const year = new Date().getFullYear();

  return (
    <main className="lp-body relative min-h-screen bg-[#F5EFE3] text-[#1A1815] overflow-x-hidden">
      {/* Paper grain overlay --------------------------------------------- */}
      <div
        aria-hidden
        className="lp-grain pointer-events-none fixed inset-0 z-[60] opacity-[0.08] mix-blend-multiply"
      />

      {/* Crop marks in corners ------------------------------------------- */}
      <CropMark className="top-4 left-4" />
      <CropMark className="top-4 right-4" rotate={90} />
      <CropMark className="bottom-4 left-4" rotate={270} />
      <CropMark className="bottom-4 right-4" rotate={180} />

      {/* ============================================================
          MASTHEAD — editorial top strip
         ============================================================ */}
      <header className="relative z-10 border-b border-[#1A1815] px-6 py-4 md:px-12">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6">
          <div className="lp-mono flex items-baseline gap-3 text-[10px] uppercase tracking-[0.22em] md:text-xs">
            <span className="hidden h-2 w-2 rounded-full bg-[#E85D29] md:inline-block" />
            <span className="font-semibold">Get Your Site Live</span>
            <span className="hidden md:inline text-[#6B6660]">— Websites for Local Business</span>
          </div>
          <a
            href="#contact"
            className="lp-mono text-right text-[10px] uppercase tracking-[0.22em] text-[#1A1815] underline decoration-[#1A1815]/30 decoration-from-font underline-offset-[5px] transition-colors hover:decoration-[#E85D29] md:text-xs"
          >
            Contact →
          </a>
        </div>
      </header>

      {/* ============================================================
          HERO — left-aligned, editorial, bold serif
         ============================================================ */}
      <section className="relative z-10 px-6 pt-16 pb-28 md:px-12 md:pt-28 md:pb-40">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel number="001" label="The Proposition" />

          <h1 className="lp-display-heading mt-10 max-w-[14ch] text-[clamp(3rem,8.5vw,9rem)] leading-[0.9] tracking-[-0.02em]">
            Websites built the{" "}
            <em className="lp-display-em-wonk italic text-[#E85D29]">old-fashioned</em>{" "}
            way.
          </h1>

          <div className="mt-14 grid gap-12 md:grid-cols-[1fr_auto] md:items-end">
            <p className="max-w-xl text-lg leading-[1.6] text-[#3A3530] md:text-xl">
              No subscriptions. No marketing agencies. No monthly fees. Just one
              professionally built website for your shop, salon, or restaurant —
              <strong className="font-semibold"> built once, owned forever</strong>, for
              a flat <span className="text-[#E85D29] font-semibold">$500</span>.
            </p>

            <div className="flex flex-col items-start gap-5 md:items-end">
              <a href="#demos" className="lp-display-cta group relative text-2xl md:text-3xl">
                <span className="italic">See the work</span>
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1 text-[#E85D29]">
                  →
                </span>
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-100 bg-[#1A1815] transition-transform group-hover:scale-x-[1.02]" />
              </a>
              <a
                href="#contact"
                className="lp-mono text-xs uppercase tracking-[0.22em] underline decoration-[#1A1815]/30 decoration-from-font underline-offset-[6px] transition-colors hover:decoration-[#E85D29]"
              >
                Contact us →
              </a>
            </div>
          </div>
        </div>

        {/* Running baseline — decorative rule */}
        <div className="relative mx-auto mt-24 max-w-[1400px]">
          <div className="h-px w-full bg-[#1A1815]" />
          <span className="lp-mono absolute -top-[9px] left-0 bg-[#F5EFE3] px-3 text-[10px] uppercase tracking-[0.3em] text-[#6B6660]">
            ∎ Continue
          </span>
        </div>
      </section>

      {/* ============================================================
          002 — WHAT YOU GET (editorial list, not a card grid)
         ============================================================ */}
      <section className="relative z-10 px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-[auto_1fr] md:gap-24">
          <div>
            <SectionLabel number="002" label="The Spec Sheet" />
            <h2 className="lp-display-heading mt-8 text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]">
              What&rsquo;s in<br />
              <em className="lp-display-em italic">the box.</em>
            </h2>
          </div>

          <ul className="divide-y divide-[#1A1815]/20">
            {[
              ["Domain", "Your own domain name. Registered in your name. First year included."],
              ["Mobile", "Built mobile-first. Phones, tablets, desktop — all sharp."],
              ["Booking", "Customers request appointments around the clock."],
              ["Services", "Your services and prices laid out clearly, on your terms."],
              ["Reviews", "Real testimonials, prominently featured."],
              ["Call", "One tap. Dials you directly."],
              ["Map", "Embedded Google Map at the bottom of every page."],
              ["Yours", "No monthly fees. No subscriptions. Yours forever."],
            ].map(([label, body], i) => (
              <li
                key={label}
                className="group grid grid-cols-[auto_6rem_1fr] items-baseline gap-6 py-5 transition-colors hover:bg-[#1A1815]/[0.03] md:grid-cols-[3rem_8rem_1fr] md:gap-8"
              >
                <span className="lp-mono text-[11px] text-[#6B6660] tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="lp-mono text-xs uppercase tracking-[0.2em]">
                  {label}
                </span>
                <span className="text-base leading-relaxed text-[#3A3530] md:text-lg">{body}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============================================================
          003 — FEATURED WORK (demos) — asymmetric editorial showcase
         ============================================================ */}
      <section id="demos" className="relative z-10 border-t border-[#1A1815] bg-[#EEE7D7] px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex items-end justify-between gap-8">
            <div>
              <SectionLabel number="003" label="Featured Work" />
              <h2 className="lp-display-heading mt-8 text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]">
                Live <em className="lp-display-em italic">demonstrations.</em>
              </h2>
            </div>
            <p className="lp-mono hidden max-w-xs text-right text-sm text-[#6B6660] md:block">
              Click to open. Works on phones.
            </p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-14">
            {demos.map((biz, i) => (
              <Link
                key={biz.slug}
                href={`/${biz.slug}`}
                className="group block"
              >
                <div className="border-t-2 border-[#1A1815] pt-6">
                  <div className="flex items-center justify-between">
                    <span className="lp-mono text-[11px] uppercase tracking-[0.25em] text-[#6B6660]">
                      Work N°{String(i + 1).padStart(2, "0")} · {biz.category}
                    </span>
                    <span
                      className="text-[#E85D29] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                  <h3 className="lp-display-card mt-4 text-4xl leading-[1] md:text-5xl">
                    {biz.name}
                  </h3>
                  <p className="mt-3 italic text-[#6B6660]">
                    {biz.address}
                  </p>
                  <p className="lp-mono mt-6 inline-block text-sm uppercase tracking-[0.2em] underline decoration-from-font underline-offset-[5px] transition-colors group-hover:text-[#E85D29]">
                    View live →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          004 — HOW IT WORKS (big numerals, mono labels)
         ============================================================ */}
      <section className="relative z-10 px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <SectionLabel number="004" label="The Process" />
          <h2 className="lp-display-heading mt-8 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]">
            Four steps, <em className="lp-display-em italic">start to finish.</em>
          </h2>

          <ol className="mt-16 grid gap-y-12 md:grid-cols-2 md:gap-x-16 md:gap-y-16">
            {[
              ["We talk", "A 20-minute conversation. You describe what you want; I ask the questions you didn't know to answer."],
              ["I build", "Professional site live in 5–7 business days. Modern tools, no shortcuts."],
              ["You review", "Try it on your phone. We tweak anything until it's right."],
              ["It's yours", "Pay $500. Site goes live. You own it. Forever."],
            ].map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[6rem_1fr] gap-6 md:grid-cols-[8rem_1fr] md:gap-8">
                <div className="lp-display-numeral text-[6rem] leading-[0.85] text-[#E85D29] md:text-[8rem]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="lp-display-subheading text-2xl md:text-3xl">
                    {title}
                  </h3>
                  <p className="mt-3 text-base leading-[1.6] text-[#3A3530] md:text-lg">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================================================
          005 — CONTACT FORM (black section with price stamp + form)
         ============================================================ */}
      <section
        id="contact"
        className="relative z-10 border-t border-[#1A1815] bg-[#1A1815] px-6 py-24 text-[#F5EFE3] md:px-12 md:py-32"
      >
        <div className="mx-auto grid max-w-[1400px] gap-16 md:grid-cols-[auto_1fr] md:gap-20">
          {/* Price stamp + intro */}
          <div className="md:pt-8">
            <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full border-[3px] border-[#E85D29] text-[#E85D29] md:mx-0 md:h-[260px] md:w-[260px]">
              <div className="text-center">
                <div className="lp-mono text-[10px] uppercase tracking-[0.3em]">One Time</div>
                <div className="lp-display-stamp text-6xl md:text-7xl">$500</div>
                <div className="lp-mono text-[10px] uppercase tracking-[0.3em]">Yours Forever</div>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div>
            <SectionLabel number="005" label="Get In Touch" dark />
            <h2 className="lp-display-heading mt-8 max-w-[14ch] text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]">
              Tell me about{" "}
              <em className="lp-display-em italic text-[#E85D29]">your business.</em>
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-[1.6] text-[#C9C2B3]">
              A few quick details and I&rsquo;ll get back to you within one business day.
              No sales calls, no newsletters, no follow-up pressure.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* ============================================================
          COLOPHON / FOOTER — editorial endmark
         ============================================================ */}
      <footer className="relative z-10 border-t border-[#1A1815] bg-[#F5EFE3] px-6 py-10 md:px-12">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <div className="lp-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6660]">
            © {year} Get Your Site Live · All rights reserved
          </div>
          <div className="lp-mono flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#6B6660]">
            <span>Set in</span>
            <em className="lp-display">Fraunces</em>
            <span className="text-[#1A1815]">+</span>
            <span>Instrument Sans</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ======================================================================
// Helper components
// ======================================================================

function SectionLabel({
  number,
  label,
  dark = false,
}: {
  number: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="lp-mono flex items-center gap-4 text-[11px] uppercase tracking-[0.3em]">
      <span className={dark ? "text-[#E85D29]" : "text-[#E85D29]"}>{number}</span>
      <span className={`h-px w-10 ${dark ? "bg-[#C9C2B3]" : "bg-[#1A1815]"}`} />
      <span className={dark ? "text-[#C9C2B3]" : "text-[#1A1815]"}>{label}</span>
    </div>
  );
}

function CropMark({ className = "", rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      aria-hidden
      width="32"
      height="32"
      viewBox="0 0 32 32"
      className={`pointer-events-none absolute z-[70] text-[#1A1815] ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <line x1="0" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="1" />
      <line x1="16" y1="0" x2="16" y2="10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
