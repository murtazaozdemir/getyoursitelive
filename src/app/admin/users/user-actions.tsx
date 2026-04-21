"use client";

import { useState, useTransition } from "react";
import { deleteUserAction } from "./actions";

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn--danger"
        onClick={() => setConfirm(true)}
      >
        Delete
      </button>
    );
  }

  return (
    <div className="prospect-confirm-delete">
      <p className="prospect-confirm-text">Delete {name}? This cannot be undone.</p>
      <div className="prospect-confirm-actions">
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await deleteUserAction(id);
            });
          }}
        >
          {isPending ? "Deleting\u2026" : "Yes, delete"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={isPending}
          onClick={() => setConfirm(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
