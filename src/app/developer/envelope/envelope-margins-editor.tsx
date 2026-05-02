"use client";

import { useState, useTransition } from "react";
import { saveEnvelopeMarginsAction } from "./actions";
import type { EnvelopeMargins } from "@/lib/platform-settings";

/* ── tiny inline input next to an arrow ── */
function MarginInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <span className="em-input-wrap" title={label}>
      <input
        type="number"
        step="0.05"
        min="0"
        max="5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="em-input"
      />
      <span className="em-unit">in</span>
    </span>
  );
}

export function EnvelopeMarginsEditor({
  envelope,
  initial,
  defaults,
}: {
  envelope: "envelope1" | "envelope2";
  initial: EnvelopeMargins;
  defaults: EnvelopeMargins;
}) {
  const [m, setM] = useState<EnvelopeMargins>(initial);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"front" | "back">("front");

  function set(key: keyof EnvelopeMargins, value: string) {
    setM((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await saveEnvelopeMarginsAction(envelope, m);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    });
  }

  function handleReset() {
    setM(defaults);
    setSaved(false);
  }

  /* Scale: real envelope is 9in x 6in.
     We render at 90px per inch → 810px x 540px.
     All element positions use the margin values × 90. */
  const PPI = 90;
  const W = 9 * PPI;   // 810
  const H = 6 * PPI;   // 540

  const n = (v: string) => parseFloat(v) || 0;

  return (
    <div>
      {/* toolbar */}
      <div className="em-toolbar">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save margins"}
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={handleReset}
        >
          Reset to defaults
        </button>
        {saved && <span className="em-saved">Saved</span>}
      </div>

      {/* front / back tabs */}
      <div className="em-tabs">
        <button
          type="button"
          className={`em-tab ${tab === "front" ? "em-tab--active" : ""}`}
          onClick={() => setTab("front")}
        >
          Front Side
        </button>
        <button
          type="button"
          className={`em-tab ${tab === "back" ? "em-tab--active" : ""}`}
          onClick={() => setTab("back")}
        >
          Back Side
        </button>
      </div>

      {/* envelope canvas */}
      <div className="em-canvas-wrap">
        <div className="em-size-label">9 in &times; 6 in (#10 envelope)</div>

        {tab === "front" ? (
          <div className="em-canvas" style={{ width: W, height: H }}>
            {/* ── Return Address box ── */}
            <div
              className="em-box em-box--return"
              style={{
                top: n(m.returnTop) * PPI,
                left: n(m.returnLeft) * PPI,
              }}
            >
              <div className="em-box-label">Return Address</div>
              <div className="em-box-sample">Company Name</div>
              <div className="em-box-sample">123 Main St</div>
              <div className="em-box-sample">City, ST 00000</div>
            </div>

            {/* Arrow: returnTop (top edge → box) */}
            <div
              className="em-dim em-dim--v"
              style={{ top: 0, left: n(m.returnLeft) * PPI + 10 }}
            >
              <div className="em-dim-line" style={{ height: n(m.returnTop) * PPI }} />
              <MarginInput value={m.returnTop} onChange={(v) => set("returnTop", v)} label="Return — Top" />
            </div>

            {/* Arrow: returnLeft (left edge → box) */}
            <div
              className="em-dim em-dim--h"
              style={{ top: n(m.returnTop) * PPI + 20, left: 0 }}
            >
              <div className="em-dim-line-h" style={{ width: n(m.returnLeft) * PPI }} />
              <MarginInput value={m.returnLeft} onChange={(v) => set("returnLeft", v)} label="Return — Left" />
            </div>

            {/* ── Postage box (upper right) ── */}
            <div
              className="em-box em-box--postage"
              style={{
                top: n(m.postageTop) * PPI,
                right: n(m.postageRight) * PPI,
              }}
            >
              <div className="em-box-label">PLACE</div>
              <div className="em-box-label">STAMP</div>
              <div className="em-box-label">HERE</div>
            </div>

            {/* Arrow: postageTop */}
            <div
              className="em-dim em-dim--v"
              style={{ top: 0, right: n(m.postageRight) * PPI + 50 }}
            >
              <div className="em-dim-line" style={{ height: n(m.postageTop) * PPI }} />
              <MarginInput value={m.postageTop} onChange={(v) => set("postageTop", v)} label="Stamp — Top" />
            </div>

            {/* Arrow: postageRight */}
            <div
              className="em-dim em-dim--h-right"
              style={{ top: n(m.postageTop) * PPI + 30, right: 0 }}
            >
              <MarginInput value={m.postageRight} onChange={(v) => set("postageRight", v)} label="Stamp — Right" />
              <div className="em-dim-line-h" style={{ width: n(m.postageRight) * PPI }} />
            </div>

            {/* ── Notice box (upper center) ── */}
            <div
              className="em-box em-box--notice"
              style={{
                top: n(m.noticeTop) * PPI,
                left: n(m.noticeLeft) * PPI,
              }}
            >
              <div className="em-box-label" style={{ fontWeight: 700, fontSize: 10 }}>LOCAL BUSINESS REVIEW</div>
              <div className="em-box-sample">Prepared for current owner</div>
              <div className="em-box-sample">Response requested</div>
            </div>

            {/* Arrow: noticeTop */}
            <div
              className="em-dim em-dim--v"
              style={{ top: 0, left: n(m.noticeLeft) * PPI + 60 }}
            >
              <div className="em-dim-line" style={{ height: n(m.noticeTop) * PPI }} />
              <MarginInput value={m.noticeTop} onChange={(v) => set("noticeTop", v)} label="Notice — Top" />
            </div>

            {/* Arrow: noticeLeft */}
            <div
              className="em-dim em-dim--h"
              style={{ top: n(m.noticeTop) * PPI + 20, left: 0 }}
            >
              <div className="em-dim-line-h" style={{ width: n(m.noticeLeft) * PPI }} />
              <MarginInput value={m.noticeLeft} onChange={(v) => set("noticeLeft", v)} label="Notice — Left" />
            </div>

            {/* ── Recipient box (center-bottom) ── */}
            <div
              className="em-box em-box--recipient"
              style={{
                top: n(m.recipientTop) * PPI,
                left: n(m.recipientLeft) * PPI,
              }}
            >
              <div className="em-box-label" style={{ fontWeight: 700, fontSize: 12 }}>Business Name</div>
              <div className="em-box-sample">Owner</div>
              <div className="em-box-sample">123 Street Address</div>
              <div className="em-box-sample">City, ST 00000</div>
            </div>

            {/* Arrow: recipientTop */}
            <div
              className="em-dim em-dim--v"
              style={{ top: 0, left: n(m.recipientLeft) * PPI + 10 }}
            >
              <div className="em-dim-line" style={{ height: n(m.recipientTop) * PPI }} />
              <MarginInput value={m.recipientTop} onChange={(v) => set("recipientTop", v)} label="Recipient — Top" />
            </div>

            {/* Arrow: recipientLeft */}
            <div
              className="em-dim em-dim--h"
              style={{ top: n(m.recipientTop) * PPI + 20, left: 0 }}
            >
              <div className="em-dim-line-h" style={{ width: n(m.recipientLeft) * PPI }} />
              <MarginInput value={m.recipientLeft} onChange={(v) => set("recipientLeft", v)} label="Recipient — Left" />
            </div>

            {/* Barcode zone indicator */}
            <div className="em-barcode-zone">
              <span>Barcode clear zone (4.75 &times; 0.625 in)</span>
            </div>
          </div>
        ) : (
          /* ── BACK SIDE ── */
          <div className="em-canvas" style={{ width: W, height: H }}>
            {/* Content area */}
            <div
              className="em-box em-box--back-content"
              style={{
                top: n(m.backContentTop) * PPI,
                left: n(m.backContentLeft) * PPI,
                right: n(m.backContentRight) * PPI,
                bottom: n(m.backContentBottom) * PPI,
              }}
            >
              <div className="em-box-label" style={{ fontSize: 13, fontWeight: 700 }}>Back Content Area</div>
              <div className="em-box-sample">Headline, QR code, URL</div>
              <div className="em-box-sample">(rotated 180&deg; when printed)</div>
            </div>

            {/* Arrow: backContentTop */}
            <div
              className="em-dim em-dim--v"
              style={{ top: 0, left: W / 2 - 30 }}
            >
              <div className="em-dim-line" style={{ height: n(m.backContentTop) * PPI }} />
              <MarginInput value={m.backContentTop} onChange={(v) => set("backContentTop", v)} label="Back — Top" />
            </div>

            {/* Arrow: backContentBottom */}
            <div
              className="em-dim em-dim--v-bottom"
              style={{ bottom: 0, left: W / 2 - 30 }}
            >
              <MarginInput value={m.backContentBottom} onChange={(v) => set("backContentBottom", v)} label="Back — Bottom" />
              <div className="em-dim-line" style={{ height: n(m.backContentBottom) * PPI }} />
            </div>

            {/* Arrow: backContentLeft */}
            <div
              className="em-dim em-dim--h"
              style={{ top: H / 2 - 10, left: 0 }}
            >
              <div className="em-dim-line-h" style={{ width: n(m.backContentLeft) * PPI }} />
              <MarginInput value={m.backContentLeft} onChange={(v) => set("backContentLeft", v)} label="Back — Left" />
            </div>

            {/* Arrow: backContentRight */}
            <div
              className="em-dim em-dim--h-right"
              style={{ top: H / 2 - 10, right: 0 }}
            >
              <MarginInput value={m.backContentRight} onChange={(v) => set("backContentRight", v)} label="Back — Right" />
              <div className="em-dim-line-h" style={{ width: n(m.backContentRight) * PPI }} />
            </div>
          </div>
        )}
      </div>

      <style>{`
        .em-toolbar {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          align-items: center;
        }
        .em-saved {
          color: #16a34a;
          font-size: 14px;
          font-weight: 500;
        }

        .em-tabs {
          display: flex;
          gap: 0;
          margin-bottom: 16px;
          border-bottom: 2px solid #e5e5e5;
        }
        .em-tab {
          padding: 8px 20px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -2px;
          transition: all 0.15s;
        }
        .em-tab:hover { color: #444; }
        .em-tab--active {
          color: #1a6b50;
          border-bottom-color: #1a6b50;
        }

        .em-canvas-wrap {
          overflow-x: auto;
          padding: 16px 0;
        }
        .em-size-label {
          font-size: 12px;
          color: #999;
          margin-bottom: 8px;
          font-family: monospace;
        }

        .em-canvas {
          position: relative;
          border: 2px solid #333;
          background: #fefefe;
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size: ${PPI}px ${PPI}px;
          box-shadow: 4px 4px 0 rgba(0,0,0,0.06);
        }

        /* ── Element boxes ── */
        .em-box {
          position: absolute;
          border: 1.5px dashed #1a6b50;
          background: rgba(26,107,80,0.04);
          padding: 6px 10px;
          border-radius: 3px;
          pointer-events: none;
        }
        .em-box-label {
          font-size: 10px;
          font-weight: 600;
          color: #1a6b50;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .em-box-sample {
          font-size: 9px;
          color: #888;
          line-height: 1.5;
          white-space: nowrap;
        }

        .em-box--return {
          width: 160px;
        }
        .em-box--postage {
          width: ${1.2 * PPI}px;
          height: ${0.85 * PPI}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-style: solid;
          border-color: #bbb;
          background: rgba(0,0,0,0.02);
        }
        .em-box--postage .em-box-label {
          color: #bbb;
          font-size: 8px;
          margin-bottom: 0;
        }
        .em-box--notice {
          width: ${2.8 * PPI}px;
          border: 1.5px solid #333;
          background: rgba(0,0,0,0.02);
          text-align: center;
        }
        .em-box--notice .em-box-label {
          color: #333;
        }
        .em-box--recipient {
          width: 200px;
        }
        .em-box--back-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          border-style: dashed;
        }

        /* ── Barcode zone ── */
        .em-barcode-zone {
          position: absolute;
          bottom: 0;
          right: 0;
          width: ${4.75 * PPI}px;
          height: ${0.625 * PPI}px;
          border: 1px dashed #ddd;
          background: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.04) 3px,
            rgba(0,0,0,0.04) 4px
          );
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .em-barcode-zone span {
          font-size: 8px;
          color: #bbb;
          background: #fefefe;
          padding: 0 6px;
        }

        /* ── Dimension arrows / lines ── */
        .em-dim {
          position: absolute;
          z-index: 10;
          display: flex;
          align-items: center;
          pointer-events: auto;
        }
        .em-dim--v {
          flex-direction: column;
        }
        .em-dim--v-bottom {
          flex-direction: column;
        }
        .em-dim--h {
          flex-direction: row;
        }
        .em-dim--h-right {
          flex-direction: row;
        }

        .em-dim-line {
          width: 1px;
          background: #e74c3c;
          position: relative;
          min-height: 4px;
        }
        .em-dim-line::before,
        .em-dim-line::after {
          content: '';
          position: absolute;
          left: -3px;
          width: 7px;
          height: 1px;
          background: #e74c3c;
        }
        .em-dim-line::before { top: 0; }
        .em-dim-line::after { bottom: 0; }

        .em-dim-line-h {
          height: 1px;
          background: #e74c3c;
          position: relative;
          min-width: 4px;
        }
        .em-dim-line-h::before,
        .em-dim-line-h::after {
          content: '';
          position: absolute;
          top: -3px;
          width: 1px;
          height: 7px;
          background: #e74c3c;
        }
        .em-dim-line-h::before { left: 0; }
        .em-dim-line-h::after { right: 0; }

        /* ── Inline input ── */
        .em-input-wrap {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          background: #fff;
          border: 1px solid #e74c3c;
          border-radius: 4px;
          padding: 1px 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          pointer-events: auto;
        }
        .em-input {
          width: 48px;
          border: none;
          outline: none;
          font-size: 12px;
          font-family: monospace;
          text-align: right;
          padding: 2px 0;
          background: transparent;
          color: #e74c3c;
          font-weight: 600;
        }
        .em-input:focus {
          color: #222;
        }
        .em-input::-webkit-inner-spin-button {
          opacity: 1;
        }
        .em-unit {
          font-size: 10px;
          color: #999;
        }
      `}</style>
    </div>
  );
}
