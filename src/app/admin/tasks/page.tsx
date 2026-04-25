import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { listTasks } from "@/lib/tasks";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) redirect("/admin/login");

  const tasks = await listTasks();

  return (
    <>
      <div className="admin-page-header">
        <h1>Tasks</h1>
      </div>

      {tasks.length === 0 ? (
        <div className="admin-empty-state">
          <p>No tasks yet.</p>
          <p>Select leads from the <Link href="/admin/leads">Leads</Link> page and click &ldquo;Create task&rdquo; to get started.</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => {
            const remaining = task.totalItems - task.droppedOffCount;
            const pct = task.totalItems > 0 ? Math.round((task.droppedOffCount / task.totalItems) * 100) : 0;
            return (
              <Link key={task.id} href={`/admin/tasks/${task.id}`} className="task-card">
                <div className="task-card-top">
                  <h3 className="task-card-name">{task.name}</h3>
                  <span className={`task-status-badge task-status-badge--${task.status}`}>
                    {task.status}
                  </span>
                </div>
                <div className="task-progress-bar">
                  <div className="task-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="task-card-meta">
                  <span>{task.droppedOffCount} of {task.totalItems} dropped off</span>
                  <span>{remaining} remaining</span>
                </div>
                <div className="task-card-footer">
                  <span>{task.createdByName}</span>
                  <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
