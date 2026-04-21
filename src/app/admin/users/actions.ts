"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "@/lib/session";
import { createUser, deleteUser, canManageBusinesses, type UserRole } from "@/lib/users";

export async function deleteUserAction(id: string): Promise<void> {
  const user = await requireUser();
  if (!canManageBusinesses(user)) throw new Error("Unauthorized");
  if (user.id === id) throw new Error("You cannot delete your own account.");

  await deleteUser(id);
  revalidatePath("/admin/users");
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
  if (!email || !email.includes("@")) return { ok: false, error: "A valid email is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (role !== "admin" && role !== "owner") return { ok: false, error: "Role must be admin or owner." };
  if (role === "owner" && !ownedSlug) return { ok: false, error: "Owners must have an owned slug." };

  try {
    await createUser({ name, email, password, role, ownedSlug });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    return { ok: false, error: msg };
  }

  revalidatePath("/admin/users");
  redirect("/admin/users");
}
