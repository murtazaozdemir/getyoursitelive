import type { Metadata } from "next";
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

const FEATURES = [
  { icon: "🌐", label: "Your Own Domain", body: "Registered in your name. First year included. You keep it forever." },
  { icon: "📱", label: "Mobile-First", body: "Built for phones first. Looks sharp on every device." },
  { icon: "📅", label: "Appointment Booking", body: "Customers request appointments any time — day or night." },
  { icon: "💰", label: "Services & Pricing", body: "Your services and prices, laid out clearly and on your terms." },
  { icon: "⭐", label: "Real Reviews", body: "Customer testimonials prominently featured to build trust." },
  { icon: "📞", label: "One-Tap Call", body: "One tap on any phone. Customers reach you instantly." },
  { icon: "🗺️", label: "Google Map", body: "Embedded map at the bottom of every page. Easy to find you." },
  { icon: "♾️", label: "Yours Forever", body: "No monthly fees. No subscriptions. Pay once, own it forever." },
];

const STEPS = [
  { n: "01", title: "We talk", body: "A 20-minute conversation. You describe what you want; I ask the questions you didn't know to answer." },
  { n: "02", title: "I build", body: "Professional site live in 5–7 business days. Modern tools, no shortcuts, no templates." },
  { n: "03", title: "You review", body: "Try it on your phone. We tweak anything until it looks and feels exactly right." },
  { n: "04", title: "It's yours", body: "Pay $500. Site goes live on your domain. You own it completely — forever." },
];

export default async function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <main className="lp-body min-h-screen bg-white text-[#111827] overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 h-16 md:px-10">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="font-semibold text-sm tracking-tight">Get Your Site Live</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features" className="hover:text-[#111827] transition-colors">Features</a>
            <a href="#process" className="hover:text-[#111827] transition-colors">How it works</a>
            <a href="#contact" className="hover:text-[#111827] transition-colors">Pricing</a>
          </nav>

          <a
            href="#contact"
            className="rounded-full bg-[#E85D29] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#cf4e20]"
          >
            Get started →
          </a>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-28 md:px-10 md:pt-32 md:pb-36">
        <div className="mx-auto max-w-4xl text-center">

          <div className="lp-mono inline-flex items-center gap-2 rounded-full bg-[#fff4f0] px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-[#E85D29]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E85D29]" aria-hidden />
            Flat $500 · No monthly fees · Yours forever
          </div>

          <h1 className="lp-display-heading mt-8 text-[clamp(3rem,7.5vw,7rem)] leading-[0.88] tracking-[-0.025em]">
            A real website<br />for your shop.
          </h1>

          <p className="mt-8 mx-auto max-w-2xl text-lg leading-relaxed text-gray-500 md:text-xl">
            Professional websites for auto repair shops and local businesses.
            Built in 5–7 days. No subscriptions. No agencies. No surprises.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#contact"
              className="rounded-full bg-[#E85D29] px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#cf4e20]"
            >
              Start your project →
            </a>
            <a
              href="#process"
              className="rounded-full border border-gray-200 px-8 py-3.5 text-base font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              See how it works
            </a>
          </div>

          {/* Social proof strip */}
          <div className="lp-mono mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-gray-400">
            <span>✓ Live in 5–7 days</span>
            <span className="hidden sm:inline text-gray-200">|</span>
            <span>✓ Mobile-ready</span>
            <span className="hidden sm:inline text-gray-200">|</span>
            <span>✓ No tech skills needed</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────── */}
      <section id="features" className="border-t border-gray-100 bg-gray-50 px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="lp-mono text-[11px] uppercase tracking-[0.25em] text-[#E85D29]">
              What&rsquo;s included
            </p>
            <h2 className="lp-display-heading mt-4 text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">
              Everything you need.<br />
              <span className="text-gray-400">Nothing you don&rsquo;t.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon, label, body }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 text-2xl">{icon}</div>
                <h3 className="font-semibold text-[#111827]">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────── */}
      <section id="process" className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="lp-mono text-[11px] uppercase tracking-[0.25em] text-[#E85D29]">
              The process
            </p>
            <h2 className="lp-display-heading mt-4 text-[clamp(2rem,4.5vw,3.75rem)] leading-[0.95] tracking-[-0.02em]">
              Four steps,<br />
              <span className="text-gray-400">start to finish.</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="relative">
                <div className="lp-display-numeral text-[4.5rem] leading-none text-[#E85D29] opacity-20 md:text-[5rem]">
                  {n}
                </div>
                <div className="-mt-4">
                  <h3 className="lp-display-subheading text-2xl text-[#111827]">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-500 md:text-base">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING + CONTACT ───────────────────────────────────────── */}
      <section
        id="contact"
        className="border-t border-gray-900 bg-[#111827] px-6 py-24 text-white md:px-10 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">

            {/* Pricing block */}
            <div>
              <p className="lp-mono text-[11px] uppercase tracking-[0.25em] text-[#E85D29]">
                Pricing
              </p>
              <h2 className="lp-display-heading mt-6 text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] tracking-[-0.02em]">
                One price.<br />That&rsquo;s it.
              </h2>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8">
                <div className="lp-display-stamp text-7xl text-[#E85D29]">$500</div>
                <div className="lp-mono mt-2 text-[11px] uppercase tracking-[0.25em] text-white/50">
                  one-time · yours forever
                </div>
                <ul className="mt-8 space-y-3">
                  {[
                    "Domain (first year included)",
                    "Mobile-ready design",
                    "Appointment booking form",
                    "Services & pricing page",
                    "Customer testimonials",
                    "Google Map embedded",
                    "No monthly fees, ever",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-white/70">
                      <span className="mt-0.5 text-[#E85D29]">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <p className="lp-mono text-[11px] uppercase tracking-[0.25em] text-[#E85D29]">
                Get in touch
              </p>
              <h2 className="lp-display-heading mt-6 text-[clamp(2rem,4vw,3.5rem)] leading-[0.95] tracking-[-0.02em]">
                Tell me about your business.
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/60">
                A few quick details and I&rsquo;ll get back to you within one business day.
                No sales calls, no newsletters, no follow-up pressure.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-8 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="lp-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
              Get Your Site Live
            </span>
          </div>
          <p className="lp-mono text-[11px] uppercase tracking-[0.2em] text-gray-400">
            © {year} · All rights reserved
          </p>
        </div>
      </footer>

    </main>
  );
}
