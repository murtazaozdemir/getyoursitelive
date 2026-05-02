"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, getCurrentUser } from "@/lib/session";
import { createUser, deleteUser, canManageBusinesses, findUserByEmail, type UserRole } from "@/lib/users";
import { getBusinessBySlug } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import { createInvitation, revokeInvitation } from "@/lib/invitations";
import { sendAdminInviteEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export async function resendInviteAction(
  email: string,
  role: string,
  ownedSlug: string | null,
): Promise<{ ok: boolean; error?: string }> {
  console.log(`[resend-invite] entry email=${email} role=${role}`);
  const currentUser = await requireUser();
  if (!canManageBusinesses(currentUser)) {
    console.log(`[resend-invite] forbidden user=${currentUser.email}`);
    return { ok: false, error: "Unauthorized" };
  }

  const invite = await createInvitation({
    email: email.trim().toLowerCase(),
    role: role as UserRole,
    ownedSlug,
    invitedBy: currentUser.email,
  });

  const inviteUrl = `${SITE_URL}/admin/invite/${invite.token}`;
  await sendAdminInviteEmail({ to: email, inviteUrl, invitedBy: currentUser.name, role });
  await logAudit({ userEmail: currentUser.email, userName: currentUser.name, action: "resend_invite", detail: email });
  revalidatePath("/developer/users");
  console.log(`[resend-invite] success email=${email} user=${currentUser.email}`);
  return { ok: true };
}

export async function revokeInviteAction(token: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[revoke-invite] entry tokenPrefix=${token.slice(0, 8)}`);
  const user = await requireUser();
  if (!canManageBusinesses(user)) {
    console.log(`[revoke-invite] forbidden user=${user.email}`);
    return { ok: false, error: "Unauthorized" };
  }
  await revokeInvitation(token);
  await logAudit({ userEmail: user.email, userName: user.name, action: "revoke_invite", detail: token.slice(0, 8) });
  revalidatePath("/developer/users");
  console.log(`[revoke-invite] success user=${user.email}`);
  return { ok: true };
}

export async function deleteUserAction(id: string): Promise<{ ok: boolean; error?: string }> {
  console.log(`[delete-user] entry userId=${id}`);
  const user = await requireUser();
  if (!canManageBusinesses(user)) {
    console.log(`[delete-user] forbidden user=${user.email}`);
    return { ok: false, error: "Unauthorized" };
  }
  if (user.id === id) {
    console.log(`[delete-user] self-delete blocked user=${user.email}`);
    return { ok: false, error: "You cannot delete your own account." };
  }

  await deleteUser(id);
  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_user", detail: id });
  revalidatePath("/developer/users");
  console.log(`[delete-user] success userId=${id} user=${user.email}`);
  return { ok: true };
}

export async function sendInviteAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; inviteUrl?: string }> {
  console.log("[send-invite] entry");
  let currentUser;
  try {
    currentUser = await getCurrentUser();
  } catch {
    console.log("[send-invite] unauthenticated");
    return { ok: false, error: "Unauthorized" };
  }
  if (!currentUser || !canManageBusinesses(currentUser)) {
    console.log("[send-invite] forbidden");
    return { ok: false, error: "Unauthorized" };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const role = (formData.get("role") as string) as UserRole;
  const ownedSlug = (formData.get("ownedSlug") as string)?.trim() || null;
  console.log(`[send-invite] email=${email} role=${role} ownedSlug=${ownedSlug} user=${currentUser.email}`);

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
    console.log(`[send-invite] email already exists email=${email}`);
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

  console.log(`[send-invite] success email=${email} role=${role}`);
  return { ok: true, inviteUrl };
}

// Kept for backwards compatibility — direct account creation (used internally)
export async function createUserAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  console.log("[create-user] entry");
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    console.log("[create-user] unauthenticated");
    return { ok: false, error: "Unauthorized" };
  }
  if (!user || !canManageBusinesses(user)) {
    console.log("[create-user] forbidden");
    return { ok: false, error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) ?? "";
  const role = (formData.get("role") as string) as UserRole;
  const ownedSlug = (formData.get("ownedSlug") as string)?.trim() || null;
  console.log(`[create-user] email=${email} role=${role} ownedSlug=${ownedSlug} by=${user.email}`);

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
    console.log(`[create-user] user created email=${email} role=${role}`);
  } catch (err) {
    console.error(`[create-user] failed email=${email}`, err instanceof Error ? err.message : err);
    const msg = err instanceof Error ? err.message : "Failed to create user.";
    return { ok: false, error: msg };
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "create_user", detail: `${email} (${role})` });
  revalidatePath("/developer/users");
  console.log(`[create-user] success email=${email}`);
  redirect("/developer/users");
}
