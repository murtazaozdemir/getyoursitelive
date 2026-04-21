"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/lib/business-types";
import type { UserRole } from "@/lib/users";
import { saveBusinessAction, deleteBusinessAction } from "@/app/admin/actions";
import { IdentityTab } from "./_tabs/identity-tab";
import { HeroTab } from "./_tabs/hero-tab";
import { AboutTab } from "./_tabs/about-tab";
import { StatsTab } from "./_tabs/stats-tab";
import { ServicesTab } from "./_tabs/services-tab";
import { DealsTab } from "./_tabs/deals-tab";
import { PricingTab } from "./_tabs/pricing-tab";
import { TeamTab } from "./_tabs/team-tab";
import { TestimonialsTab } from "./_tabs/testimonials-tab";
import { FaqTab } from "./_tabs/faq-tab";
import { ContactHoursTab } from "./_tabs/contact-hours-tab";
import { LabelsTab } from "./_tabs/labels-tab";
import { VisibilityTab } from "./_tabs/visibility-tab";

/**
 * Tabs are ordered top-to-bottom to match the public page flow, so an
 * owner can step through the editor the same way a visitor reads the site.
 */
type TabKey =
  | "identity"
  | "hero"
  | "about"
  | "stats"
  | "services"
  | "deals"
  | "pricing"
  | "team"
  | "testimonials"
  | "faq"
  | "contact"
  | "labels"
  | "visibility";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "identity", label: "Identity" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "stats", label: "Stats" },
  { key: "services", label: "Services" },
  { key: "deals", label: "Deals" },
  { key: "pricing", label: "Pricing" },
  { key: "team", label: "Team" },
  { key: "testimonials", label: "Testimonials" },
  { key: "faq", label: "FAQ" },
  { key: "contact", label: "Contact & Hours" },
  { key: "labels", label: "Labels" },
  { key: "visibility", label: "Visibility" },
];

export function BusinessEditor({
  initialBusiness,
  userRole,
}: {
  initialBusiness: Business;
  userRole: UserRole;
}) {
  const router = useRouter();
  const originalSlug = initialBusiness.slug;
  const [business, setBusiness] = useState<Business>(initialBusiness);
  const [activeTab, setActiveTab] = useState<TabKey>("identity");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  function update<K extends keyof Business>(key: K, value: Business[K]) {
    setBusiness((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setMessage(null);
  }

  async function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const res = await saveBusinessAction(originalSlug, business);
      if (res.ok) {
        setIsDirty(false);
        setMessage({ kind: "ok", text: "Changes saved." });
        if (business.slug !== originalSlug) {
          router.push(`/${business.slug}/admin/form`);
        } else {
          router.refresh();
        }
      } else {
        setMessage({ kind: "err", text: res.error });
      }
    });
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${business.businessInfo.name}" permanently? This cannot be undone.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const res = await deleteBusinessAction(originalSlug);
      if (res.ok) {
        router.push("/admin");
      } else {
        setMessage({ kind: "err", text: res.error });
      }
    });
  }

  return (
    <div className="admin-editor">
      <nav className="admin-tabs" aria-label="Editor sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className="admin-tab"
            data-active={activeTab === t.key}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="admin-editor-body">
        {activeTab === "identity" && (
          <IdentityTab business={business} userRole={userRole} update={update} />
        )}
        {activeTab === "hero" && <HeroTab business={business} update={update} />}
        {activeTab === "about" && <AboutTab business={business} update={update} />}
        {activeTab === "stats" && <StatsTab business={business} update={update} />}
        {activeTab === "services" && (
          <ServicesTab business={business} update={update} />
        )}
        {activeTab === "deals" && <DealsTab business={business} update={update} />}
        {activeTab === "pricing" && <PricingTab business={business} update={update} />}
        {activeTab === "team" && <TeamTab business={business} update={update} />}
        {activeTab === "testimonials" && (
          <TestimonialsTab business={business} update={update} />
        )}
        {activeTab === "faq" && <FaqTab business={business} update={update} />}
        {activeTab === "contact" && (
          <ContactHoursTab business={business} update={update} />
        )}
        {activeTab === "labels" && <LabelsTab business={business} update={update} />}
        {activeTab === "visibility" && (
          <VisibilityTab business={business} update={update} />
        )}
      </div>

      <div className="admin-editor-toolbar">
        <div className="admin-editor-toolbar-left">
          {userRole === "admin" && (
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete business
            </button>
          )}
        </div>
        <div className="admin-editor-toolbar-right">
          {message && (
            <span
              className={`admin-editor-message admin-editor-message--${message.kind}`}
              role="status"
            >
              {message.text}
            </span>
          )}
          {isDirty && !message && (
            <span className="admin-editor-message admin-editor-message--dirty">
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={isPending || !isDirty}
          >
            {isPending ? "Saving\u2026" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
