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
    <main
      className="relative min-h-screen bg-[#F5EFE3] text-[#1A1815] overflow-x-hidden"
      style={{
        fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
      }}
    >
      {/* Paper grain overlay --------------------------------------------- */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] opacity-[0.08] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.9'/></svg>\")",
        }}
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
          <div
            className="flex items-baseline gap-3 text-[10px] uppercase tracking-[0.22em] md:text-xs"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <span className="hidden h-2 w-2 rounded-full bg-[#E85D29] md:inline-block" />
            <span className="font-semibold">Get Your Site Live</span>
            <span className="hidden md:inline text-[#6B6660]">— Websites for Local Business</span>
          </div>
          <a
            href="#contact"
            className="text-right text-[10px] uppercase tracking-[0.22em] text-[#1A1815] underline decoration-[#1A1815]/30 decoration-from-font underline-offset-[5px] transition-colors hover:decoration-[#E85D29] md:text-xs"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
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

          <h1
            className="mt-10 max-w-[14ch] text-[clamp(3rem,8.5vw,9rem)] font-light leading-[0.9] tracking-[-0.02em]"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
            }}
          >
            Websites built the{" "}
            <em
              className="italic text-[#E85D29]"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100, 'WONK' 1" }}
            >
              old-fashioned
            </em>{" "}
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
              <a
                href="#demos"
                className="group relative text-2xl md:text-3xl"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontVariationSettings: "'opsz' 48, 'SOFT' 60",
                }}
              >
                <span className="italic">See the work</span>
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1 text-[#E85D29]">
                  →
                </span>
                <span className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left scale-x-100 bg-[#1A1815] transition-transform group-hover:scale-x-[1.02]" />
              </a>
              <a
                href="#contact"
                className="text-xs uppercase tracking-[0.22em] underline decoration-[#1A1815]/30 decoration-from-font underline-offset-[6px] transition-colors hover:decoration-[#E85D29]"
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                Contact us →
              </a>
            </div>
          </div>
        </div>

        {/* Running baseline — decorative rule */}
        <div className="relative mx-auto mt-24 max-w-[1400px]">
          <div className="h-px w-full bg-[#1A1815]" />
          <span
            className="absolute -top-[9px] left-0 bg-[#F5EFE3] px-3 text-[10px] uppercase tracking-[0.3em] text-[#6B6660]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
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
            <h2
              className="mt-8 text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontVariationSettings: "'opsz' 144, 'SOFT' 30",
                fontWeight: 300,
              }}
            >
              What&rsquo;s in<br />
              <em className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>
                the box.
              </em>
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
                <span
                  className="text-[11px] text-[#6B6660] tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
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
              <h2
                className="mt-8 text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]"
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontVariationSettings: "'opsz' 144, 'SOFT' 30",
                  fontWeight: 300,
                }}
              >
                Live <em className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>demonstrations.</em>
              </h2>
            </div>
            <p
              className="hidden max-w-xs text-right text-sm text-[#6B6660] md:block"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
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
                    <span
                      className="text-[11px] uppercase tracking-[0.25em] text-[#6B6660]"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      Work N°{String(i + 1).padStart(2, "0")} · {biz.category}
                    </span>
                    <span
                      className="text-[#E85D29] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                      aria-hidden
                    >
                      →
                    </span>
                  </div>
                  <h3
                    className="mt-4 text-4xl leading-[1] md:text-5xl"
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontVariationSettings: "'opsz' 72, 'SOFT' 40",
                      fontWeight: 400,
                    }}
                  >
                    {biz.name}
                  </h3>
                  <p className="mt-3 text-[#6B6660]" style={{ fontStyle: "italic" }}>
                    {biz.address}
                  </p>
                  <p
                    className="mt-6 inline-block text-sm uppercase tracking-[0.2em] underline decoration-from-font underline-offset-[5px] transition-colors group-hover:text-[#E85D29]"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
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
          <h2
            className="mt-8 max-w-[12ch] text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]"
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
              fontWeight: 300,
            }}
          >
            Four steps, <em className="italic" style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}>start to finish.</em>
          </h2>

          <ol className="mt-16 grid gap-y-12 md:grid-cols-2 md:gap-x-16 md:gap-y-16">
            {[
              ["We talk", "A 20-minute conversation. You describe what you want; I ask the questions you didn't know to answer."],
              ["I build", "Professional site live in 5–7 business days. Modern tools, no shortcuts."],
              ["You review", "Try it on your phone. We tweak anything until it's right."],
              ["It's yours", "Pay $500. Site goes live. You own it. Forever."],
            ].map(([title, body], i) => (
              <li key={title} className="grid grid-cols-[6rem_1fr] gap-6 md:grid-cols-[8rem_1fr] md:gap-8">
                <div
                  className="text-[6rem] leading-[0.85] text-[#E85D29] md:text-[8rem]"
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontVariationSettings: "'opsz' 144, 'SOFT' 100",
                    fontWeight: 300,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3
                    className="text-2xl md:text-3xl"
                    style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontVariationSettings: "'opsz' 48, 'SOFT' 40",
                      fontWeight: 400,
                    }}
                  >
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
                <div
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  One Time
                </div>
                <div
                  className="text-6xl md:text-7xl"
                  style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontVariationSettings: "'opsz' 144, 'SOFT' 100",
                    fontWeight: 500,
                  }}
                >
                  $500
                </div>
                <div
                  className="text-[10px] uppercase tracking-[0.3em]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  Yours Forever
                </div>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div>
            <SectionLabel number="005" label="Get In Touch" dark />
            <h2
              className="mt-8 max-w-[14ch] text-[clamp(2.5rem,5vw,5rem)] leading-[0.95] tracking-[-0.01em]"
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontVariationSettings: "'opsz' 144, 'SOFT' 30",
                fontWeight: 300,
              }}
            >
              Tell me about{" "}
              <em
                className="italic text-[#E85D29]"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
              >
                your business.
              </em>
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
          <div
            className="text-[10px] uppercase tracking-[0.22em] text-[#6B6660]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            © {year} Get Your Site Live · All rights reserved
          </div>
          <div
            className="flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#6B6660]"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <span>Set in</span>
            <em style={{ fontFamily: "var(--font-fraunces)" }}>Fraunces</em>
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
    <div
      className="flex items-center gap-4 text-[11px] uppercase tracking-[0.3em]"
      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
    >
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
