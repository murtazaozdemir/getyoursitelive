"use client";

import { useState, useTransition } from "react";
import { saveEnvelopeMarginsAction } from "./actions";
import type { EnvelopeMargins } from "@/lib/platform-settings";

function MInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <span className="em-inp" title={label}>
      <input
        type="number"
        step="0.05"
        min="0"
        max="5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span>in</span>
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

  const PPI = 90;
  const W = 9 * PPI;
  const H = 6 * PPI;
  const n = (v: string) => parseFloat(v) || 0;

  const isV2 = envelope === "envelope2";

  return (
    <div>
      <div className="em-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save margins"}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={handleReset}>
          Reset to defaults
        </button>
        {saved && <span className="em-saved">Saved</span>}
      </div>

      <div className="em-tabs">
        <button type="button" className={`em-tab ${tab === "front" ? "em-tab--on" : ""}`} onClick={() => setTab("front")}>Front Side</button>
        <button type="button" className={`em-tab ${tab === "back" ? "em-tab--on" : ""}`} onClick={() => setTab("back")}>Back Side</button>
      </div>

      <div className="em-scroll">
        <div className="em-size">9 in &times; 6 in (#10 envelope) &mdash; {isV2 ? "Envelope 2 (with screenshot)" : "Envelope 1 (text only)"}</div>

        <div className="em-env" style={{ width: W, height: H }}>
          {tab === "front" ? (
            <>
              {/* ═══ FLAP OPENING (front: slit at top) ═══ */}
              <div className="em-flap-front">
                <span className="em-flap-label">opening slit</span>
              </div>

              {/* ═══ RETURN ADDRESS ═══ */}
              <div className="em-el" style={{ top: n(m.returnTop) * PPI, left: n(m.returnLeft) * PPI, width: 170 }}>
                <div className="em-el-title">Return Address</div>
                <div className="em-el-line"><strong>Get Your Site Live</strong></div>
                <div className="em-el-line">123 Main St</div>
                <div className="em-el-line">Clifton, NJ 07011</div>
              </div>
              {/* dim: returnTop */}
              <svg className="em-svg" style={{ position: "absolute", top: 0, left: n(m.returnLeft) * PPI + 80, width: 2, height: n(m.returnTop) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: Math.max(n(m.returnTop) * PPI / 2 - 10, 0), left: n(m.returnLeft) * PPI + 86 }}>
                <MInput value={m.returnTop} onChange={(v) => set("returnTop", v)} label="Return — Top" />
              </div>
              {/* dim: returnLeft */}
              <svg className="em-svg" style={{ position: "absolute", top: n(m.returnTop) * PPI + 18, left: 0, width: n(m.returnLeft) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: n(m.returnTop) * PPI + 8, left: Math.max(n(m.returnLeft) * PPI / 2 - 30, 0) }}>
                <MInput value={m.returnLeft} onChange={(v) => set("returnLeft", v)} label="Return — Left" />
              </div>

              {/* ═══ STAMP BOX ═══ */}
              <div className="em-el em-el--stamp" style={{ top: n(m.postageTop) * PPI, right: n(m.postageRight) * PPI, width: 1.2 * PPI, height: 0.85 * PPI }}>
                <div className="em-stamp-text">PLACE<br/>STAMP<br/>HERE</div>
              </div>
              {/* dim: postageTop */}
              <svg className="em-svg" style={{ position: "absolute", top: 0, right: n(m.postageRight) * PPI + 54, width: 2, height: n(m.postageTop) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: Math.max(n(m.postageTop) * PPI / 2 - 10, 0), right: n(m.postageRight) * PPI + 58 }}>
                <MInput value={m.postageTop} onChange={(v) => set("postageTop", v)} label="Stamp — Top" />
              </div>
              {/* dim: postageRight */}
              <svg className="em-svg" style={{ position: "absolute", top: n(m.postageTop) * PPI + 38, right: 0, width: n(m.postageRight) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: n(m.postageTop) * PPI + 28, right: Math.max(n(m.postageRight) * PPI / 2 - 30, 0) }}>
                <MInput value={m.postageRight} onChange={(v) => set("postageRight", v)} label="Stamp — Right" />
              </div>

              {/* ═══ NOTICE BOX ═══ */}
              <div className="em-el em-el--notice" style={{ top: n(m.noticeTop) * PPI, left: n(m.noticeLeft) * PPI, width: 2.8 * PPI }}>
                <div className="em-el-title" style={{ fontWeight: 700, letterSpacing: "0.04em" }}>LOCAL BUSINESS REVIEW</div>
                <div className="em-el-line">Prepared for current owner</div>
                <div className="em-el-line">Response requested</div>
              </div>
              {/* dim: noticeTop */}
              <svg className="em-svg" style={{ position: "absolute", top: 0, left: n(m.noticeLeft) * PPI + 126, width: 2, height: n(m.noticeTop) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: Math.max(n(m.noticeTop) * PPI / 2 - 10, 0), left: n(m.noticeLeft) * PPI + 132 }}>
                <MInput value={m.noticeTop} onChange={(v) => set("noticeTop", v)} label="Notice — Top" />
              </div>
              {/* dim: noticeLeft */}
              <svg className="em-svg" style={{ position: "absolute", top: n(m.noticeTop) * PPI + 18, left: 0, width: n(m.noticeLeft) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: n(m.noticeTop) * PPI + 8, left: Math.max(n(m.noticeLeft) * PPI / 2 - 30, 2) }}>
                <MInput value={m.noticeLeft} onChange={(v) => set("noticeLeft", v)} label="Notice — Left" />
              </div>

              {/* ═══ RECIPIENT ═══ */}
              <div className="em-el em-el--recipient" style={{ top: n(m.recipientTop) * PPI, left: n(m.recipientLeft) * PPI, width: 220 }}>
                <div className="em-el-title" style={{ fontSize: 13, fontWeight: 700 }}>Business Name</div>
                <div className="em-el-line">Owner</div>
                <div className="em-el-line">123 Street Address</div>
                <div className="em-el-line">City, ST 00000</div>
              </div>
              {/* dim: recipientTop */}
              <svg className="em-svg" style={{ position: "absolute", top: 0, left: n(m.recipientLeft) * PPI + 100, width: 2, height: n(m.recipientTop) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: n(m.recipientTop) * PPI / 2 - 10, left: n(m.recipientLeft) * PPI + 106 }}>
                <MInput value={m.recipientTop} onChange={(v) => set("recipientTop", v)} label="Recipient — Top" />
              </div>
              {/* dim: recipientLeft */}
              <svg className="em-svg" style={{ position: "absolute", top: n(m.recipientTop) * PPI + 18, left: 0, width: n(m.recipientLeft) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: n(m.recipientTop) * PPI + 8, left: Math.max(n(m.recipientLeft) * PPI / 2 - 30, 2) }}>
                <MInput value={m.recipientLeft} onChange={(v) => set("recipientLeft", v)} label="Recipient — Left" />
              </div>

              {/* ═══ BARCODE ZONE ═══ */}
              <div className="em-barcode" style={{ position: "absolute", bottom: 0, right: 0, width: 4.75 * PPI, height: 0.625 * PPI }}>
                <div className="em-barcode-bars" />
                <span>Barcode clear zone &mdash; 4.75 &times; 0.625 in</span>
              </div>
            </>
          ) : (
            /* ═══════ BACK SIDE ═══════ */
            <>
              {/* ═══ FLAP (back: triangular fold at top) ═══ */}
              <div className="em-flap-back">
                <svg width={W} height="50" viewBox={`0 0 ${W} 50`} preserveAspectRatio="none">
                  <path d={`M 0 0 L ${W} 0 L ${W / 2} 46`} fill="rgba(0,0,0,0.04)" stroke="#bbb" strokeWidth="1" />
                </svg>
                <span className="em-flap-label-back">flap (folds down to seal)</span>
              </div>

              {/* Small note at top */}
              <div className="em-back-note">For delivery address see other side</div>

              {/* Content boundary box */}
              <div
                className="em-back-boundary"
                style={{
                  top: n(m.backContentTop) * PPI,
                  left: n(m.backContentLeft) * PPI,
                  right: n(m.backContentRight) * PPI,
                  bottom: n(m.backContentBottom) * PPI,
                }}
              >
                {isV2 ? (
                  /* Envelope 2: screenshot + text/QR split */
                  <>
                    <div className="em-back-screenshot-box">
                      <div className="em-back-img-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                      <div className="em-back-img-label">Website Screenshot</div>
                      <div className="em-back-img-sub">Auto-captured from live preview</div>
                    </div>
                    <div className="em-back-text-block">
                      <div className="em-back-hl">We built a website for</div>
                      <div className="em-back-shop"><strong>Business Name</strong></div>
                      <div className="em-back-sub">See your business online.</div>
                      <div className="em-back-row">
                        <div className="em-back-qr-box">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="3" height="3" />
                            <rect x="18" y="18" width="3" height="3" />
                          </svg>
                          <div className="em-back-qr-label">QR Code</div>
                        </div>
                        <div className="em-back-url-col">
                          <div className="em-back-cta">Scan to see it instantly</div>
                          <div className="em-back-url">getyoursitelive.com/slug</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Envelope 1: text + QR centered vertically */
                  <div className="em-back-centered">
                    <div className="em-back-hl" style={{ fontSize: 14 }}>We built a website for <strong>Business Name.</strong></div>
                    <div className="em-back-sub">See your business online. Take a look.</div>
                    <div className="em-back-cta">Scan the QR code below to see it instantly:</div>
                    <div className="em-back-qr-box" style={{ margin: "8px auto" }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="1.5">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="3" height="3" />
                        <rect x="18" y="18" width="3" height="3" />
                      </svg>
                      <div className="em-back-qr-label">QR Code</div>
                    </div>
                    <div className="em-back-url">www.getyoursitelive.com/slug</div>
                  </div>
                )}
              </div>

              {/* dim: backContentTop */}
              <svg className="em-svg" style={{ position: "absolute", top: 0, left: W / 2, width: 2, height: n(m.backContentTop) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: Math.max(n(m.backContentTop) * PPI / 2 - 10, 0), left: W / 2 + 6 }}>
                <MInput value={m.backContentTop} onChange={(v) => set("backContentTop", v)} label="Back — Top" />
              </div>

              {/* dim: backContentBottom */}
              <svg className="em-svg" style={{ position: "absolute", bottom: 0, left: W / 2, width: 2, height: n(m.backContentBottom) * PPI }}>
                <line x1="1" y1="0" x2="1" y2="100%" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="0" x2="5" y2="0" stroke="#e74c3c" strokeWidth="1" />
                <line x1="-3" y1="100%" x2="5" y2="100%" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", bottom: Math.max(n(m.backContentBottom) * PPI / 2 - 10, 0), left: W / 2 + 6 }}>
                <MInput value={m.backContentBottom} onChange={(v) => set("backContentBottom", v)} label="Back — Bottom" />
              </div>

              {/* dim: backContentLeft */}
              <svg className="em-svg" style={{ position: "absolute", top: H / 2, left: 0, width: n(m.backContentLeft) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: H / 2 - 10, left: Math.max(n(m.backContentLeft) * PPI / 2 - 30, 0) }}>
                <MInput value={m.backContentLeft} onChange={(v) => set("backContentLeft", v)} label="Back — Left" />
              </div>

              {/* dim: backContentRight */}
              <svg className="em-svg" style={{ position: "absolute", top: H / 2, right: 0, width: n(m.backContentRight) * PPI, height: 2 }}>
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#e74c3c" strokeWidth="1" />
                <line x1="0" y1="-2" x2="0" y2="5" stroke="#e74c3c" strokeWidth="1" />
                <line x1="100%" y1="-2" x2="100%" y2="5" stroke="#e74c3c" strokeWidth="1" />
              </svg>
              <div style={{ position: "absolute", top: H / 2 - 10, right: Math.max(n(m.backContentRight) * PPI / 2 - 30, 0) }}>
                <MInput value={m.backContentRight} onChange={(v) => set("backContentRight", v)} label="Back — Right" />
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .em-toolbar { display:flex; gap:12px; margin-bottom:20px; align-items:center; }
        .em-saved { color:#16a34a; font-size:14px; font-weight:500; }

        .em-tabs { display:flex; gap:0; margin-bottom:16px; border-bottom:2px solid #e5e5e5; }
        .em-tab {
          padding:8px 20px; border:none; background:none; font-size:14px; font-weight:600;
          color:#888; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px;
        }
        .em-tab:hover { color:#444; }
        .em-tab--on { color:#1a6b50; border-bottom-color:#1a6b50; }

        .em-scroll { overflow-x:auto; padding:16px 0; padding-top:60px; }
        .em-size { font-size:12px; color:#999; margin-bottom:8px; font-family:monospace; }

        .em-env {
          position:relative;
          border:2px solid #333;
          background:#fefefe;
          background-image:
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
          background-size:${PPI}px ${PPI}px;
          box-shadow:4px 4px 0 rgba(0,0,0,0.06);
          overflow:visible;
        }

        /* ── Element boxes on the envelope ── */
        .em-el {
          position:absolute;
          border:1.5px dashed #1a6b50;
          background:rgba(26,107,80,0.05);
          padding:6px 10px;
          border-radius:3px;
        }
        .em-el-title { font-size:10px; font-weight:600; color:#1a6b50; margin-bottom:1px; }
        .em-el-line { font-size:9px; color:#666; line-height:1.6; }

        .em-el--stamp {
          border:1.5px solid #bbb;
          background:rgba(0,0,0,0.02);
          display:flex; align-items:center; justify-content:center;
        }
        .em-stamp-text { font-size:8px; color:#bbb; text-align:center; line-height:1.5; font-weight:600; }

        .em-el--notice {
          border:1.5px solid #333;
          background:rgba(0,0,0,0.02);
          text-align:center;
        }
        .em-el--notice .em-el-title { color:#333; }

        .em-el--recipient {
          border:1.5px dashed #2563eb;
          background:rgba(37,99,235,0.04);
        }
        .em-el--recipient .em-el-title { color:#2563eb; }

        /* ── Barcode zone ── */
        .em-barcode {
          border:1px dashed #ccc;
          display:flex; align-items:center; justify-content:center;
          background:repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 4px);
        }
        .em-barcode span { font-size:8px; color:#bbb; background:#fefefe; padding:0 6px; }

        /* ── SVG dimension lines ── */
        .em-svg { position:absolute; overflow:visible; pointer-events:none; }

        /* ── Back side ── */
        .em-back-note {
          position:absolute; top:14px; left:0; right:0;
          text-align:center; font-size:8px; color:#bbb;
          letter-spacing:0.06em; text-transform:uppercase;
        }
        .em-back-boundary {
          position:absolute;
          border:2px dashed #1a6b50;
          background:rgba(26,107,80,0.03);
          border-radius:4px;
          display:flex;
          flex-direction:column;
          overflow:hidden;
        }

        /* Envelope 2 back: screenshot + text */
        .em-back-screenshot-box {
          flex:1;
          border:2px dashed #2563eb;
          border-radius:4px;
          margin:8px 8px 4px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          background:rgba(37,99,235,0.04);
          min-height:60px;
        }
        .em-back-img-icon { opacity:0.5; }
        .em-back-img-label { font-size:11px; font-weight:600; color:#888; margin-top:6px; }
        .em-back-img-sub { font-size:9px; color:#aaa; margin-top:2px; }

        .em-back-text-block {
          padding:8px 12px;
          margin:4px 8px 8px;
          text-align:center;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:2px;
          border:2px dashed #f59e0b;
          border-radius:4px;
          background:rgba(245,158,11,0.04);
        }

        .em-back-row {
          display:flex;
          align-items:center;
          gap:10px;
          margin-top:4px;
        }

        .em-back-qr-box {
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:2px;
          padding:4px;
          border:1px dashed #ccc;
          border-radius:4px;
          background:rgba(0,0,0,0.02);
        }
        .em-back-qr-label { font-size:7px; color:#999; text-transform:uppercase; letter-spacing:0.05em; }

        .em-back-url-col { display:flex; flex-direction:column; gap:2px; text-align:left; }

        .em-back-hl { font-size:11px; color:#333; }
        .em-back-shop { font-size:12px; color:#111; }
        .em-back-sub { font-size:10px; color:#555; }
        .em-back-cta { font-size:9px; color:#777; }
        .em-back-url { font-size:10px; color:#1a6b50; font-weight:600; }

        /* Envelope 1 back: centered text */
        .em-back-centered {
          flex:1;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          gap:6px;
          padding:16px;
          margin:8px;
          text-align:center;
          border:2px dashed #f59e0b;
          border-radius:4px;
          background:rgba(245,158,11,0.04);
        }

        /* ── Flap indicators ── */
        .em-flap-front {
          position:absolute; top:0; left:0; right:0; height:6px;
          border-bottom:2px dashed #bbb;
          background:repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 12px);
          z-index:5;
        }
        .em-flap-label {
          position:absolute; top:8px; right:12px;
          font-size:9px; color:#aaa; font-style:italic;
          letter-spacing:0.03em;
        }
        .em-flap-back {
          position:absolute; top:-50px; left:0; right:0; height:50px;
          pointer-events:none; z-index:5;
        }
        .em-flap-label-back {
          position:absolute; top:8px; left:50%; transform:translateX(-50%);
          font-size:9px; color:#aaa; font-style:italic;
          letter-spacing:0.03em; white-space:nowrap;
        }

        /* ── Inline margin inputs ── */
        .em-inp {
          display:inline-flex; align-items:center; gap:2px;
          background:#fff; border:1px solid #e74c3c; border-radius:4px;
          padding:1px 4px; box-shadow:0 1px 3px rgba(0,0,0,0.1);
          position:relative; z-index:10;
        }
        .em-inp input {
          width:48px; border:none; outline:none; font-size:12px; font-family:monospace;
          text-align:right; padding:2px 0; background:transparent; color:#e74c3c; font-weight:600;
        }
        .em-inp input:focus { color:#222; }
        .em-inp input::-webkit-inner-spin-button { opacity:1; }
        .em-inp span { font-size:10px; color:#999; }
      `}</style>
    </div>
  );
}
