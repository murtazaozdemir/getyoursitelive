"use client";

import type { Business } from "@/lib/business-types";
import type { FaqItem } from "@/types/site";
import { RepeatableList, moveInArray } from "./repeatable";

function blankFaq(): FaqItem {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question: "",
    answer: "",
  };
}

export function FaqTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const faqs = business.faqs ?? [];

  function patch(i: number, p: Partial<FaqItem>) {
    const next = [...faqs];
    next[i] = { ...next[i], ...p };
    update("faqs", next);
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Frequently Asked Questions</h2>
      <p className="admin-section-lede">
        Answers to common questions. Each question becomes an expandable
        accordion item on the public site.
      </p>

      <RepeatableList
        items={faqs}
        keyOf={(f) => f.id}
        addLabel="+ Add question"
        emptyText="No FAQs yet."
        onAdd={() => update("faqs", [...faqs, blankFaq()])}
        onRemove={(i) => update("faqs", faqs.filter((_, idx) => idx !== i))}
        onMove={(i, dir) => update("faqs", moveInArray(faqs, i, dir))}
        renderItem={(faq, i) => (
          <div className="admin-grid">
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Question</span>
              <input
                className="admin-input"
                value={faq.question}
                onChange={(e) => patch(i, { question: e.target.value })}
              />
            </label>
            <label className="admin-field admin-field--wide">
              <span className="admin-field-label">Answer</span>
              <textarea
                className="admin-input admin-input--textarea"
                rows={3}
                value={faq.answer}
                onChange={(e) => patch(i, { answer: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </section>
  );
}
