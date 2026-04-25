import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { listTasks } from "@/lib/tasks";

export const runtime = "edge";

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) redirect("/admin/login");

  const tasks = await listTasks();
  const activeTasks = tasks.filter((t) => t.status === "active");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <>
      <div className="admin-page-header">
        <h1>Tasks</h1>
        <p className="admin-page-subtitle">
          Sales tasks for tracking proposal drop-offs
        </p>
      </div>

      {tasks.length === 0 && (
        <div className="admin-empty-state">
          <p>No tasks yet.</p>
          <p className="admin-empty-hint">
            Select leads on the{" "}
            <Link href="/admin/leads" className="admin-link">
              Leads page
            </Link>{" "}
            and click &ldquo;Create task&rdquo; to start.
          </p>
        </div>
      )}

      {activeTasks.length > 0 && (
        <section>
          <h2 className="task-section-title">Active</h2>
          <div className="task-list">
            {activeTasks.map((t) => {
              const remaining = t.totalItems - t.droppedOffCount;
              return (
                <Link
                  key={t.id}
                  href={`/admin/tasks/${t.id}`}
                  className="task-card"
                >
                  <div className="task-card-main">
                    <h3 className="task-card-name">{t.name}</h3>
                    <p className="task-card-meta">
                      {t.createdByName} &middot;{" "}
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="task-card-progress">
                    <span className="task-card-count">
                      {remaining} of {t.totalItems} remaining
                    </span>
                    <div className="task-progress-bar">
                      <div
                        className="task-progress-fill"
                        style={{
                          width: t.totalItems > 0
                            ? `${(t.droppedOffCount / t.totalItems) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {completedTasks.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 className="task-section-title">Completed</h2>
          <div className="task-list">
            {completedTasks.map((t) => (
              <Link
                key={t.id}
                href={`/admin/tasks/${t.id}`}
                className="task-card task-card--completed"
              >
                <div className="task-card-main">
                  <h3 className="task-card-name">{t.name}</h3>
                  <p className="task-card-meta">
                    {t.createdByName} &middot;{" "}
                    {new Date(t.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="task-card-progress">
                  <span className="task-card-count">
                    {t.droppedOffCount} / {t.totalItems} dropped off
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
