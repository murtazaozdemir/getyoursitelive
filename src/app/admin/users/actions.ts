"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "@/lib/session";
import { createUser, deleteUser, canManageBusinesses, type UserRole } from "@/lib/users";
import { getBusinessBySlug } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function deleteUserAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };
  if (user.id === id) return { ok: false, error: "You cannot delete your own account." };

  await deleteUser(id);
  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_user", detail: id });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function createUserAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
  if (!user || !canManageBusinesses(user)) {
    return { ok: false, error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const role = (formData.get("role") as string) as UserRole;
  const ownedSlug = (formData.get("ownedSlug") as string)?.trim() || null;

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "A valid email is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (role !== "admin" && role !== "owner") return { ok: false, error: "Role must be admin or owner." };
  if (role === "owner" && !ownedSlug) return { ok: false, error: "Owners must have an owned slug." };
  if (role === "owner" && ownedSlug) {
    const biz = await getBusinessBySlug(ownedSlug);
    if (!biz) return { ok: false, error: `No business found with slug "${ownedSlug}".` };
  }

  try {
    await createUser({ name, email, password, role, ownedSlug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    return { ok: false, error: msg };
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "create_user", detail: `${email} (${role})` });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
