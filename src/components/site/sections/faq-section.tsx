"use client";

import { ChevronDown } from "lucide-react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type { FaqItem } from "@/types/site";

function blankFaq(): FaqItem {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question: "New question?",
    answer: "Answer to the question.",
  };
}

export function FaqSection({
  faqOpen,
  onToggle,
}: {
  faqOpen: number;
  onToggle: (index: number) => void;
}) {
  const { faqs } = useBusiness();
  const edit = useEditMode();

  function patchFaq(i: number, patch: Partial<FaqItem>) {
    if (!edit) return;
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    edit.updateField("faqs", next);
  }

  return (
    <SectionBlock name="FAQ" visibilityKey="showFaq" isEmpty={faqs.length === 0}>
      <section className="section-shell mx-auto max-w-4xl px-4 py-16">
        <h2 className="section-title mb-6 text-3xl font-bold">
          <SectionH2 titleKey="faq" />
        </h2>
        {edit ? (
          <EditableList
            items={faqs}
            keyOf={(f) => f.id}
            addLabel="Add question"
            onAdd={() => edit.updateField("faqs", [...faqs, blankFaq()])}
            onRemove={(i) =>
              edit.updateField("faqs", faqs.filter((_, idx) => idx !== i))
            }
            onMove={(i, dir) => edit.updateField("faqs", moveInArray(faqs, i, dir))}
            renderItem={(faq, i) => (
              <div className="content-card mb-3 rounded-xl border border-[var(--border)] p-4">
                <p className="font-semibold">
                  <EditableText
                    value={faq.question}
                    onCommit={(v) => patchFaq(i, { question: v })}
                    placeholder="Question"
                  />
                </p>
                <p className="mt-2 text-[var(--muted)]">
                  <EditableText
                    value={faq.answer}
                    onCommit={(v) => patchFaq(i, { answer: v })}
                    multiline
                    placeholder="Answer"
                  />
                </p>
              </div>
            )}
          />
        ) : (
          faqs.map((faq, index) => (
            <div
              key={faq.id}
              className="content-card mb-3 rounded-xl border border-[var(--border)]"
            >
              <button
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => onToggle(index)}
              >
                {faq.question}
                <ChevronDown
                  className={`transition-transform ${faqOpen === index ? "rotate-180" : ""}`}
                />
              </button>
              {faqOpen === index && (
                <p className="px-4 pb-4 text-[var(--muted)]">{faq.answer}</p>
              )}
            </div>
          ))
        )}
      </section>
    </SectionBlock>
  );
}
