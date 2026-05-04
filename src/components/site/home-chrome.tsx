"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Cloud,
  Cog,
  Flower2,
  Gem,
  MapPin,
  Menu,
  Phone,
  Smile,
  Sparkles,
  Sun,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableImage } from "@/components/editable/editable-image";
import { ThemeName } from "@/types/site";
import type { NavLabels } from "@/types/site";
const navItems = ["home", "about", "services", "technicians", "contact"] as const;

// Theme metadata — icon + label per theme.
const THEME_OPTIONS: Array<{ value: ThemeName; label: string; Icon: LucideIcon }> = [
  { value: "industrial", label: "Industrial", Icon: Cog },
  { value: "modern", label: "Modern", Icon: Sparkles },
  { value: "luxury", label: "Luxury", Icon: Gem },
  { value: "friendly", label: "Friendly", Icon: Smile },
  { value: "sunshine", label: "Sunshine", Icon: Sun },
  { value: "garden", label: "Garden", Icon: Flower2 },
  { value: "sky", label: "Sky", Icon: Cloud },
];

/**
 * Brand mark — uses the shop's custom logo image if `logoUrl` is set,
 * otherwise falls back to the default wrench icon.
 */
function BrandMark({ logoUrl, name }: { logoUrl: string; name: string }) {
  if (logoUrl) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={logoUrl} alt={`${name} logo`} className="brand-logo" />;
  }
  return <Wrench className="brand-icon" aria-hidden />;
}

export function LoadingOverlay({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-content-center bg-[var(--bg)]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--accent)]" />
    </div>
  );
}

export function Topbar() {
  const { businessInfo } = useBusiness();
  const edit = useEditMode();

  function patchInfo<K extends keyof typeof businessInfo>(
    key: K,
    value: (typeof businessInfo)[K],
  ) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }

  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(businessInfo.address)}`;
  return (
    <div className="hidden border-b border-[var(--border)] bg-[var(--surface-2)] py-2 md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-sm">
        {edit ? (
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <EditableText
              value={businessInfo.address}
              onCommit={(v) => patchInfo("address", v)}
              placeholder="Street address"
            />
          </span>
        ) : (
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> {businessInfo.address}
          </a>
        )}
        {edit ? (
          <span className="flex items-center gap-1 font-semibold">
            <Phone className="h-4 w-4 text-[var(--accent)]" />
            <EditableText
              value={businessInfo.phone}
              onCommit={(v) => patchInfo("phone", v)}
              placeholder="Phone"
            />
          </span>
        ) : (
          <a href={`tel:${businessInfo.phone}`} className="flex items-center gap-1 font-semibold">
            <Phone className="h-4 w-4 text-[var(--accent)]" /> {businessInfo.phone}
          </a>
        )}
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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = THEME_OPTIONS.find((t) => t.value === value) ?? THEME_OPTIONS[0];
  const CurrentIcon = current.Icon;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="theme-switcher">
      <button
        type="button"
        className="theme-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${current.label}. Click to change.`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="theme-switcher-label">Theme</span>
        <CurrentIcon className="theme-switcher-current-icon" aria-hidden />
        <ChevronDown
          className={`theme-switcher-chevron${open ? " theme-switcher-chevron--open" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <ul role="listbox" aria-label="Choose theme" className="theme-switcher-menu">
          {THEME_OPTIONS.map(({ value: v, label, Icon }) => {
            const selected = v === value;
            return (
              <li key={v} role="option" aria-selected={selected}>
                <button
                  type="button"
                  className={`theme-switcher-option${selected ? " theme-switcher-option--selected" : ""}`}
                  onClick={() => {
                    onChange(v);
                    setOpen(false);
                  }}
                >
                  <Icon className="theme-switcher-option-icon" aria-hidden />
                  <span className="theme-switcher-option-label">{label}</span>
                  {selected && (
                    <Check className="theme-switcher-check" aria-label="Selected" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
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
  const { businessInfo, navLabels } = useBusiness();
  const edit = useEditMode();

  function patchInfo<K extends keyof typeof businessInfo>(
    key: K,
    value: (typeof businessInfo)[K],
  ) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }
  function patchNav<K extends keyof NavLabels>(key: K, value: NavLabels[K]) {
    edit?.updateField("navLabels", { ...navLabels, [key]: value });
  }

  return (
    <>
      <header className="site-header sticky top-0 z-40 border-b border-[var(--border)]/70 bg-[var(--surface)]/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          {edit ? (
            <span className="brand">
              <EditableImage
                value={businessInfo.logoUrl}
                onCommit={(url) => patchInfo("logoUrl", url)}
                uploadLabel={businessInfo.logoUrl ? "Replace logo" : "Upload logo"}
                removeLabel="Remove logo (revert to wrench icon)"
              >
                <BrandMark logoUrl={businessInfo.logoUrl} name={businessInfo.name} />
              </EditableImage>
              <span className="brand-name">
                <EditableText
                  value={businessInfo.name}
                  onCommit={(v) => patchInfo("name", v)}
                  placeholder="Shop name"
                />
              </span>
            </span>
          ) : (
            <a href="#home" className="brand">
              <BrandMark logoUrl={businessInfo.logoUrl} name={businessInfo.name} />
              <span className="brand-name">{businessInfo.name}</span>
            </a>
          )}
          <ul className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <li key={item}>
                {edit ? (
                  <span className="nav-link hover:text-[var(--accent)]">
                    <EditableText
                      value={navLabels[item as keyof NavLabels]}
                      onCommit={(v) => patchNav(item as keyof NavLabels, v)}
                      placeholder={item}
                    />
                  </span>
                ) : (
                  <a className="nav-link hover:text-[var(--accent)]" href={`#${item}`}>
                    {navLabels[item as keyof NavLabels]}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden items-center gap-3 md:flex">
            <ThemeSelect value={theme} onChange={onThemeChange} />
          </div>
          <button className="mobile-menu-button md:hidden" onClick={() => onMobileToggle(true)} aria-label="Open menu">
            <Menu />
          </button>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--bg)] p-6 md:hidden">
          <button className="mobile-menu-button ml-auto" onClick={() => onMobileToggle(false)} aria-label="Close menu">
            <X />
          </button>
          <div className="mt-10 flex flex-col gap-6 text-2xl">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="mobile-nav-link"
                onClick={() => onMobileToggle(false)}
              >
                {navLabels[item as keyof NavLabels]}
              </a>
            ))}
            <ThemeSelect value={theme} onChange={onThemeChange} />
          </div>
        </div>
      )}
    </>
  );
}
