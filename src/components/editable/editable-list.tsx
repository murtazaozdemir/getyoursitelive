"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Wraps a list of items with hover-reveal controls: reorder (↑/↓), delete,
 * plus an "Add" button at the end of the list.
 *
 * The caller provides a renderer that draws each item. The caller is also
 * responsible for committing changes back to the business object via the
 * edit-mode context.
 */
export function EditableList<T>({
  items,
  renderItem,
  onAdd,
  onRemove,
  onMove,
  keyOf,
  addLabel = "Add item",
  itemWrapperClassName = "",
}: {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  keyOf: (item: T, index: number) => string;
  addLabel?: string;
  /** Extra classes applied to each item wrapper so the caller can fit it
   *  into the surrounding layout (grid cell, flex row, etc). */
  itemWrapperClassName?: string;
}) {
  return (
    <>
      {items.map((item, i) => (
        <div
          key={keyOf(item, i)}
          className={`editable-list-item ${itemWrapperClassName}`}
        >
          {renderItem(item, i)}
          <div className="editable-list-controls" aria-label="Item controls">
            <button
              type="button"
              className="editable-icon-btn"
              aria-label="Move up"
              disabled={i === 0}
              onClick={() => onMove(i, -1)}
            >
              <ChevronUp aria-hidden />
            </button>
            <button
              type="button"
              className="editable-icon-btn"
              aria-label="Move down"
              disabled={i === items.length - 1}
              onClick={() => onMove(i, 1)}
            >
              <ChevronDown aria-hidden />
            </button>
            <button
              type="button"
              className="editable-icon-btn editable-icon-btn--danger"
              aria-label="Remove"
              onClick={() => onRemove(i)}
            >
              <Trash2 aria-hidden />
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="editable-add-btn" onClick={onAdd}>
        <Plus aria-hidden />
        <span>{addLabel}</span>
      </button>
    </>
  );
}

export function moveInArray<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(index, 1);
  next.splice(newIndex, 0, item);
  return next;
}
