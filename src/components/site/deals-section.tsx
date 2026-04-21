"use client";

import { Tag } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { DealItem } from "@/types/site";

function blankDeal(): DealItem {
  return {
    id: `deal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "New deal",
    description: "Short description",
    price: "$0",
  };
}

/**
 * Promotional "Deals" section — shows current specials as cards.
 * Hides automatically when show_deals is off or no deals exist (unless
 * the page is rendered in edit mode, where it stays visible for the owner).
 */
export function DealsSection() {
  const { deals, sectionTitles } = useBusiness();
  const edit = useEditMode();

  function patchDeal(i: number, patch: Partial<DealItem>) {
    if (!edit) return;
    const next = [...deals];
    next[i] = { ...next[i], ...patch };
    edit.updateField("deals", next);
  }

  return (
    <SectionBlock name="Deals" visibilityKey="showDeals" isEmpty={deals.length === 0}>
    <section id="deals" className="deals-section section-shell">
      <div className="deals-section-inner">
        <div className="deals-section-head">
          <span className="deals-eyebrow">
            <Tag className="h-3.5 w-3.5" aria-hidden />
            <SectionH2 titleKey="dealsEyebrow" placeholder="Eyebrow text" />
          </span>
          <h2 className="deals-title">
            <SectionH2 titleKey="deals" placeholder="Section title" />
          </h2>
          <p className="deals-lede">
            <SectionH2 titleKey="dealsLede" placeholder="Short tagline below the title" />
          </p>
        </div>

        <div className="deals-grid">
          {edit ? (
            <EditableList
              items={deals}
              keyOf={(d) => d.id}
              addLabel="Add deal"
              onAdd={() => edit.updateField("deals", [...deals, blankDeal()])}
              onRemove={(i) =>
                edit.updateField("deals", deals.filter((_, idx) => idx !== i))
              }
              onMove={(i, dir) =>
                edit.updateField("deals", moveInArray(deals, i, dir))
              }
              renderItem={(deal, i) => (
                <article className="deal-card">
                  <span className="deal-badge">
                    <EditableText
                      value={deal.badge ?? ""}
                      onCommit={(v) => patchDeal(i, { badge: v || undefined })}
                      placeholder="Optional badge"
                    />
                  </span>
                  <h3 className="deal-title">
                    <EditableText
                      value={deal.title}
                      onCommit={(v) => patchDeal(i, { title: v })}
                      placeholder="Deal title"
                    />
                  </h3>
                  <p className="deal-desc">
                    <EditableText
                      value={deal.description}
                      onCommit={(v) => patchDeal(i, { description: v })}
                      multiline
                      placeholder="Short description"
                    />
                  </p>
                  <div className="deal-price-row">
                    <span className="deal-price">
                      <EditableText
                        value={deal.price}
                        onCommit={(v) => patchDeal(i, { price: v })}
                        placeholder="$0"
                      />
                    </span>
                    <span className="deal-price-original">
                      <EditableText
                        value={deal.originalPrice ?? ""}
                        onCommit={(v) =>
                          patchDeal(i, { originalPrice: v || undefined })
                        }
                        placeholder="Was…"
                      />
                    </span>
                  </div>
                  <span className="deal-cta">
                    <SectionH2 titleKey="dealsCta" placeholder="Claim this offer" />
                    {" "}
                    <span aria-hidden>→</span>
                  </span>
                </article>
              )}
            />
          ) : (
            deals.map((deal) => (
              <article key={deal.id} className="deal-card">
                {deal.badge && <span className="deal-badge">{deal.badge}</span>}
                <h3 className="deal-title">{deal.title}</h3>
                <p className="deal-desc">{deal.description}</p>
                <div className="deal-price-row">
                  <span className="deal-price">{deal.price}</span>
                  {deal.originalPrice && (
                    <span className="deal-price-original">{deal.originalPrice}</span>
                  )}
                </div>
                <a href="#contact" className="deal-cta">
                  {sectionTitles.dealsCta}
                  <span aria-hidden>→</span>
                </a>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
    </SectionBlock>
  );
}
