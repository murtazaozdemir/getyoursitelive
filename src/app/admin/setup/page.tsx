"use client";

import { useState } from "react";
import Link from "next/link";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [result, setResult] = useState<{ uploaded: number; total: number; failed: { key: string; error: string }[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSeed() {
    setStatus("running");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/seed-blob", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error ?? "Unknown error");
        return;
      }

      setResult(json);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(String(err));
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin" className="admin-back-link">← Admin</Link>
          </p>
          <h1 className="admin-h1">Setup</h1>
          <p className="admin-lede">
            One-time tools for initializing production storage.
          </p>
        </div>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Seed Blob storage</h2>
        <p className="admin-section-lede">
          Copies all businesses and prospects from the deployment files into
          Vercel Blob storage. Run this once after the first deploy, or any
          time you need to restore from the repo. Existing data is overwritten.
        </p>

        {status === "idle" && (
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSeed}
          >
            Seed Blob from deployment files
          </button>
        )}

        {status === "running" && (
          <p className="admin-lede" style={{ color: "var(--admin-text-soft)" }}>
            Uploading… this may take 10–20 seconds for 90+ files.
          </p>
        )}

        {status === "done" && result && (
          <div>
            <p className="admin-lede" style={{ color: "var(--color-success, green)", fontWeight: 600 }}>
              ✓ Done — {result.uploaded} of {result.total} files uploaded to Blob.
            </p>
            {result.failed.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer", color: "var(--admin-text-soft)" }}>
                  {result.failed.length} failed
                </summary>
                <ul style={{ marginTop: 8, fontSize: 13 }}>
                  {result.failed.map((f) => (
                    <li key={f.key}>
                      <code>{f.key}</code> — {f.error}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            <p style={{ marginTop: 16 }}>
              <Link href="/admin" className="admin-btn admin-btn--ghost">
                Go to Sites →
              </Link>
              {" "}
              <Link href="/admin/prospects" className="admin-btn admin-btn--ghost">
                Go to Prospects →
              </Link>
            </p>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="admin-lede" style={{ color: "var(--color-error, red)" }}>
              ✗ Error: {errorMsg}
            </p>
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={() => setStatus("idle")}
            >
              Try again
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
