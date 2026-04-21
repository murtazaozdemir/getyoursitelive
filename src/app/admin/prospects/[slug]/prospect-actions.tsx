"use client";

import { useState, useTransition } from "react";
import {
  updateProspectStatusAction,
  addProspectNoteAction,
  deleteProspectAction,
  updateProspectInfoAction,
} from "@/app/admin/prospects/actions";
import type { ProspectStatus } from "@/lib/prospects";

type ActionProps =
  | { action: "status"; slug: string; status: ProspectStatus; label: string; active: boolean; past: boolean }
  | { action: "copy"; slug: string; previewUrl: string }
  | { action: "add-note"; slug: string }
  | { action: "edit-info"; slug: string; name: string; phone: string; address: string }
  | { action: "delete"; slug: string };

export function ProspectActions(props: ActionProps) {
  const [isPending, startTransition] = useTransition();

  if (props.action === "status") {
    const { slug, status, label, active, past } = props;
    return (
      <button
        type="button"
        className={[
          "prospect-stage-btn",
          active ? "prospect-stage-btn--active" : "",
          past ? "prospect-stage-btn--past" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={active || isPending}
        onClick={() => {
          startTransition(async () => {
            await updateProspectStatusAction(slug, status);
          });
        }}
      >
        {label}
      </button>
    );
  }

  if (props.action === "copy") {
    return <CopyButton url={props.previewUrl} />;
  }

  if (props.action === "add-note") {
    return <AddNoteForm slug={props.slug} />;
  }

  if (props.action === "edit-info") {
    return (
      <EditInfoForm
        slug={props.slug}
        name={props.name}
        phone={props.phone}
        address={props.address}
      />
    );
  }

  if (props.action === "delete") {
    return <DeleteButton slug={props.slug} />;
  }

  return null;
}

function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select input
    }
  }

  return (
    <button
      type="button"
      className="admin-btn admin-btn--ghost"
      onClick={handleCopy}
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}

function AddNoteForm({ slug }: { slug: string }) {
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    startTransition(async () => {
      await addProspectNoteAction(slug, text.trim());
      setText("");
    });
  }

  return (
    <form className="prospect-note-form" onSubmit={handleSubmit}>
      <textarea
        className="admin-input prospect-note-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a note…"
        rows={2}
        disabled={isPending}
      />
      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={!text.trim() || isPending}
      >
        {isPending ? "Saving…" : "Add note"}
      </button>
    </form>
  );
}

function EditInfoForm({
  slug,
  name: initialName,
  phone: initialPhone,
  address: initialAddress,
}: {
  slug: string;
  name: string;
  phone: string;
  address: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateProspectInfoAction(slug, { name, phone, address });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <form className="prospect-edit-info-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label className="admin-label">Business name</label>
        <input
          className="admin-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
      </div>
      <div className="admin-field">
        <label className="admin-label">Phone</label>
        <input
          className="admin-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPending}
          placeholder="(000) 000-0000"
        />
      </div>
      <div className="admin-field">
        <label className="admin-label">Address</label>
        <input
          className="admin-input"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isPending}
          placeholder="123 Main St, City, NJ 07000"
        />
      </div>
      {error && <p className="admin-error">{error}</p>}
      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={isPending}
      >
        {isPending ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}

function DeleteButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  if (!confirm) {
    return (
      <button
        type="button"
        className="admin-btn admin-btn--danger"
        onClick={() => setConfirm(true)}
      >
        Delete prospect
      </button>
    );
  }

  return (
    <div className="prospect-confirm-delete">
      <p className="prospect-confirm-text">
        This will delete the prospect record and the preview site. Are you sure?
      </p>
      <div className="prospect-confirm-actions">
        <button
          type="button"
          className="admin-btn admin-btn--danger"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              await deleteProspectAction(slug);
            });
          }}
        >
          {isPending ? "Deleting…" : "Yes, delete"}
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
