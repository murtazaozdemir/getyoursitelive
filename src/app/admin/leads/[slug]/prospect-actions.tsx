"use client";

import { useState, useTransition } from "react";
import {
  updateProspectStatusAction,
  addProspectNoteAction,
  deleteProspectAction,
  updateProspectInfoAction,
  updateProspectDomainsAction,
  createOwnerLoginAction,
} from "@/app/admin/leads/actions";
import type { ProspectStatus } from "@/lib/prospects";
import { getAllCategories } from "@/lib/templates/registry";

const BUSINESS_CATEGORIES = getAllCategories();

const STAGE_ORDER: ProspectStatus[] = ["found", "contacted", "interested", "paid", "delivered"];
const STAGE_LABELS: Record<ProspectStatus, string> = {
  found: "Found",
  contacted: "Contacted",
  interested: "Interested",
  paid: "Paid",
  delivered: "Delivered",
};

export function PipelineStageSelector({
  slug,
  currentStatus,
  locked,
}: {
  slug: string;
  currentStatus: ProspectStatus;
  locked: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ type: "skip" | "revert"; message: string; targetStatus: ProspectStatus } | null>(null);
  const currentIdx = STAGE_ORDER.indexOf(currentStatus);

  function dismissToast() {
    setToast(null);
  }

  function handleClick(targetStatus: ProspectStatus, targetIdx: number) {
    if (locked) return;
    if (targetStatus === currentStatus) return;

    const isGoingBack = targetIdx < currentIdx;
    const isSkipping = targetIdx > currentIdx + 1;

    if (isSkipping) {
      const missing = STAGE_ORDER.slice(currentIdx + 1, targetIdx)
        .map((s) => STAGE_LABELS[s])
        .join(", ");
      setToast({
        type: "skip",
        message: `Complete ${missing} first.`,
        targetStatus,
      });
      return;
    }

    if (isGoingBack) {
      setToast({
        type: "revert",
        message: `Move back to "${STAGE_LABELS[targetStatus]}"? This is unusual — did you select it by mistake?`,
        targetStatus,
      });
      return;
    }

    // Normal forward move (next stage)
    dismissToast();
    startTransition(async () => {
      await updateProspectStatusAction(slug, targetStatus);
    });
  }

  function confirmRevert() {
    if (!toast || toast.type !== "revert") return;
    const target = toast.targetStatus;
    dismissToast();
    startTransition(async () => {
      await updateProspectStatusAction(slug, target, { revertMistake: true });
    });
  }

  return (
    <div className="prospect-stages-wrap">
      <div className="prospect-stages">
        {STAGE_ORDER.map((status, i) => {
          const isActive = status === currentStatus;
          const isPast = i < currentIdx;
          return (
            <button
              key={status}
              type="button"
              className={[
                "prospect-stage-btn",
                isActive ? "prospect-stage-btn--active" : "",
                isPast ? "prospect-stage-btn--past" : "",
                locked && !isActive ? "prospect-stage-btn--locked" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={isActive || isPending || (locked && !isActive)}
              onClick={() => handleClick(status, i)}
            >
              {STAGE_LABELS[status]}
            </button>
        );
      })}
      </div>
      {toast && (
        <div className={`stage-toast stage-toast--${toast.type}`}>
          <span className="stage-toast-msg">{toast.message}</span>
          <div className="stage-toast-actions">
            {toast.type === "revert" && (
              <button type="button" className="stage-toast-btn stage-toast-btn--confirm" onClick={confirmRevert}>
                Yes, revert
              </button>
            )}
            <button type="button" className="stage-toast-btn stage-toast-btn--dismiss" onClick={dismissToast}>
              {toast.type === "revert" ? "Cancel" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type ActionProps =
  | { action: "status"; slug: string; status: ProspectStatus; label: string; active: boolean; past: boolean; locked?: boolean }
  | { action: "copy"; slug: string; previewUrl: string }
  | { action: "add-note"; slug: string }
  | { action: "edit-info"; slug: string; name: string; phone: string; address: string; category: string }
  | { action: "edit-domains"; slug: string; domain1: string; domain2: string; domain3: string }
  | { action: "create-login"; slug: string }
  | { action: "delete"; slug: string };

export function ProspectActions(props: ActionProps) {
  const [isPending, startTransition] = useTransition();

  if (props.action === "status") {
    const { slug, status, label, active, past, locked } = props;
    return (
      <button
        type="button"
        className={[
          "prospect-stage-btn",
          active ? "prospect-stage-btn--active" : "",
          past ? "prospect-stage-btn--past" : "",
          locked && !active ? "prospect-stage-btn--locked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={active || isPending || (locked && !active)}
        title={locked && !active ? "Locked — another reseller is handling this lead" : undefined}
        onClick={() => {
          if (locked) return;
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
        category={props.category}
      />
    );
  }

  if (props.action === "edit-domains") {
    return (
      <EditDomainsForm
        slug={props.slug}
        domain1={props.domain1}
        domain2={props.domain2}
        domain3={props.domain3}
      />
    );
  }

  if (props.action === "create-login") {
    return <CreateLoginForm slug={props.slug} />;
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
  category: initialCategory,
}: {
  slug: string;
  name: string;
  phone: string;
  address: string;
  category: string;
}) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [address, setAddress] = useState(initialAddress);
  const [category, setCategory] = useState(initialCategory || "Car repair and maintenance service");
  const categoryOptions = BUSINESS_CATEGORIES.includes(initialCategory as typeof BUSINESS_CATEGORIES[number])
    ? BUSINESS_CATEGORIES
    : [initialCategory, ...BUSINESS_CATEGORIES];
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateProspectInfoAction(slug, { name, phone, address, category });
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
        <label className="admin-label">Business category</label>
        <select
          className="admin-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isPending}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
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

function EditDomainsForm({
  slug,
  domain1: initial1,
  domain2: initial2,
  domain3: initial3,
}: {
  slug: string;
  domain1: string;
  domain2: string;
  domain3: string;
}) {
  const [domain1, setDomain1] = useState(initial1);
  const [domain2, setDomain2] = useState(initial2);
  const [domain3, setDomain3] = useState(initial3);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      await updateProspectDomainsAction(slug, { domain1, domain2, domain3 });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <form className="prospect-domains-form" onSubmit={handleSubmit}>
      <input
        className="admin-input prospect-domain-input"
        value={domain1}
        onChange={(e) => setDomain1(e.target.value)}
        disabled={isPending}
        placeholder="Domain 1 (e.g. starauto.com)"
      />
      <input
        className="admin-input prospect-domain-input"
        value={domain2}
        onChange={(e) => setDomain2(e.target.value)}
        disabled={isPending}
        placeholder="Domain 2"
      />
      <input
        className="admin-input prospect-domain-input"
        value={domain3}
        onChange={(e) => setDomain3(e.target.value)}
        disabled={isPending}
        placeholder="Domain 3"
      />
      <button
        type="submit"
        className="admin-btn admin-btn--ghost prospect-domain-save"
        disabled={isPending}
      >
        {isPending ? "…" : saved ? "Saved ✓" : "Save"}
      </button>
    </form>
  );
}

function CreateLoginForm({ slug }: { slug: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <p className="admin-section-lede" style={{ color: "var(--admin-text-soft)" }}>
        ✓ Business Owner Login created. Share the credentials with them.
      </p>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createOwnerLoginAction(slug, { name, email, password });
      if (result.ok) {
        setDone(true);
      } else {
        setError(result.error ?? "Failed to create login.");
      }
    });
  }

  return (
    <form className="prospect-edit-info-form" onSubmit={handleSubmit}>
      <div className="admin-field">
        <label className="admin-label">Client name</label>
        <input
          className="admin-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
          placeholder="Jane Smith"
        />
      </div>
      <div className="admin-field">
        <label className="admin-label">Login email</label>
        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          required
          placeholder="owner@theirshop.com"
        />
      </div>
      <div className="admin-field">
        <label className="admin-label">Temporary password</label>
        <input
          className="admin-input"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          required
          minLength={8}
          placeholder="Min. 8 characters"
          autoComplete="off"
        />
        <span className="admin-field-help">Share this with the client. They can change it after login.</span>
      </div>
      {error && <p className="admin-error">{error}</p>}
      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={isPending || !name.trim() || !email.trim() || password.length < 8}
      >
        {isPending ? "Creating…" : "Create login"}
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
        Delete lead
      </button>
    );
  }

  return (
    <div className="prospect-confirm-delete">
      <p className="prospect-confirm-text">
        This will delete the lead record and the preview site. Are you sure?
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
