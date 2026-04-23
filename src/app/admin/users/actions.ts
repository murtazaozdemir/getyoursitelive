"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "@/lib/session";
import { createUser, deleteUser, canManageBusinesses, findUserByEmail, type UserRole } from "@/lib/users";
import { getBusinessBySlug } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { createInvitation, revokeInvitation } from "@/lib/invitations";
import { sendAdminInviteEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function revokeInviteAction(token: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };
  await revokeInvitation(token);
  await logAudit({ userEmail: user.email, userName: user.name, action: "revoke_invite", detail: token.slice(0, 8) });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const user = await requireUser();
  if (!canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };
  if (user.id === id) return { ok: false, error: "You cannot delete your own account." };

  await deleteUser(id);
  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_user", detail: id });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function sendInviteAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; inviteUrl?: string }> {
  let currentUser;
  try {
    currentUser = await getCurrentUser();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }
  if (!currentUser || !canManageBusinesses(currentUser)) {
    return { ok: false, error: "Unauthorized" };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) as UserRole;
  const ownedSlug = (formData.get("ownedSlug") as string)?.trim() || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "A valid email address is required." };
  }
  if (role !== "admin" && role !== "owner") {
    return { ok: false, error: "Role must be admin or Business Owner." };
  }
  if (role === "owner" && !ownedSlug) {
    return { ok: false, error: "A business slug is required for Business Owner accounts." };
  }
  if (role === "owner" && ownedSlug) {
    const biz = await getBusinessBySlug(ownedSlug);
    if (!biz) return { ok: false, error: `No business found with slug "${ownedSlug}".` };
  }

  // Don't re-invite someone who already has an account
  const existing = await findUserByEmail(email);
  if (existing) {
    return { ok: false, error: `An account with ${email} already exists.` };
  }

  const invite = await createInvitation({
    email,
    role,
    ownedSlug,
    invitedBy: currentUser.email,
  });

  const inviteUrl = `${SITE_URL}/admin/invite/${invite.token}`;

  await sendAdminInviteEmail({
    to: email,
    inviteUrl,
    invitedBy: currentUser.name,
    role,
  });

  await logAudit({
    userEmail: currentUser.email,
    userName: currentUser.name,
    action: "invite_user",
    detail: `${email} (${role})`,
  });

  return { ok: true, inviteUrl };
}

// Kept for backwards compatibility — direct account creation (used internally)
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
