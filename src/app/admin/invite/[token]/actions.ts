"use server";

import { consumeInvitation } from "@/lib/invitations";
import { createUser, findUserByEmail } from "@/lib/users";
import { sendAdminWelcomeEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit-log";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export async function acceptInviteAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const token = (formData.get("token") as string)?.trim();
  const firstName = (formData.get("firstName") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const street = (formData.get("street") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  const zip = (formData.get("zip") as string)?.trim() || null;
  const state = (formData.get("state") as string)?.trim() || null;
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";

  if (!token) return { ok: false, error: "Invalid invitation." };
  if (!firstName) return { ok: false, error: "First name is required." };
  if (!lastName) return { ok: false, error: "Last name is required." };
  if (!phone) return { ok: false, error: "Phone number is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { ok: false, error: "Passwords do not match." };

  const invite = await consumeInvitation(token);
  if (!invite) {
    return { ok: false, error: "This invitation has expired or already been used." };
  }

  // Guard against race condition — token was valid but email already taken
  const existing = await findUserByEmail(invite.email);
  if (existing) {
    return { ok: false, error: "An account with this email already exists." };
  }

  const name = `${firstName} ${lastName}`;

  try {
    await createUser({
      email: invite.email,
      password,
      role: invite.role,
      name,
      ownedSlug: invite.ownedSlug ?? null,
      phone,
      street,
      city,
      zip,
      state,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create account.";
    return { ok: false, error: msg };
  }

  const loginUrl = `${SITE_URL}/admin/login`;

  await sendAdminWelcomeEmail({
    to: invite.email,
    name,
    loginUrl,
    role: invite.role,
  });

  await logAudit({
    userEmail: invite.email,
    userName: name,
    action: "accept_invite",
    detail: `role=${invite.role} phone=${phone}`,
  });

  return { ok: true };
}
