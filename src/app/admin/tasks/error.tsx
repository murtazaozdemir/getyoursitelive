"use client";

export default function TasksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "red", fontSize: 20 }}>Tasks — error.tsx caught this</h1>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, background: "#fff3f3", padding: 16, borderRadius: 8, marginTop: 12 }}>
        <strong>message:</strong> {error.message}
        {"\n\n"}
        <strong>digest:</strong> {error.digest ?? "none"}
        {"\n\n"}
        <strong>stack:</strong> {error.stack ?? "none"}
        {"\n\n"}
        <strong>name:</strong> {error.name}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
