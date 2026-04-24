"use client";

export const runtime = "edge";

import { useState } from "react";
import Link from "next/link";

// ── DB info section ──────────────────────────────────────────────────────────

function DbInfoSection() {
  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Database</h2>
      <p className="admin-section-lede">
        Data is stored in Cloudflare D1 (SQLite). To seed or inspect the database,
        use <code>wrangler d1</code> from the project root:
      </p>
      <pre style={{ fontSize: 12, background: "var(--admin-bg-alt, #f5f5f5)", padding: "10px 14px", borderRadius: 6, overflowX: "auto", marginTop: 8 }}>
{`# Apply schema
npx wrangler d1 execute getyoursitelive-db --file=db/schema.sql

# Seed users / businesses
npx wrangler d1 execute getyoursitelive-db --file=db/seed.sql`}
      </pre>
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
      const json = await res.json() as { error?: string; updated?: number; skipped?: number; log?: string[] };
      if (!res.ok) { setStatus("error"); setErrorMsg(json.error ?? "Unknown error"); return; }
      setResult({ updated: json.updated ?? 0, skipped: json.skipped ?? 0, log: json.log ?? [] });
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
        run it once here. Runs against live D1 data.
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
          <p className="admin-lede">Data migrations and database tools.</p>
        </div>
      </div>

      <MigrationsSection />
      <DbInfoSection />
    </div>
  );
}
