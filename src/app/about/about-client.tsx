"use client";

import { ContactModal } from "@/components/contact-modal";

export function AboutPageClient({ year }: { year: number }) {
  return (
    <div className="lp-page lp-body min-h-screen bg-white text-[#0F172A]" data-lp-theme="light">

      {/* ── NAV (same as landing) ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">Get Your Site Live</span>
          </a>
          <nav className="hidden items-center gap-7 text-sm text-slate-500 md:flex">
            <a href="/#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="/#process" className="transition-colors hover:text-slate-900">How it works</a>
            <a href="/about" className="text-slate-900 font-medium">About Us</a>
          </nav>
          <div className="flex items-center gap-3">
            <ContactModal
              label="Get started →"
              className="rounded-full bg-[#E85D29] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#cf4e20]"
            />
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <main className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            About Us
          </h1>

          <div className="mt-8 space-y-6 text-base leading-relaxed text-slate-600">
            <p>
              <strong className="text-slate-900">SALESFORCE HUB LLC</strong> is a New Jersey based
              company specializing in developing computer applications for small businesses to help
              them establish and grow their online presence. We believe every local business deserves
              a professional website — without the complexity, recurring fees, or technical headaches
              that come with most web solutions.
            </p>

            <p>
              Our flagship product, <strong className="text-slate-900">Get Your Site Live</strong>,
              is a website builder purpose-built for local service businesses — auto repair shops,
              barber shops, restaurants, plumbers, and more. We build each site with real content,
              real photos, and a design tailored to the business, then hand it over for a one-time
              flat fee. No monthly charges, no subscriptions — the site is yours forever.
            </p>

            <p>
              We handle everything: domain registration, mobile-responsive design, contact forms,
              service listings, testimonials, and ongoing support. Our goal is simple — get your
              business online, fast, and keep it running without you having to think about it.
            </p>
          </div>

          {/* ── CONTACT INFO ── */}
          <div className="mt-14 rounded-xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
            <dl className="mt-5 space-y-3 text-sm text-slate-600">
              <div className="flex gap-3">
                <dt className="font-medium text-slate-500 w-20 shrink-0">Company</dt>
                <dd>SALESFORCE HUB LLC</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-slate-500 w-20 shrink-0">Address</dt>
                <dd>225 Arlington Ave, Clifton, NJ 07011</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-slate-500 w-20 shrink-0">Email</dt>
                <dd>
                  <a href="mailto:info@getyoursitelive.com" className="text-[#E85D29] hover:underline">
                    info@getyoursitelive.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-slate-500 w-20 shrink-0">Website</dt>
                <dd>
                  <a href="https://getyoursitelive.com" className="text-[#E85D29] hover:underline">
                    getyoursitelive.com
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-slate-500 w-20 shrink-0">State</dt>
                <dd>New Jersey, USA</dd>
              </div>
            </dl>
          </div>

        </div>
      </main>

      {/* ── FOOTER (same as landing) ── */}
      <footer className="border-t border-slate-100 px-6 py-5 mt-auto">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E85D29]" aria-hidden />
              <span className="lp-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                SALESFORCE HUB LLC — Get Your Site Live
              </span>
            </div>
            <span className="lp-mono text-[11px] text-slate-300 ml-3.5">
              225 Arlington Ave, Clifton, NJ 07011 · <a href="mailto:info@getyoursitelive.com" className="hover:text-slate-400 transition-colors">info@getyoursitelive.com</a>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <p className="lp-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              © {year}
            </p>
            <a
              href="/admin/login"
              className="lp-mono text-[11px] text-slate-200 transition-colors hover:text-slate-400"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
