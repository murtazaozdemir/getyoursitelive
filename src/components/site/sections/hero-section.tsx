"use client";

import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { EditableImage } from "@/components/editable/editable-image";
import { SectionBlock } from "@/components/editable/section-block";

export function HeroSection() {
  const { hero, businessInfo } = useBusiness();
  const edit = useEditMode();

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
                    onAdd={() => patchHero("whyBullets", [...hero.whyBullets, "New bullet"])}
                    onRemove={(i) =>
                      patchHero("whyBullets", hero.whyBullets.filter((_, idx) => idx !== i))
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

        {/* RIGHT: Photo */}
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
