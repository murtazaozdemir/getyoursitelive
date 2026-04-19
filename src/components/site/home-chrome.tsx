"use client";

import { Clock, MapPin, Menu, Phone, Wrench, X } from "lucide-react";
import { businessInfo } from "@/data/site-content";
import { ThemeName } from "@/types/site";
import { navItems } from "@/components/site/home.constants";

export function LoadingOverlay({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-content-center bg-[var(--bg)]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
    </div>
  );
}

export function Topbar() {
  return (
    <div className="hidden border-b border-[var(--border)] bg-[var(--surface-2)] py-2 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-sm">
        <div className="flex items-center gap-4">
          <a href="https://maps.google.com/?q=1234+Main+Street+Springfield+IL+62701" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {businessInfo.address}
          </a>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Mon - Fri: 7am - 7pm</span>
        </div>
        <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-1 font-semibold">
          <Phone className="h-4 w-4 text-[var(--accent)]" /> {businessInfo.phone}
        </a>
      </div>
    </div>
  );
}

export function ThemeSelect({
  value,
  onChange,
}: {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm" htmlFor="theme-switcher">
      Theme
      <select
        id="theme-switcher"
        value={value}
        onChange={(event) => onChange(event.target.value as ThemeName)}
        className="ml-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
        aria-label="Choose website theme"
      >
        <option value="industrial">Industrial</option>
        <option value="modern">Modern</option>
        <option value="luxury">Luxury</option>
        <option value="friendly">Friendly</option>
      </select>
    </label>
  );
}

export function SiteHeader({
  theme,
  onThemeChange,
  mobileOpen,
  onMobileToggle,
}: {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
  mobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/70 bg-[var(--surface)]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <a href="#home" className="flex items-center gap-2 font-semibold">
            <Wrench className="h-5 w-5 text-[var(--accent)]" />
            <span>{businessInfo.name}</span>
          </a>
          <ul className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <li key={item}>
                <a className="capitalize hover:text-[var(--accent)]" href={`#${item}`}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeSelect value={theme} onChange={onThemeChange} />
            <a href="#contact" className="rounded-full bg-[var(--accent)] px-4 py-2 font-semibold text-[var(--accent-ink)]">
              Book Now
            </a>
          </div>
          <button className="md:hidden" onClick={() => onMobileToggle(true)} aria-label="Open menu">
            <Menu />
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] p-6 md:hidden">
          <button className="ml-auto" onClick={() => onMobileToggle(false)} aria-label="Close menu">
            <X />
          </button>
          <div className="mt-10 flex flex-col gap-5 text-2xl">
            {navItems.map((item) => (
              <a key={item} href={`#${item}`} onClick={() => onMobileToggle(false)} className="capitalize">
                {item}
              </a>
            ))}
            <ThemeSelect value={theme} onChange={onThemeChange} />
          </div>
        </div>
      )}
    </>
  );
}
