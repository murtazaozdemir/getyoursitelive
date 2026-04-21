"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Car, ShieldCheck } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { ServiceIcon } from "@/lib/service-icons";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { EditableImage } from "@/components/editable/editable-image";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { ServiceItem } from "@/types/site";

export function HeroSection() {
  const { hero, businessInfo } = useBusiness();
  const edit = useEditMode();

  // When in edit mode, mutate the hero field on the business via context.
  function patchHero<K extends keyof typeof hero>(key: K, value: (typeof hero)[K]) {
    edit?.updateField("hero", { ...hero, [key]: value });
  }

  return (
    <section id="home" className="hero-section">
      <div className="hero-grid">
        {/* LEFT: Headline + lead + CTAs + credibility card */}
        <div className="hero-text">
          <SectionBlock name="Hero Eyebrow" visibilityKey="showHeroEyebrow">
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              {edit ? (
                <EditableText
                  value={hero.eyebrowPrefix}
                  onCommit={(v) => patchHero("eyebrowPrefix", v)}
                  placeholder="Family-owned since 2001"
                />
              ) : (
                hero.eyebrowPrefix
              )}
            </p>
          </SectionBlock>

          <SectionBlock name="Hero Headline" visibilityKey="showHeroHeadline">
            <h1 className="hero-headline">
              {edit ? (
                <EditableText
                  value={hero.headline}
                  onCommit={(v) => patchHero("headline", v)}
                  placeholder="Your headline here"
                />
              ) : (
                hero.headline
              )}
            </h1>
          </SectionBlock>

          <SectionBlock name="Hero Lead" visibilityKey="showHeroLead">
            <p className="hero-lead">
              {edit ? (
                <EditableText
                  value={hero.lead}
                  onCommit={(v) => patchHero("lead", v)}
                  multiline
                  placeholder="One-line value proposition"
                />
              ) : (
                hero.lead
              )}
            </p>
          </SectionBlock>

          <SectionBlock name="Hero CTAs" visibilityKey="showHeroCtas">
            <div className="hero-actions hero-cta-row">
              {edit ? (
                <>
                  <span className="btn-primary">
                    <EditableText
                      value={hero.primaryCta}
                      onCommit={(v) => patchHero("primaryCta", v)}
                      placeholder="Primary CTA"
                    />
                    <span aria-hidden>→</span>
                  </span>
                  <span className="btn-secondary">
                    <EditableText
                      value={hero.secondaryCta}
                      onCommit={(v) => patchHero("secondaryCta", v)}
                      placeholder="Secondary CTA"
                    />
                  </span>
                </>
              ) : (
                <>
                  <a href="#services" className="btn-primary">
                    {hero.primaryCta}
                    <span aria-hidden>→</span>
                  </a>
                  <a href="#contact" className="btn-secondary">
                    {hero.secondaryCta}
                  </a>
                </>
              )}
            </div>
          </SectionBlock>

          <SectionBlock
            name="Why-Us Card"
            visibilityKey="showHeroCard"
            isEmpty={hero.whyBullets.length === 0}
          >
            <aside className="hero-card">
              <h2 className="hero-card-title">
                {edit ? (
                  <EditableText
                    value={hero.whyTitle}
                    onCommit={(v) => patchHero("whyTitle", v)}
                    placeholder="Why our customers choose us"
                  />
                ) : (
                  hero.whyTitle
                )}
              </h2>
              <ul className="hero-card-list">
                {edit ? (
                  <EditableList
                    items={hero.whyBullets}
                    keyOf={(_, i) => `${i}`}
                    addLabel="Add bullet"
                    onAdd={() =>
                      patchHero("whyBullets", [...hero.whyBullets, "New bullet"])
                    }
                    onRemove={(i) =>
                      patchHero(
                        "whyBullets",
                        hero.whyBullets.filter((_, idx) => idx !== i),
                      )
                    }
                    onMove={(i, dir) =>
                      patchHero("whyBullets", moveInArray(hero.whyBullets, i, dir))
                    }
                    itemWrapperClassName="hero-card-list-item-wrap"
                    renderItem={(bullet, i) => (
                      <li>
                        <ShieldCheck className="hero-card-icon" aria-hidden />
                        <EditableText
                          value={bullet}
                          onCommit={(v) => {
                            const next = [...hero.whyBullets];
                            next[i] = v;
                            patchHero("whyBullets", next);
                          }}
                          placeholder="Reason #…"
                        />
                      </li>
                    )}
                  />
                ) : (
                  hero.whyBullets.map((bullet) => (
                    <li key={bullet}>
                      <ShieldCheck className="hero-card-icon" aria-hidden />
                      {bullet}
                    </li>
                  ))
                )}
              </ul>
            </aside>
          </SectionBlock>
        </div>

        {/* RIGHT: Photo only — no overlap on the image */}
        <SectionBlock name="Hero Image" visibilityKey="showHeroImage">
          <div className="hero-visual">
            {edit ? (
              <EditableImage
                value={hero.heroImage}
                onCommit={(url) => patchHero("heroImage", url)}
                uploadLabel={hero.heroImage ? "Replace photo" : "Upload photo"}
              >
                <div className="hero-image-wrap">
                  {hero.heroImage && (
                    <Image
                      src={hero.heroImage}
                      alt={`${businessInfo.name} — auto repair shop`}
                      fill
                      className="hero-image"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>
              </EditableImage>
            ) : (
              <div className="hero-image-wrap">
                {hero.heroImage && (
                  <Image
                    src={hero.heroImage}
                    alt={`${businessInfo.name} — auto repair shop`}
                    fill
                    className="hero-image"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}
              </div>
            )}
          </div>
        </SectionBlock>
      </div>
    </section>
  );
}

export function StatsSection({ counters }: { counters: number[] }) {
  const { stats } = useBusiness();
  const edit = useEditMode();

  function patchStat(i: number, patch: Partial<(typeof stats)[number]>) {
    if (!edit) return;
    const next = [...stats];
    next[i] = { ...next[i], ...patch };
    edit.updateField("stats", next);
  }

  return (
    <SectionBlock name="Stats" visibilityKey="showStats" isEmpty={stats.length === 0}>
    <section id="stats" className="section-shell mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-4 md:px-8">
      {edit ? (
        <EditableList
          items={stats}
          keyOf={(_, i) => `stat-${i}`}
          addLabel="Add stat"
          onAdd={() =>
            edit.updateField("stats", [
              ...stats,
              { label: "New stat", value: 0, suffix: "+" },
            ])
          }
          onRemove={(i) =>
            edit.updateField(
              "stats",
              stats.filter((_, idx) => idx !== i),
            )
          }
          onMove={(i, dir) =>
            edit.updateField("stats", moveInArray(stats, i, dir))
          }
          renderItem={(item, i) => (
            <div className="stat-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
              <Car className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
              <p className="text-3xl font-bold">
                <EditableText
                  value={String(item.value)}
                  onCommit={(v) => {
                    const n = parseInt(v.replace(/[^\d-]/g, ""), 10);
                    if (!Number.isNaN(n)) patchStat(i, { value: n });
                  }}
                  placeholder="0"
                />
                <EditableText
                  value={item.suffix}
                  onCommit={(v) => patchStat(i, { suffix: v })}
                  placeholder="+"
                />
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                <EditableText
                  value={item.label}
                  onCommit={(v) => patchStat(i, { label: v })}
                  placeholder="Stat label"
                />
              </p>
            </div>
          )}
        />
      ) : (
        stats.map((item, index) => (
          <div
            key={item.label}
            className="stat-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center"
          >
            <Car className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
            <p className="text-3xl font-bold">
              {(counters[index] ?? 0).toLocaleString()}{item.suffix}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
          </div>
        ))
      )}
    </section>
    </SectionBlock>
  );
}

export function AboutSection() {
  const { businessInfo, about } = useBusiness();
  const edit = useEditMode();

  function patchAbout<K extends keyof typeof about>(key: K, value: (typeof about)[K]) {
    edit?.updateField("about", { ...about, [key]: value });
  }

  function patchCard(i: number, patch: Partial<{ title: string; description: string }>) {
    const next = [...about.whyUsCards];
    next[i] = { ...next[i], ...patch };
    patchAbout("whyUsCards", next);
  }

  return (
    <>
    <SectionBlock name="About Story" visibilityKey="showAbout">
      <section id="about" className="section-shell mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
        {edit ? (
          <EditableImage
            value={about.primaryImage}
            onCommit={(url) => patchAbout("primaryImage", url)}
            uploadLabel={about.primaryImage ? "Replace photo" : "Upload photo"}
            className="about-image-frame about-image-frame--primary relative min-h-96 overflow-hidden rounded-2xl block"
          >
            {about.primaryImage && (
              <Image
                src={about.primaryImage}
                alt={`${businessInfo.name} service bay`}
                fill
                className="about-image"
              />
            )}
          </EditableImage>
        ) : (
          <div className="about-image-frame about-image-frame--primary relative min-h-96 overflow-hidden rounded-2xl">
            {about.primaryImage && (
              <Image
                src={about.primaryImage}
                alt={`${businessInfo.name} service bay`}
                fill
                className="about-image"
              />
            )}
          </div>
        )}
        <div>
          <h2 className="section-title text-3xl font-bold">
            {edit ? (
              <EditableText
                value={about.heading}
                onCommit={(v) => patchAbout("heading", v)}
                placeholder="About section heading"
              />
            ) : (
              about.heading
            )}
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            {edit ? (
              <EditableText
                value={about.narrative}
                onCommit={(v) => patchAbout("narrative", v)}
                multiline
                placeholder="A few sentences about your shop"
              />
            ) : (
              about.narrative
            )}
          </p>
          {(edit || about.bullets.length > 0) && (
            <ol className="mt-6 grid gap-3">
              {edit ? (
                <EditableList
                  items={about.bullets}
                  keyOf={(_, i) => `about-bullet-${i}`}
                  addLabel="Add bullet"
                  onAdd={() =>
                    patchAbout("bullets", [...about.bullets, "New bullet"])
                  }
                  onRemove={(i) =>
                    patchAbout(
                      "bullets",
                      about.bullets.filter((_, idx) => idx !== i),
                    )
                  }
                  onMove={(i, dir) =>
                    patchAbout("bullets", moveInArray(about.bullets, i, dir))
                  }
                  renderItem={(bullet, i) => (
                    <li>
                      {i + 1}.{" "}
                      <EditableText
                        value={bullet}
                        onCommit={(v) => {
                          const next = [...about.bullets];
                          next[i] = v;
                          patchAbout("bullets", next);
                        }}
                        placeholder="A differentiator"
                      />
                    </li>
                  )}
                />
              ) : (
                about.bullets.map((bullet, i) => (
                  <li key={bullet}>
                    {i + 1}. {bullet}
                  </li>
                ))
              )}
            </ol>
          )}
        </div>
      </section>
    </SectionBlock>

    <SectionBlock
      name="About Why-Us Cards"
      visibilityKey="showAboutWhyUs"
      isEmpty={about.whyUsCards.length === 0}
    >
      <section className="section-shell mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
        {edit ? (
          <EditableImage
            value={about.secondaryImage}
            onCommit={(url) => patchAbout("secondaryImage", url)}
            uploadLabel={about.secondaryImage ? "Replace photo" : "Upload photo"}
            className="about-image-frame about-image-frame--secondary relative min-h-96 overflow-hidden rounded-2xl block"
          >
            {about.secondaryImage && (
              <Image
                src={about.secondaryImage}
                alt={`${businessInfo.name} workshop`}
                fill
                className="about-image"
              />
            )}
          </EditableImage>
        ) : (
          <div className="about-image-frame about-image-frame--secondary relative min-h-96 overflow-hidden rounded-2xl">
            {about.secondaryImage && (
              <Image
                src={about.secondaryImage}
                alt={`${businessInfo.name} workshop`}
                fill
                className="about-image"
              />
            )}
          </div>
        )}
        <div className="grid gap-4">
            {edit ? (
              <EditableList
                items={about.whyUsCards}
                keyOf={(_, i) => `why-card-${i}`}
                addLabel="Add card"
                onAdd={() =>
                  patchAbout("whyUsCards", [
                    ...about.whyUsCards,
                    { title: "Title", description: "Description" },
                  ])
                }
                onRemove={(i) =>
                  patchAbout(
                    "whyUsCards",
                    about.whyUsCards.filter((_, idx) => idx !== i),
                  )
                }
                onMove={(i, dir) =>
                  patchAbout("whyUsCards", moveInArray(about.whyUsCards, i, dir))
                }
                renderItem={(card, i) => (
                  <div className="content-card rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <p className="font-semibold">
                      <EditableText
                        value={card.title}
                        onCommit={(v) => patchCard(i, { title: v })}
                        placeholder="Title"
                      />
                    </p>
                    <p className="text-sm text-[var(--muted)]">
                      <EditableText
                        value={card.description}
                        onCommit={(v) => patchCard(i, { description: v })}
                        multiline
                        placeholder="Description"
                      />
                    </p>
                  </div>
                )}
              />
            ) : (
              about.whyUsCards.map((card) => (
                <div
                  key={card.title}
                  className="content-card rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                >
                  <p className="font-semibold">{card.title}</p>
                  <p className="text-sm text-[var(--muted)]">{card.description}</p>
                </div>
              ))
            )}
        </div>
      </section>
    </SectionBlock>
    </>
  );
}

function blankService(): ServiceItem {
  return {
    id: `svc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "New service",
    priceRange: "$0",
    duration: "30 min",
    description: "",
    features: [],
  };
}

export function ServicesSection({
  serviceTab,
  onServiceTabChange,
}: {
  serviceTab: string;
  onServiceTabChange: (tab: string) => void;
}) {
  const { services } = useBusiness();
  const edit = useEditMode();

  // Empty-state for new businesses in edit mode
  if (edit && services.length === 0) {
    return (
      <SectionBlock name="Services" visibilityKey="showServices" isEmpty={false}>
        <section id="services" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="section-title mb-6 text-3xl font-bold"><SectionH2 titleKey="services" /></h2>
          <button
            type="button"
            className="editable-add-btn"
            onClick={() => {
              const first = blankService();
              edit.updateField("services", [first]);
              onServiceTabChange(first.id);
            }}
          >
            + Add first service
          </button>
        </section>
      </SectionBlock>
    );
  }

  const activeService = services.find((s) => s.id === serviceTab) ?? services[0];
  const activeIndex = services.findIndex((s) => s.id === activeService.id);

  function patchService(patch: Partial<ServiceItem>) {
    if (!edit || activeIndex < 0) return;
    const next = [...services];
    next[activeIndex] = { ...next[activeIndex], ...patch };
    edit.updateField("services", next);
  }

  return (
    <SectionBlock name="Services" visibilityKey="showServices" isEmpty={services.length === 0}>
    <section id="services" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="services" />
      </h2>
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="flex gap-2 overflow-auto md:flex-col">
          {services.map((item) => {
            const active = serviceTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onServiceTabChange(item.id)}
                className={`service-pill flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${active ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)] hover:border-[var(--accent)]/50"}`}
              >
                <ServiceIcon
                  id={item.id}
                  className={`h-5 w-5 flex-shrink-0 ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
                />
                <span>{item.name}</span>
              </button>
            );
          })}
          {edit && (
            <button
              type="button"
              className="editable-add-btn"
              onClick={() => {
                const fresh = blankService();
                edit.updateField("services", [...services, fresh]);
                onServiceTabChange(fresh.id);
              }}
            >
              + Add service
            </button>
          )}
        </div>
        <motion.div
          key={activeService.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="content-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="inline-block rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm text-[var(--accent)]">
                {edit ? (
                  <EditableText
                    value={activeService.priceRange}
                    onCommit={(v) => patchService({ priceRange: v })}
                    placeholder="Price range"
                  />
                ) : (
                  activeService.priceRange
                )}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">
                {edit ? (
                  <EditableText
                    value={activeService.name}
                    onCommit={(v) => patchService({ name: v })}
                    placeholder="Service name"
                  />
                ) : (
                  activeService.name
                )}
              </h3>
              {edit && (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Duration:{" "}
                  <EditableText
                    value={activeService.duration}
                    onCommit={(v) => patchService({ duration: v })}
                    placeholder="30 min"
                  />
                </p>
              )}
            </div>
            <div className="rounded-xl bg-[var(--accent)]/10 p-3">
              <ServiceIcon id={activeService.id} className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </div>
          <p className="mt-2 text-[var(--muted)]">
            {edit ? (
              <EditableText
                value={activeService.description}
                onCommit={(v) => patchService({ description: v })}
                multiline
                placeholder="What this service includes"
              />
            ) : (
              activeService.description
            )}
          </p>
          <ul className="mt-4 grid gap-2">
            {edit ? (
              <EditableList
                items={activeService.features}
                keyOf={(_, i) => `svc-${activeService.id}-f-${i}`}
                addLabel="Add feature"
                onAdd={() =>
                  patchService({
                    features: [...activeService.features, "New feature"],
                  })
                }
                onRemove={(i) =>
                  patchService({
                    features: activeService.features.filter((_, idx) => idx !== i),
                  })
                }
                onMove={(i, dir) =>
                  patchService({
                    features: moveInArray(activeService.features, i, dir),
                  })
                }
                renderItem={(feature, i) => (
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                    <EditableText
                      value={feature}
                      onCommit={(v) => {
                        const next = [...activeService.features];
                        next[i] = v;
                        patchService({ features: next });
                      }}
                      placeholder="Feature"
                    />
                  </li>
                )}
              />
            ) : (
              activeService.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                  {feature}
                </li>
              ))
            )}
          </ul>
          {edit && services.length > 1 && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (!window.confirm(`Delete "${activeService.name}"?`)) return;
                  const remaining = services.filter(
                    (_, idx) => idx !== activeIndex,
                  );
                  edit.updateField("services", remaining);
                  if (remaining.length > 0) onServiceTabChange(remaining[0].id);
                }}
              >
                Delete this service
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
    </SectionBlock>
  );
}

