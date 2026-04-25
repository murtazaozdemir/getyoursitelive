import { getD1 } from "@/lib/db-d1";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------

export type TaskStatus = "active" | "completed";
export type TaskItemStatus = "pending" | "dropped_off";

export interface Task {
  id: string;
  name: string;
  createdBy: string;
  createdByName: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  taskId: string;
  prospectSlug: string;
  status: TaskItemStatus;
  notes: string;
  sortOrder: number;
  updatedAt: string;
}

export interface TaskWithCounts extends Task {
  totalItems: number;
  droppedOffCount: number;
}

export interface TaskItemWithProspect extends TaskItem {
  prospectName: string;
  prospectPhone: string;
  prospectAddress: string;
  prospectLat?: number | null;
  prospectLng?: number | null;
}

// ---------------------------------------------------------------
// Row types
// ---------------------------------------------------------------

interface TaskRow {
  id: string;
  name: string;
  created_by: string;
  created_by_name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TaskWithCountsRow extends TaskRow {
  total_items: number;
  dropped_off_count: number;
}

interface TaskItemRow {
  id: string;
  task_id: string;
  prospect_slug: string;
  status: string;
  notes: string;
  sort_order: number;
  updated_at: string;
}

interface TaskItemWithProspectRow extends TaskItemRow {
  prospect_name: string;
  prospect_phone: string;
  prospect_address: string;
  prospect_lat: number | null;
  prospect_lng: number | null;
}

// ---------------------------------------------------------------
// Converters
// ---------------------------------------------------------------

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    status: row.status as TaskStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToTaskWithCounts(row: TaskWithCountsRow): TaskWithCounts {
  return {
    ...rowToTask(row),
    totalItems: row.total_items,
    droppedOffCount: row.dropped_off_count,
  };
}

function rowToTaskItem(row: TaskItemRow): TaskItem {
  return {
    id: row.id,
    taskId: row.task_id,
    prospectSlug: row.prospect_slug,
    status: row.status as TaskItemStatus,
    notes: row.notes,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

function rowToTaskItemWithProspect(row: TaskItemWithProspectRow): TaskItemWithProspect {
  return {
    ...rowToTaskItem(row),
    prospectName: row.prospect_name,
    prospectPhone: row.prospect_phone,
    prospectAddress: row.prospect_address,
    prospectLat: row.prospect_lat,
    prospectLng: row.prospect_lng,
  };
}

// ---------------------------------------------------------------
// Queries
// ---------------------------------------------------------------

export async function listTasks(): Promise<TaskWithCounts[]> {
  const db = await getD1();
  const { results } = await db
    .prepare(
      `SELECT t.*,
        COALESCE(COUNT(ti.id), 0) as total_items,
        COALESCE(SUM(CASE WHEN ti.status = 'dropped_off' THEN 1 ELSE 0 END), 0) as dropped_off_count
       FROM tasks t
       LEFT JOIN task_items ti ON ti.task_id = t.id
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
    )
    .all<TaskWithCountsRow>();
  return results.map(rowToTaskWithCounts);
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .bind(id)
    .first<TaskRow>();
  return row ? rowToTask(row) : null;
}

export async function getTaskItems(taskId: string): Promise<TaskItemWithProspect[]> {
  const db = await getD1();
  const { results } = await db
    .prepare(
      `SELECT ti.*, p.name as prospect_name, p.phone as prospect_phone,
              p.address as prospect_address, p.lat as prospect_lat, p.lng as prospect_lng
       FROM task_items ti
       LEFT JOIN prospects p ON p.slug = ti.prospect_slug
       WHERE ti.task_id = ?
       ORDER BY ti.sort_order ASC`,
    )
    .bind(taskId)
    .all<TaskItemWithProspectRow>();
  return results.map(rowToTaskItemWithProspect);
}

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export async function createTask(
  task: { id: string; name: string; createdBy: string; createdByName: string },
  prospectSlugs: string[],
): Promise<void> {
  const db = await getD1();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO tasks (id, name, created_by, created_by_name, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'active', ?, ?)`,
    )
    .bind(task.id, task.name, task.createdBy, task.createdByName, now, now)
    .run();

  // Insert task items
  for (let i = 0; i < prospectSlugs.length; i++) {
    const itemId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO task_items (id, task_id, prospect_slug, status, notes, sort_order, updated_at)
         VALUES (?, ?, ?, 'pending', '', ?, ?)`,
      )
      .bind(itemId, task.id, prospectSlugs[i], i, now)
      .run();
  }
}

export async function updateTaskName(id: string, name: string): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE tasks SET name = ?, updated_at = ? WHERE id = ?")
    .bind(name, new Date().toISOString(), id)
    .run();
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), id)
    .run();
}

export async function updateTaskItemStatus(itemId: string, status: TaskItemStatus): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE task_items SET status = ?, updated_at = ? WHERE id = ?")
    .bind(status, new Date().toISOString(), itemId)
    .run();
}

export async function updateTaskItemNotes(itemId: string, notes: string): Promise<void> {
  const db = await getD1();
  await db
    .prepare("UPDATE task_items SET notes = ?, updated_at = ? WHERE id = ?")
    .bind(notes, new Date().toISOString(), itemId)
    .run();
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getD1();
  await db.prepare("DELETE FROM task_items WHERE task_id = ?").bind(id).run();
  await db.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
}
