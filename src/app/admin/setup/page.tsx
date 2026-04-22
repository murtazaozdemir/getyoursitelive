"use client";

import { useState } from "react";
import Link from "next/link";

// ── Seed section ──────────────────────────────────────────────────────────────

function SeedSection() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<{ uploaded: number; total: number; failed: { key: string; error: string }[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSeed() {
    setStatus("running");
    try {
      const res = await fetch("/api/admin/seed-blob", { method: "POST" });
      const json = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(json.error ?? "Unknown error"); return; }
      setResult(json);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(String(err));
    }
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Seed Blob storage</h2>
      <p className="admin-section-lede">
        One-time restore: copies businesses and prospects from the deployment
        files into Vercel Blob. Use after a fresh deploy if data is missing.
        With hybrid storage active this is rarely needed.
      </p>

      {status === "idle" && (
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSeed}>
          Seed Blob from deployment files
        </button>
      )}
      {status === "running" && (
        <p className="admin-lede" style={{ color: "var(--admin-text-soft)" }}>
          Uploading… 10–20 seconds for 90+ files.
        </p>
      )}
      {status === "done" && result && (
        <div>
          <p className="admin-lede" style={{ fontWeight: 600 }}>
            ✓ {result.uploaded} of {result.total} files uploaded.
          </p>
          {result.failed.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--admin-text-soft)" }}>
                {result.failed.length} failed
              </summary>
              <ul style={{ marginTop: 6, fontSize: 13 }}>
                {result.failed.map((f) => (
                  <li key={f.key}><code>{f.key}</code> — {f.error}</li>
                ))}
              </ul>
            </details>
          )}
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <Link href="/admin" className="admin-btn admin-btn--ghost">Sites →</Link>
            <Link href="/admin/prospects" className="admin-btn admin-btn--ghost">Prospects →</Link>
          </div>
        </div>
      )}
      {status === "error" && (
        <div>
          <p className="admin-lede" style={{ color: "var(--color-error, red)" }}>✗ {errorMsg}</p>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setStatus("idle")}>
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

// ── Migration section ─────────────────────────────────────────────────────────

function MigrationsSection() {
  const [migration, setMigration] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<{ updated: number; skipped: number; log: string[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleRun() {
    if (!migration.trim()) return;
    setStatus("running");
    setResult(null);
    try {
      const res = await fetch("/api/admin/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ migration: migration.trim() }),
      });
      const json = await res.json();
      if (!res.ok) { setStatus("error"); setErrorMsg(json.error ?? "Unknown error"); return; }
      setResult(json);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(String(err));
    }
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Run a data migration</h2>
      <p className="admin-section-lede">
        Bulk operations that modify existing production data live here — not in
        local scripts. Claude adds a migration function to{" "}
        <code>src/app/api/admin/migrate/route.ts</code>, deploys it, and you
        run it once here. Runs against live Blob data, so it always sees the
        current state regardless of what local files say.
      </p>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="text"
          className="admin-input"
          placeholder="migration name, e.g. ensure-category"
          value={migration}
          onChange={(e) => setMigration(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRun()}
          style={{ minWidth: 280 }}
          disabled={status === "running"}
        />
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleRun}
          disabled={!migration.trim() || status === "running"}
        >
          {status === "running" ? "Running…" : "Run migration"}
        </button>
      </div>

      {status === "done" && result && (
        <div style={{ marginTop: 14 }}>
          <p className="admin-lede" style={{ fontWeight: 600 }}>
            ✓ {result.updated} updated, {result.skipped} skipped.
          </p>
          {result.log.length > 0 && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 13, color: "var(--admin-text-soft)" }}>
                Full log ({result.log.length} entries)
              </summary>
              <ul style={{ marginTop: 6, fontSize: 12, fontFamily: "monospace", lineHeight: 1.6 }}>
                {result.log.map((line, i) => <li key={i}>{line}</li>)}
              </ul>
            </details>
          )}
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            style={{ marginTop: 12 }}
            onClick={() => { setStatus("idle"); setMigration(""); setResult(null); }}
          >
            Run another
          </button>
        </div>
      )}
      {status === "error" && (
        <div style={{ marginTop: 12 }}>
          <p className="admin-lede" style={{ color: "var(--color-error, red)" }}>✗ {errorMsg}</p>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setStatus("idle")}>
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin" className="admin-back-link">← Admin</Link>
          </p>
          <h1 className="admin-h1">Setup</h1>
          <p className="admin-lede">Storage tools and data migrations.</p>
        </div>
      </div>

      <MigrationsSection />
      <SeedSection />
    </div>
  );
}
