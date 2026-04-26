"use client";

import { useEffect, useRef, useState } from "react";
import { ContactModal } from "@/components/contact-modal";

// ── Types ────────────────────────────────────────────────────────────────

type ThemePref = "dark" | "light" | "auto";
type ResolvedTheme = "dark" | "light";

function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref !== "auto") return pref;
  const h = new Date().getHours();
  return h >= 7 && h < 20 ? "light" : "dark";
}

function formatBuildTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
    timeZone: "UTC", timeZoneName: "short",
  });
}

// ── Data ────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: "🌐", label: "Your Own Domain", body: "Registered in your name. First year included." },
  { icon: "📱", label: "Mobile-First", body: "Looks sharp on every device — phone, tablet, desktop." },
  { icon: "📋", label: "Contact Us Form", body: "Customers send you a message directly from your site." },
  { icon: "💰", label: "Services & Pricing", body: "Your services and prices, on your terms." },
  { icon: "⭐", label: "Testimonials", body: "Showcase quotes from happy customers. You add and manage them." },
  { icon: "📞", label: "One-Tap Call", body: "One tap on any phone — dials you directly." },
  { icon: "🗺️", label: "Google Map", body: "Embedded map at the bottom of every page." },
  { icon: "♾️", label: "Yours Forever", body: "No monthly fees. Pay once, own it forever." },
];

const STEPS = [
  { n: "01", title: "We talk", body: "20 minutes. You describe your business; I ask the questions you didn't think of." },
  { n: "02", title: "We build", body: "Live in 1–2 days. Professional tools, no shortcuts." },
  { n: "03", title: "Pick your theme", body: "Multiple design themes available. Switch any time from your dashboard." },
  { n: "04", title: "It's yours", body: "Pay once, go live. You own it completely — forever." },
];

// ── ThemeSwitcher ────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: ThemePref; label: string; icon: string }[] = [
  { value: "light", label: "Light",  icon: "☀️" },
  { value: "dark",  label: "Dark",   icon: "🌙" },
  { value: "auto",  label: "Auto",   icon: "🌓" },
];

function ThemeSwitcher({
  pref,
  onChange,
}: {
  pref: ThemePref;
  onChange: (p: ThemePref) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = THEME_OPTIONS.find((o) => o.value === pref)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
      >
        <span>{current.icon}</span>
        <span>Theme</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 text-slate-700">
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </span>
              {pref === opt.value && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="#E85D29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────

export function LandingPageClient({
  year,
  version,
  buildTime,
}: {
  year: number;
  version: string;
  buildTime: string;
}) {
  const [pref, setPref] = useState<ThemePref>("light");

  // Hydrate from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lp-theme") as ThemePref | null;
    if (saved && ["dark", "light", "auto"].includes(saved)) setPref(saved);
  }, []);

  // Auto mode: re-evaluate resolved theme every minute
  const [, setTick] = useState(0);
  useEffect(() => {
    if (pref !== "auto") return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [pref]);

  function handleChange(p: ThemePref) {
    setPref(p);
    localStorage.setItem("lp-theme", p);
  }

  const resolved: ResolvedTheme = resolveTheme(pref);

  return (
    <div
      className="lp-page lp-body min-h-screen bg-white text-[#0F172A]"
      data-lp-theme={resolved}
    >

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
          <div className="flex items-center gap-3">
            <ContactModal
              label="Get started →"
              className="rounded-full bg-[#E85D29] px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#cf4e20]"
            />
            <ThemeSwitcher pref={pref} onChange={handleChange} />
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="lp-surface px-6 pb-16 pt-20 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">

          {/* Mock browser bar */}
          <div className="lp-surface-bar mx-auto mb-10 flex max-w-xs items-center gap-3 rounded-full border px-4 py-2.5">
            <div className="flex shrink-0 gap-1">
              <span className="lp-surface-dot h-2 w-2 rounded-full" />
              <span className="lp-surface-dot h-2 w-2 rounded-full" />
              <span className="lp-surface-dot h-2 w-2 rounded-full" />
            </div>
            <div className="flex flex-1 items-center justify-center gap-1.5 overflow-hidden">
              <span className="text-green-500 text-xs">🔒</span>
              <span className="lp-mono lp-surface-muted truncate text-xs">
                your<span style={{ color: "var(--lp-hero-fg)", fontWeight: 600 }}>business</span>.com
              </span>
            </div>
          </div>

          <h1 className="lp-display-heading text-[clamp(2.75rem,7.5vw,6.5rem)] leading-[0.88] tracking-[-0.025em]">
            Your own .com.<br />
            <span className="lp-surface-muted">Not a Facebook page.</span>
          </h1>

          <p className="lp-surface-muted mx-auto mt-7 max-w-lg text-base leading-relaxed md:text-lg">
            A professional website on a domain you own —
            fully customizable, no monthly fees. Ever.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ContactModal
              label="Get your site live →"
              className="rounded-full bg-[#E85D29] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#cf4e20]"
            />
            <a
              href="#features"
              className="lp-surface-btn-ghost rounded-full border px-7 py-3 text-sm font-medium transition-colors"
            >
              See what&rsquo;s included
            </a>
          </div>

          {/* Social proof strip */}
          <div className="lp-mono lp-surface-divider mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] uppercase tracking-[0.18em]">
            <span>✓ Domain registered in your name</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ Live in 1–2 days</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ You own it forever</span>
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

          {/* Admin panel — killer feature */}
          <div className="mb-3 overflow-hidden rounded-xl bg-[#0F172A] p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="lp-mono text-[10px] uppercase tracking-[0.25em] text-[#E85D29]">
                  ✦ Included with every site
                </span>
                <h3 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                  Fully customize your site — any time, 24/7.
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/50">
                  Every site comes with a built-in admin panel. Swap your own photos, rewrite
                  your services, change your hours, update pricing — directly on the page,
                  from your phone or laptop. No developer, no wait, no cost. Changes go live instantly.
                </p>
              </div>
              <div className="shrink-0 grid grid-cols-2 gap-2 text-xs text-white/40 md:grid-cols-1">
                {["Upload your own photos", "Edit any text, any time", "Update hours & pricing", "Toggle sections on/off"].map(f => (
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
            <p className="hidden text-sm text-slate-400 md:block">Start to live in 1–2 days.</p>
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
              <h2 className="lp-display-heading text-[clamp(2rem,4vw,3.25rem)] leading-tight tracking-[-0.02em]">
                Ready to get started?
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/50">
                Domain included for the first year. Live in 1–2 days.
                No monthly fees, ever. You own the domain and site outright.
              </p>
            </div>
            <ContactModal
              label="Get your site live →"
              className="shrink-0 rounded-full bg-[#E85D29] px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#cf4e20]"
            />
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 border-t border-white/10 pt-10 sm:grid-cols-4">
            {["Domain (yr 1 incl.)", "Mobile-ready design", "Contact Us form", "Services & pricing",
              "Testimonials section", "One-tap calling", "Google Map", "Admin panel included"].map((item) => (
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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E85D29]" aria-hidden />
            <span className="lp-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Get Your Site Live
            </span>
            <span className="lp-mono text-[11px] text-slate-300">
              v{version}
            </span>
            <span className="lp-mono text-[11px] text-slate-300">
              ({formatBuildTime(buildTime)})
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
