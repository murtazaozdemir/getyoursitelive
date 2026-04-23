import type { Metadata } from "next";
import { ContactModal } from "@/components/contact-modal";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export const metadata: Metadata = {
  title: "Get Your Site Live — Websites for Local Business",
  description:
    "Professionally built websites for auto repair shops, salons, restaurants, and other local businesses. $500 flat, no monthly fees, yours forever.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Get Your Site Live — Websites for Local Business",
    description: "Professionally built websites for local businesses. $500 flat, no monthly fees, yours forever.",
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
  { icon: "🌐", label: "Your Own Domain", body: "Registered in your name. First year included." },
  { icon: "📱", label: "Mobile-First", body: "Looks sharp on every device — phone, tablet, desktop." },
  { icon: "📋", label: "Contact Form", body: "Customers reach you directly through your site." },
  { icon: "💰", label: "Services & Pricing", body: "Your services and prices, on your terms." },
  { icon: "⭐", label: "Real Reviews", body: "Customer testimonials, prominently featured." },
  { icon: "📞", label: "One-Tap Call", body: "One tap on any phone — dials you directly." },
  { icon: "🗺️", label: "Google Map", body: "Embedded map at the bottom of every page." },
  { icon: "♾️", label: "Yours Forever", body: "No monthly fees. Pay once, own it forever." },
];

const STEPS = [
  { n: "01", title: "We talk", body: "20 minutes. You describe your shop; I ask the questions you didn't think of." },
  { n: "02", title: "I build", body: "Live in 5–7 business days. Professional tools, no shortcuts." },
  { n: "03", title: "You review", body: "Try it on your phone. We adjust until it's exactly right." },
  { n: "04", title: "It's yours", body: "Pay once, go live. You own it completely — forever." },
];

export default function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="lp-body min-h-screen bg-white text-[#0F172A]">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="text-sm font-semibold tracking-tight">Get Your Site Live</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm text-slate-500 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">Features</a>
            <a href="#process" className="transition-colors hover:text-slate-900">How it works</a>
          </nav>
          <ContactModal
            label="Get started →"
            className="rounded-full bg-[#E85D29] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#cf4e20]"
          />
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="bg-[#0F172A] px-6 pb-16 pt-20 text-white md:pb-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <span className="lp-mono inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/50">
            Flat fee · No monthly fees · Yours forever
          </span>
          <h1 className="lp-display-heading mt-6 text-[clamp(2.75rem,7vw,6rem)] leading-[0.9] tracking-[-0.025em]">
            A real website<br />for your shop.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
            Professional websites for auto repair shops and local businesses.
            Built in 5–7 days. No subscriptions. No agencies.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ContactModal
              label="Start your project →"
              className="rounded-full bg-[#E85D29] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#cf4e20]"
            />
            <a
              href="#features"
              className="rounded-full border border-white/10 px-7 py-3 text-sm font-medium text-white/60 transition-colors hover:border-white/20 hover:text-white/80"
            >
              See what&rsquo;s included
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-b border-slate-100 px-6 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="lp-display-heading text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.02em]">
              Everything included.
            </h2>
            <p className="hidden text-sm text-slate-400 md:block">No surprises.</p>
          </div>

          {/* Admin panel — killer feature callout */}
          <div className="mb-3 overflow-hidden rounded-xl bg-[#0F172A] p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="lp-mono text-[10px] uppercase tracking-[0.25em] text-[#E85D29]">
                  ✦ Included with every site
                </span>
                <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                  You control your site. No developer needed.
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                  Every site comes with a built-in admin panel. Update your hours, services,
                  photos, pricing, and reviews yourself — from any device, any time.
                  Click-to-edit directly on the page. Changes go live instantly.
                </p>
              </div>
              <div className="shrink-0 grid grid-cols-2 gap-2 text-xs text-white/40 md:grid-cols-1">
                {["Edit content inline", "Upload your own photos", "Toggle sections on/off", "Update hours & pricing"].map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <span className="text-[#E85D29]">✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {FEATURES.map(({ icon, label, body }) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 text-xl">{icon}</div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section id="process" className="px-6 py-14 md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="lp-display-heading text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight tracking-[-0.02em]">
              Four steps.
            </h2>
            <p className="hidden text-sm text-slate-400 md:block">Start to live in under 2 weeks.</p>
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 md:grid-cols-4">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="bg-white p-6">
                <span className="lp-mono text-[11px] font-semibold tracking-[0.15em] text-[#E85D29]">{n}</span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-slate-100 bg-[#0F172A] px-6 py-14 text-white md:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="lp-mono text-[11px] uppercase tracking-[0.2em] text-[#E85D29]">One-time · No subscriptions</p>
              <h2 className="lp-display-heading mt-3 text-[clamp(2rem,4vw,3.25rem)] leading-tight tracking-[-0.02em]">
                $500. Yours forever.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                Domain included for the first year. Live in under two weeks.
                No monthly fees, ever. You own the domain and site outright.
              </p>
            </div>
            <ContactModal
              label="Get your site live →"
              className="shrink-0 rounded-full bg-[#E85D29] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#cf4e20]"
            />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-10 sm:grid-cols-4">
            {["Domain (yr 1 incl.)", "Mobile-ready design", "Contact form", "Services & pricing",
              "Customer reviews", "One-tap calling", "Google Map", "Admin panel included"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                <span className="text-[#E85D29]">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-100 px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="lp-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Get Your Site Live</span>
          </div>
          <p className="lp-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
            © {year}
          </p>
        </div>
      </footer>

    </div>
  );
}
