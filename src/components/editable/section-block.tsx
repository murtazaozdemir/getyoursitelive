"use client";

import { Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import type { BusinessVisibility } from "@/lib/business-types";

/**
 * Wraps any major page section so it becomes a discrete "block" in edit
 * mode with a toolbar (section name + visibility toggle).
 *
 * - In view mode: returns null when the section is hidden or empty.
 * - In edit mode: always renders. When hidden, the section content is
 *   dimmed and a "Hidden from customers" banner appears across the top
 *   so the owner can flip it back on without losing any content.
 */
export function SectionBlock({
  name,
  visibilityKey,
  isEmpty = false,
  children,
}: {
  /** Display name for the toolbar e.g. "Deals", "Pricing". */
  name: string;
  /** Which boolean on `business.visibility` controls this block. */
  visibilityKey: keyof BusinessVisibility;
  /**
   * Optional: when true and the section is visible, the block is still
   * hidden in view mode (used when the section has no content to show,
   * e.g. zero services). In edit mode, the empty section still renders
   * so the owner can add content.
   */
  isEmpty?: boolean;
  children: ReactNode;
}) {
  const { visibility } = useBusiness();
  const edit = useEditMode();
  const visible = visibility[visibilityKey];

  // Public / view mode: hide if toggled off OR if there's no content.
  if (!edit) {
    if (!visible || isEmpty) return null;
    return <>{children}</>;
  }

  function toggle() {
    edit!.updateField("visibility", {
      ...visibility,
      [visibilityKey]: !visible,
    });
  }

  return (
    <div className={`section-block ${visible ? "" : "section-block--hidden"}`}>
      <div className="section-block-toolbar">
        <span className="section-block-name">{name}</span>
        <button
          type="button"
          className="section-block-toggle"
          onClick={toggle}
          aria-pressed={visible}
          title={visible ? "Hide this block from customers" : "Show this block to customers"}
        >
          {visible ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          <span>{visible ? "Visible" : "Hidden"}</span>
        </button>
      </div>
      {!visible && (
        <div className="section-block-overlay">
          Hidden from customers — toggle &ldquo;Visible&rdquo; above to show again.
        </div>
      )}
      <div className="section-block-content">{children}</div>
    </div>
  );
}
