"use server";

import { requireUser } from "@/lib/session";
import { verifyCredentials, updateUserEmail, updateUserPassword, updateUserProfile } from "@/lib/users";

export async function changeEmailAction(
  newEmail: string,
): Promise<{ ok: boolean; error?: string }> {
  console.log("[change-email] entry");
  let user;
  try {
    user = await requireUser();
  } catch {
    console.log("[change-email] unauthenticated");
    return { ok: false, error: "Unauthorized" };
  }
  console.log(`[change-email] user=${user.email}`);

  const trimmed = newEmail.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) {
    return { ok: false, error: "A valid email is required." };
  }

  try {
    await updateUserEmail(user.id, trimmed);
    console.log(`[change-email] success userId=${user.id} newEmail=${trimmed}`);
    return { ok: true };
  } catch (err) {
    console.error(`[change-email] failed userId=${user.id}`, err instanceof Error ? err.message : err);
    const msg = err instanceof Error ? err.message : "Failed to update email.";
    return { ok: false, error: msg };
  }
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  console.log("[change-password] entry");
  let user;
  try {
    user = await requireUser();
  } catch {
    console.log("[change-password] unauthenticated");
    return { ok: false, error: "Unauthorized" };
  }
  console.log(`[change-password] user=${user.email}`);

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "New password must be at least 8 characters." };
  }

  const verified = await verifyCredentials(user.email, currentPassword);
  if (!verified) {
    console.log(`[change-password] incorrect current password user=${user.email}`);
    return { ok: false, error: "Current password is incorrect." };
  }

  await updateUserPassword(user.id, newPassword);
  console.log(`[change-password] success userId=${user.id}`);
  return { ok: true };
}

export async function updateProfileAction(fields: {
  firstName: string;
  lastName: string;
  phone?: string;
  street?: string;
  city?: string;
  zip?: string;
  state?: string;
  wifiIp?: string;
  mobileIp?: string;
  company?: string;
}): Promise<{ ok: boolean; error?: string }> {
  console.log("[update-profile] entry");
  let user;
  try {
    user = await requireUser();
  } catch {
    console.log("[update-profile] unauthenticated");
    return { ok: false, error: "Unauthorized" };
  }
  console.log(`[update-profile] user=${user.email}`);

  if (!fields.firstName.trim()) {
    return { ok: false, error: "First name is required." };
  }

  try {
    await updateUserProfile(user.id, fields);
    console.log(`[update-profile] success userId=${user.id}`);
    return { ok: true };
  } catch (err) {
    console.error(`[update-profile] failed userId=${user.id}`, err instanceof Error ? err.message : err);
    const msg = err instanceof Error ? err.message : "Failed to update profile.";
    return { ok: false, error: msg };
  }
}
