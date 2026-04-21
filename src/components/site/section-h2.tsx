"use client";

import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import type { SectionTitles } from "@/types/site";

/**
 * Reads a key from `business.sectionTitles` and renders it. In edit mode it
 * becomes inline-editable; in view mode it's plain text. Saves on commit.
 *
 * Use anywhere you'd otherwise hardcode an `<h2>"Our Services"</h2>` etc.
 */
export function SectionH2({
  titleKey,
  placeholder,
}: {
  titleKey: keyof SectionTitles;
  placeholder?: string;
}) {
  const { sectionTitles } = useBusiness();
  const edit = useEditMode();
  const value = sectionTitles[titleKey] ?? "";

  if (!edit) return <>{value}</>;

  return (
    <EditableText
      value={value}
      onCommit={(v) =>
        edit.updateField("sectionTitles", { ...sectionTitles, [titleKey]: v })
      }
      placeholder={placeholder ?? "Section title"}
    />
  );
}
