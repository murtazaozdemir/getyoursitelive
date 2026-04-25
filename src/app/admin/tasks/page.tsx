import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export const runtime = "edge";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) redirect("/admin/login");

  let tasksResult: string;
  try {
    const { listTasks } = await import("@/lib/tasks");
    const tasks = await listTasks();
    tasksResult = JSON.stringify(tasks, null, 2);
  } catch (err) {
    tasksResult = `ERROR: ${err instanceof Error ? err.message + "\n" + err.stack : String(err)}`;
  }

  return (
    <>
      <div className="admin-page-header">
        <h1>Tasks (debug)</h1>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", fontSize: 12 }}>{tasksResult}</pre>
      <p style={{ marginTop: 16 }}>
        <Link href="/admin/leads" className="admin-link">Back to Leads</Link>
      </p>
    </>
  );
}
