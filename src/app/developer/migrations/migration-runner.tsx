"use client";

import { useState } from "react";
import { runMigrationAction } from "./actions";
import type { MigrationResult } from "@/lib/migrations";

interface MigrationOption {
  name: string;
  description: string;
}

export function MigrationRunner({ migrations }: { migrations: MigrationOption[] }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<(MigrationResult & { name: string; ranAt: string }) | null>(null);
  const [history, setHistory] = useState<(MigrationResult & { name: string; ranAt: string })[]>([]);

  const selectedMigration = migrations.find((m) => m.name === selected);

  async function handleRun() {
    if (!selected) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await runMigrationAction(selected);
      const entry = { ...res, name: selected, ranAt: new Date().toLocaleTimeString() };
      setResult(entry);
      setHistory((prev) => [entry, ...prev]);
    } catch (err) {
      const entry = {
        updated: 0,
        skipped: 0,
        log: [`ERROR: ${String(err)}`],
        name: selected,
        ranAt: new Date().toLocaleTimeString(),
      };
      setResult(entry);
      setHistory((prev) => [entry, ...prev]);
    } finally {
      setLoading(false);
    }
  }

  const hasError = result?.log.some((l) => l.startsWith("ERROR"));

  return (
    <div>
      {/* Migration selector */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <select
            className="admin-filter-select"
            value={selected}
            onChange={(e) => { setSelected(e.target.value); setResult(null); }}
            style={{ width: "100%", fontSize: 14, padding: "8px 12px" }}
          >
            <option value="">Select a migration...</option>
            {migrations.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
          {selectedMigration && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666" }}>
              {selectedMigration.description}
            </p>
          )}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={handleRun}
          disabled={!selected || loading}
          style={{ whiteSpace: "nowrap" }}
        >
          {loading ? "Running..." : "Run Migration"}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`admin-banner ${hasError ? "admin-banner--warn" : "admin-banner--success"}`}
          style={{ marginBottom: 16 }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {result.name} {hasError ? "- Error" : "- Complete"}
          </div>
          <div style={{ fontSize: 13 }}>
            Updated: {result.updated} | Skipped: {result.skipped}
          </div>
        </div>
      )}

      {/* Log output */}
      {result && result.log.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Log Output</h3>
          <pre
            style={{
              background: "#1a1a2e",
              color: "#e0e0e0",
              padding: 16,
              borderRadius: 8,
              fontSize: 12,
              lineHeight: 1.6,
              maxHeight: 400,
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {result.log.map((line, i) => (
              <div key={i} style={{ color: line.startsWith("ERROR") ? "#ff6b6b" : line.includes("skipped") ? "#ffd93d" : "#6bff6b" }}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      )}

      {/* History */}
      {history.length > 1 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Session History</h3>
          <table className="admin-table" style={{ fontSize: 13 }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Migration</th>
                <th>Updated</th>
                <th>Skipped</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{h.ranAt}</td>
                  <td>{h.name}</td>
                  <td>{h.updated}</td>
                  <td>{h.skipped}</td>
                  <td>{h.log.some((l) => l.startsWith("ERROR")) ? "Error" : "OK"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
