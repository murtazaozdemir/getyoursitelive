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
  addTaskItems,
  removeTaskItem,
  searchProspectsForTask,
  deleteTask,
  getTaskItemSlug,
  filterUncontactedSlugs,
} from "@/lib/tasks";
import { updateProspect } from "@/lib/prospects";

export async function createTaskAction(allSlugs: string[]): Promise<string> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  if (allSlugs.length === 0) throw new Error("No leads selected");

  const slugs = await filterUncontactedSlugs(allSlugs);
  if (slugs.length === 0) throw new Error("All selected leads have already been contacted");

  const id = crypto.randomUUID();
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const name = `Task - ${today}`;

  await createTask(
    { id, name, createdBy: user.id, createdByName: user.name },
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

export async function toggleItemDroppedOffAction(itemId: string, droppedOff: boolean, contactMethod?: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskItemStatus(itemId, droppedOff ? "dropped_off" : "pending");

  // When marked as reached, move the prospect to "contacted" status
  if (droppedOff) {
    const slug = await getTaskItemSlug(itemId);
    if (slug) {
      await updateProspect(slug, {
        status: "contacted",
        contactedBy: user.email,
        contactedByName: user.name,
        contactedAt: new Date().toISOString(),
        contactMethod: contactMethod || "visit",
      });
    }
  }
}

export async function saveItemNotesAction(itemId: string, notes: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await updateTaskItemNotes(itemId, notes);
}

export async function updateContactMethodAction(itemId: string, contactMethod: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  const slug = await getTaskItemSlug(itemId);
  if (slug) {
    await updateProspect(slug, { contactMethod });
  }
}

export async function bulkUpdateContactMethodAction(itemIds: string[], contactMethod: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  for (const itemId of itemIds) {
    const slug = await getTaskItemSlug(itemId);
    if (slug) {
      await updateProspect(slug, { contactMethod });
    }
  }
}

export async function searchProspectsAction(
  taskId: string,
  query: string,
): Promise<{ slug: string; name: string; address: string; contacted: boolean }[]> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");
  if (query.trim().length < 2) return [];

  return searchProspectsForTask(taskId, query.trim());
}

export async function addItemsAction(taskId: string, allSlugs: string[]) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");
  if (allSlugs.length === 0) return;

  const slugs = await filterUncontactedSlugs(allSlugs);
  if (slugs.length === 0) return;

  await addTaskItems(taskId, slugs);
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
}

export async function removeItemAction(taskId: string, itemId: string) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) throw new Error("UNAUTHORIZED");

  await removeTaskItem(itemId);
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath("/admin/tasks");
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
