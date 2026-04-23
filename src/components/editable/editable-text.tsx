"use client";

import { useEffect, useRef, useState, type ElementType, type JSX, type ReactNode } from "react";
import { Pencil } from "lucide-react";

/**
 * Click-to-edit text. Renders `value` as children of the host element while
 * idle; on click, swaps to an inline input/textarea, calls `onCommit` on
 * blur or Enter, reverts on Escape.
 *
 * `tag`: what element to render in read mode (default "span").
 * `multiline`: use a textarea and allow Enter to insert newlines.
 * `placeholder`: text shown when value is empty.
 * `className`: applied to both read and edit states.
 */
export function EditableText({
  value,
  onCommit,
  tag: Tag = "span",
  multiline = false,
  placeholder = "Click to edit",
  className = "",
  renderDisplay,
}: {
  value: string;
  onCommit: (next: string) => void;
  tag?: keyof JSX.IntrinsicElements;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  /** Optional custom renderer for read mode — e.g. to apply markdown. */
  renderDisplay?: (value: string) => ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Keep draft in sync if the parent value changes externally
  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  // Focus + select-all when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function commit() {
    setIsEditing(false);
    if (draft !== value) onCommit(draft);
  }

  function cancel() {
    setDraft(value);
    setIsEditing(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
      return;
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commit();
    }
  }

  if (isEditing) {
    return multiline ? (
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        className={`editable-input editable-input--textarea ${className}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        rows={Math.max(2, draft.split("\n").length)}
        placeholder={placeholder}
      />
    ) : (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        className={`editable-input ${className}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKey}
        placeholder={placeholder}
      />
    );
  }

  const displayed = value || placeholder;
  const isEmpty = !value;

  const Element = Tag as ElementType;
  // Heading elements (h1–h6) already have an implicit role; adding role="button"
  // on top creates an accessibility conflict. We use tabIndex + onKeyDown to
  // retain keyboard accessibility without overriding the semantic role.
  const isHeading = /^h[1-6]$/.test(Tag as string);
  return (
    <Element
      className={`editable ${isEmpty ? "editable--empty" : ""} ${className}`}
      onClick={() => setIsEditing(true)}
      {...(!isHeading && { role: "button" })}
      tabIndex={0}
      aria-label="Edit"
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
    >
      {renderDisplay && !isEmpty ? renderDisplay(value) : displayed}
      <Pencil className="editable-pencil" aria-hidden />
    </Element>
  );
}
