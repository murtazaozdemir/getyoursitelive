import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export const runtime = "edge";

export default async function TasksPage() {
  const logs: string[] = [];
  logs.push("[1] TasksPage start");

  try {
    logs.push("[2] Getting current user...");
    const user = await getCurrentUser();
    logs.push(`[3] user=${user ? user.email : "null"}`);

    if (!user || !canManageBusinesses(user)) {
      logs.push("[4] Unauthorized, redirecting");
      redirect("/admin/login");
    }
    logs.push("[5] Authorized");

    logs.push("[6] Importing @/lib/tasks...");
    const { listTasks } = await import("@/lib/tasks");
    logs.push("[7] Import succeeded");

    logs.push("[8] Calling listTasks()...");
    const tasks = await listTasks();
    logs.push(`[9] listTasks returned ${tasks.length} tasks`);

    logs.push("[10] Filtering tasks...");
    const activeTasks = tasks.filter((t) => t.status === "active");
    const completedTasks = tasks.filter((t) => t.status === "completed");
    logs.push(`[11] active=${activeTasks.length} completed=${completedTasks.length}`);

    return (
      <>
        <div className="admin-page-header">
          <h1>Tasks (debug)</h1>
        </div>
        <details open style={{ marginBottom: 16, background: "#f5f5f0", padding: 12, borderRadius: 6 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Debug log ({logs.length} lines)</summary>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: 11, marginTop: 8, color: "#333" }}>{logs.join("\n")}</pre>
        </details>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>
          {JSON.stringify(tasks, null, 2)}
        </pre>
        <p style={{ marginTop: 16 }}>
          <Link href="/admin/leads" className="admin-link">Back to Leads</Link>
        </p>
      </>
    );
  } catch (err) {
    const errMsg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);

    // Next.js redirect() throws a special error — let it through
    if (errMsg.includes("NEXT_REDIRECT")) throw err;

    logs.push(`[ERROR] ${errMsg}`);
    return (
      <div style={{ padding: 24 }}>
        <h1 style={{ color: "red" }}>Tasks — Crash</h1>
        <h3>Log trace:</h3>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, background: "#fff3f3", padding: 12, borderRadius: 6 }}>
          {logs.join("\n")}
        </pre>
        <h3 style={{ marginTop: 16 }}>Error:</h3>
        <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "red" }}>{errMsg}</pre>
      </div>
    );
  }
}
