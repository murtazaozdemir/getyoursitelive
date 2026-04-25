import Link from "next/link";
import { redirect } from "next/navigation";

export const runtime = "edge";

export default async function TasksPage() {
  const L: string[] = [];
  const log = (msg: string) => { L.push(`[${new Date().toISOString()}] ${msg}`); console.log(msg); };

  log("STEP 1: TasksPage function entered");

  // ── Auth ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any;
  try {
    log("STEP 2: importing @/lib/session...");
    const sessionMod = await import("@/lib/session");
    log("STEP 3: session module loaded OK");
    log("STEP 4: calling getCurrentUser()...");
    user = await sessionMod.getCurrentUser();
    log(`STEP 5: getCurrentUser returned: ${user ? user.email : "null"}`);
  } catch (e) {
    log(`STEP 2-5 CRASHED: ${e instanceof Error ? e.message : String(e)}`);
    return <DebugDump logs={L} error={e} />;
  }

  try {
    log("STEP 6: importing @/lib/users...");
    const usersMod = await import("@/lib/users");
    log("STEP 7: users module loaded OK");
    log("STEP 8: calling canManageBusinesses()...");
    const allowed = user ? usersMod.canManageBusinesses(user) : false;
    log(`STEP 9: canManageBusinesses = ${allowed}`);
    if (!user || !allowed) {
      log("STEP 10: Not authorized, redirecting to /admin/login");
      redirect("/admin/login");
    }
  } catch (e) {
    // redirect() throws a special NEXT_REDIRECT error — rethrow it
    if (e && typeof e === "object" && "digest" in e) throw e;
    log(`STEP 6-10 CRASHED: ${e instanceof Error ? e.message : String(e)}`);
    return <DebugDump logs={L} error={e} />;
  }

  // ── Data ──────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tasks: any;
  try {
    log("STEP 11: importing @/lib/tasks...");
    const tasksMod = await import("@/lib/tasks");
    log("STEP 12: tasks module loaded OK");
    log("STEP 13: calling listTasks()...");
    tasks = await tasksMod.listTasks();
    log(`STEP 14: listTasks() returned ${tasks.length} rows`);
    if (tasks.length > 0) {
      log(`STEP 15: first task = ${JSON.stringify(tasks[0])}`);
    }
  } catch (e) {
    log(`STEP 11-15 CRASHED: ${e instanceof Error ? e.message + "\n" + e.stack : String(e)}`);
    return <DebugDump logs={L} error={e} />;
  }

  log("STEP 16: All data loaded, rendering page");

  return (
    <>
      <div className="admin-page-header">
        <h1>Tasks (debug mode)</h1>
      </div>

      <details open style={{ marginBottom: 20, background: "#f5f5f0", padding: 16, borderRadius: 8, border: "1px solid #ddd" }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          Debug Log — {L.length} steps — ALL PASSED
        </summary>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, marginTop: 8, lineHeight: 1.6 }}>{L.join("\n")}</pre>
      </details>

      <h3>Raw data ({tasks.length} tasks):</h3>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, background: "#fff", padding: 12, border: "1px solid #ddd", borderRadius: 6, maxHeight: 400, overflow: "auto" }}>
        {JSON.stringify(tasks, null, 2)}
      </pre>

      <p style={{ marginTop: 16 }}>
        <Link href="/admin/leads">← Back to Leads</Link>
      </p>
    </>
  );
}

function DebugDump({ logs, error }: { logs: string[]; error: unknown }) {
  const errStr = error instanceof Error
    ? `${error.name}: ${error.message}\n\nStack:\n${error.stack}`
    : String(error);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ color: "red", fontSize: 22 }}>Tasks — CRASHED</h1>

      <h3 style={{ marginTop: 16 }}>Log trace (last step = where it died):</h3>
      <pre style={{
        whiteSpace: "pre-wrap", fontSize: 12, background: "#f0fff0",
        padding: 16, borderRadius: 8, border: "1px solid #ccc", lineHeight: 1.6,
      }}>
        {logs.join("\n")}
      </pre>

      <h3 style={{ marginTop: 16 }}>Error detail:</h3>
      <pre style={{
        whiteSpace: "pre-wrap", fontSize: 12, background: "#fff3f3",
        padding: 16, borderRadius: 8, border: "1px solid #e88", color: "#900",
      }}>
        {errStr}
      </pre>
    </div>
  );
}
