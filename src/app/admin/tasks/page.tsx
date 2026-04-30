import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, isDeveloper } from "@/lib/users";
import { listTasks } from "@/lib/tasks";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) redirect("/admin/login");

  // Developers see all tasks; regular admins see only their own
  const tasks = await listTasks(isDeveloper(user) ? undefined : user.id);

  return (
    <>
      <div className="admin-page-header">
        <h1>Tasks</h1>
      </div>

      {tasks.length === 0 ? (
        <div className="admin-empty-state">
          <p>No tasks yet.</p>
          <p>
            Select leads from the <Link href="/admin/leads">Leads</Link> page
            and click &ldquo;Create task&rdquo; to get started.
          </p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => {
            const remaining = task.totalItems - task.droppedOffCount;
            const pct =
              task.totalItems > 0
                ? Math.round((task.droppedOffCount / task.totalItems) * 100)
                : 0;
            return (
              <Link
                key={task.id}
                href={`/admin/tasks/${task.id}`}
                className={`task-card${task.status === "completed" ? " task-card--completed" : ""}`}
              >
                <div className="task-card-main">
                  <div className="task-card-name">
                    {task.name}
                    <span
                      className={`task-status-badge task-status-badge--${task.status}`}
                    >
                      {task.status === "active" ? "Active" : "Completed"}
                    </span>
                  </div>
                  <div className="task-card-meta">
                    {task.createdByName} &middot;{" "}
                    {new Date(task.createdAt).toLocaleDateString()}
                    {" · "}
                    {remaining} remaining
                  </div>
                </div>
                <div className="task-card-progress">
                  <span className="task-card-count">
                    {task.droppedOffCount}/{task.totalItems}
                  </span>
                  <div className="task-progress-bar">
                    <div
                      className="task-progress-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
