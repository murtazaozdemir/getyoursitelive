"use client";

import { useState, useTransition } from "react";
import { updateProspectStatusAction } from "@/app/admin/leads/actions";
import type { ProspectStatus } from "@/lib/prospects";
import {
  CopyButton,
  AddNoteForm,
  EditInfoForm,
  EditDomainsForm,
  CreateLoginForm,
  RemoveLockButton,
  DeleteButton,
} from "./prospect-forms";

export { RemoveLockButton } from "./prospect-forms";

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
