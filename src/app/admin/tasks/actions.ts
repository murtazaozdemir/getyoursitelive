"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { logAudit } from "@/lib/audit-log";
import {
  createTask,
  updateTaskName,
  updateTaskStatus,
  updateTaskItemStatus,
  updateTaskItemNotes,
  deleteTask,
} from "@/lib/tasks";

export async function createTaskAction(slugs: string[]): Promise<string> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  if (slugs.length === 0) throw new Error("No leads selected");

  const id = crypto.randomUUID();
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const name = `Task - ${today}`;

  await createTask(
    { id, name, createdBy: user.email, createdByName: user.name },
    slugs,
  );

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_task",
    detail: `Created task "${name}" with ${slugs.length} leads`,
  });

  revalidatePath("/admin/tasks");
  return id;
}

export async function renameTaskAction(taskId: string, name: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskName(taskId, name.trim());
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function completeTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskStatus(taskId, "completed");

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "complete_task",
    detail: `Completed task ${taskId}`,
  });

  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function reopenTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskStatus(taskId, "active");
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function toggleItemDroppedOffAction(itemId: string, droppedOff: boolean) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskItemStatus(itemId, droppedOff ? "dropped_off" : "pending");
}

export async function saveItemNotesAction(itemId: string, notes: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskItemNotes(itemId, notes);
}

export async function deleteTaskAction(taskId: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await deleteTask(taskId);

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "delete_task",
    detail: `Deleted task ${taskId}`,
  });

  revalidatePath("/admin/tasks");
  redirect("/admin/tasks");
}
