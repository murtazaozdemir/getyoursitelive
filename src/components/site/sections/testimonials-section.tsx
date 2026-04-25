"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { Testimonial } from "@/types/site";

function blankTestimonial(): Testimonial {
  return { name: "New customer", context: "", quote: "Great service." };
}

export function TestimonialsSection({
  testimonialIndex,
  onPrevious,
  onNext,
}: {
  testimonialIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { testimonials } = useBusiness();
  const edit = useEditMode();

  function patchT(i: number, patch: Partial<Testimonial>) {
    if (!edit) return;
    const next = [...testimonials];
    next[i] = { ...next[i], ...patch };
    edit.updateField("testimonials", next);
  }

  // Edit mode: show all stacked so owner can edit each
  if (edit) {
    return (
      <SectionBlock name="Testimonials" visibilityKey="showTestimonials" isEmpty={false}>
        <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
          <h2 className="section-title mb-6 text-3xl font-bold">
            <SectionH2 titleKey="testimonials" />
          </h2>
          <div className="grid gap-4">
            <EditableList
              items={testimonials}
              keyOf={(_, i) => `tt-${i}`}
              addLabel="Add testimonial"
              onAdd={() =>
                edit.updateField("testimonials", [...testimonials, blankTestimonial()])
              }
              onRemove={(i) =>
                edit.updateField("testimonials", testimonials.filter((_, idx) => idx !== i))
              }
              onMove={(i, dir) =>
                edit.updateField("testimonials", moveInArray(testimonials, i, dir))
              }
              renderItem={(t, i) => (
                <div className="content-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                  <div className="mb-3 flex gap-1 text-[var(--accent)]">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <Star key={star} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg">
                    &ldquo;
                    <EditableText
                      value={t.quote}
                      onCommit={(v) => patchT(i, { quote: v })}
                      multiline
                      placeholder="What the customer said"
                    />
                    &rdquo;
                  </p>
                  <p className="mt-4 font-semibold">
                    <EditableText
                      value={t.name}
                      onCommit={(v) => patchT(i, { name: v })}
                      placeholder="Customer name"
                    />
                    {t.context && <>{" - "}<EditableText
                      value={t.context}
                      onCommit={(v) => patchT(i, { context: v })}
                      placeholder="Context"
                    /></>}
                  </p>
                </div>
              )}
            />
          </div>
        </section>
      </SectionBlock>
    );
  }

  // View mode: carousel
  const current = testimonials[testimonialIndex] ?? testimonials[0];
  return (
    <SectionBlock name="Testimonials" visibilityKey="showTestimonials" isEmpty={testimonials.length === 0}>
      <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="section-title mb-6 text-3xl font-bold">
          <SectionH2 titleKey="testimonials" />
        </h2>
        <div className="content-card testimonial-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex gap-1 text-[var(--accent)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="testimonial-quote text-lg">&ldquo;{current.quote}&rdquo;</p>
          <p className="mt-4 font-semibold">
            {current.name}{current.context ? ` - ${current.context}` : ""}
          </p>
          <div className="mt-4 flex gap-2">
            <button className="icon-button" onClick={onPrevious} aria-label="Previous testimonial">
              <ChevronLeft />
            </button>
            <button className="icon-button" onClick={onNext} aria-label="Next testimonial">
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
    </SectionBlock>
  );
}
