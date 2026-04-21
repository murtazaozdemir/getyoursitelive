"use client";

import type { ReactNode } from "react";

/**
 * Shared UI wrapper for a list of editable items with reorder/delete.
 * The tab passes in a renderer for each row — this handles the chrome.
 */
export function RepeatableList<T>({
  items,
  keyOf,
  renderItem,
  onAdd,
  onRemove,
  onMove,
  addLabel,
  emptyText,
}: {
  items: T[];
  keyOf: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  addLabel: string;
  emptyText: string;
}) {
  return (
    <div className="admin-repeat">
      {items.length === 0 ? (
        <p className="admin-empty-text">{emptyText}</p>
      ) : (
        <ul className="admin-repeat-list">
          {items.map((item, i) => (
            <li key={keyOf(item, i)} className="admin-repeat-item">
              <div className="admin-repeat-controls">
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => onMove(i, -1)}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  className="admin-icon-btn"
                  aria-label="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => onMove(i, 1)}
                >
                  &darr;
                </button>
                <button
                  type="button"
                  className="admin-icon-btn admin-icon-btn--danger"
                  aria-label="Remove"
                  onClick={() => onRemove(i)}
                >
                  &times;
                </button>
              </div>
              <div className="admin-repeat-body">{renderItem(item, i)}</div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className="admin-btn admin-btn--ghost admin-btn--wide"
        onClick={onAdd}
      >
        {addLabel}
      </button>
    </div>
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
