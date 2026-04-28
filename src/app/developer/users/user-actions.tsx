"use client";

import { useState, useTransition } from "react";
import { deleteUserAction, revokeInviteAction, resendInviteAction } from "./actions";

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
      <p className="prospect-confirm-text">Delete <strong>{name}</strong>? Cannot be undone.</p>
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

export function ResendInviteButton({ email, role, ownedSlug }: { email: string; role: string; ownedSlug?: string | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="admin-btn admin-btn--ghost"
      style={{ fontSize: 13 }}
      disabled={status === "sending" || status === "sent"}
      onClick={() => {
        setStatus("sending");
        startTransition(async () => {
          const result = await resendInviteAction(email, role, ownedSlug ?? null);
          setStatus(result.ok ? "sent" : "error");
          if (result.ok) setTimeout(() => setStatus("idle"), 3000);
        });
      }}
    >
      {status === "sending" ? "Sending…" : status === "sent" ? "Sent ✓" : status === "error" ? "Failed" : "Resend"}
    </button>
  );
}

export function RevokeInviteButton({ token, email }: { token: string; email: string }) {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!confirm) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        style={{ fontSize: 13 }}
        onClick={() => setConfirm(true)}
      >
        Revoke
      </button>
    );
  }

  return (
    <div className="prospect-confirm-delete">
      <p className="prospect-confirm-text">Revoke invite for <strong>{email}</strong>?</p>
      <div className="prospect-confirm-actions">
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await revokeInviteAction(token);
            });
          }}
        >
          {isPending ? "Revoking\u2026" : "Yes, revoke"}
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
