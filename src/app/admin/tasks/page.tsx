export const runtime = "edge";

export default function TasksPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Tasks — Smoke Test</h1>
      <p>If you see this, the route works. Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
