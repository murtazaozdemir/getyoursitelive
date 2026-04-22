"use client";

import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { SectionBlock } from "@/components/editable/section-block";

export function EmergencyBanner() {
  const { businessInfo, emergency } = useBusiness();
  const edit = useEditMode();

  function patchEmergency<K extends keyof typeof emergency>(key: K, value: (typeof emergency)[K]) {
    edit?.updateField("emergency", { ...emergency, [key]: value });
  }

  return (
    <SectionBlock
      name="Emergency Banner"
      visibilityKey="showEmergencyBanner"
      isEmpty={!businessInfo.emergencyPhone}
    >
      <section className="bg-[var(--accent)] py-10 text-[var(--accent-ink)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <div>
            <h3 className="text-2xl font-bold">
              {edit ? (
                <EditableText
                  value={emergency.heading}
                  onCommit={(v) => patchEmergency("heading", v)}
                  placeholder="Emergency heading"
                />
              ) : (
                emergency.heading
              )}
            </h3>
            <p>
              {edit ? (
                <EditableText
                  value={emergency.description}
                  onCommit={(v) => patchEmergency("description", v)}
                  multiline
                  placeholder="Emergency description"
                />
              ) : (
                emergency.description
              )}
            </p>
          </div>
          {edit ? (
            <span className="rounded-full bg-black/20 px-5 py-3 font-semibold">
              <EditableText
                value={emergency.ctaLabel}
                onCommit={(v) => patchEmergency("ctaLabel", v)}
                placeholder="Button label"
              />
            </span>
          ) : (
            <a
              href={`tel:${businessInfo.emergencyPhone}`}
              className="rounded-full bg-black/20 px-5 py-3 font-semibold"
            >
              {emergency.ctaLabel}
            </a>
          )}
        </div>
      </section>
    </SectionBlock>
  );
}
