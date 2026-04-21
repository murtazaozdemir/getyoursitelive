"use server";

import { requireUser } from "@/lib/session";
import { verifyCredentials, updateUserEmail, updateUserPassword } from "@/lib/users";

export async function changeEmailAction(
  newEmail: string,
): Promise<{ ok: boolean; error?: string }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "A valid email is required." };
  }

  try {
    await updateUserEmail(user.id, trimmed);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to update email.";
    return { ok: false, error: msg };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, error: "Unauthorized" };
  }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }

  const verified = await verifyCredentials(user.email, currentPassword);
  if (!verified) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await updateUserPassword(user.id, newPassword);
  return { ok: true };
}
