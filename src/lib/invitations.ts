import "server-only";
import { getStorage, readJson, writeJson } from "@/lib/storage";
import type { UserRole } from "@/lib/users";

const INVITATIONS_KEY = "invitations.json";
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface Invitation {
  token: string;
  email: string;
  role: UserRole;
  /** Required when role is "owner" */
  ownedSlug?: string | null;
  invitedBy: string; // inviter email
  expiresAt: string; // ISO
  createdAt: string; // ISO
}

async function loadInvitations(): Promise<Invitation[]> {
  const storage = await getStorage();
  const items = await readJson<Invitation[]>(storage, INVITATIONS_KEY);
  return items ?? [];
}

async function saveInvitations(items: Invitation[]): Promise<void> {
  const storage = await getStorage();
  await writeJson(storage, INVITATIONS_KEY, items);
}

export async function listInvitations(): Promise<Invitation[]> {
  const items = await loadInvitations();
  const now = new Date();
  // Return only non-expired invitations
  return items.filter((i) => new Date(i.expiresAt) > now);
}

export async function revokeInvitation(token: string): Promise<void> {
  const items = await loadInvitations();
  await saveInvitations(items.filter((i) => i.token !== token));
}

export async function createInvitation(input: {
  email: string;
  role: UserRole;
  ownedSlug?: string | null;
  invitedBy: string;
}): Promise<Invitation> {
  const items = await loadInvitations();

  // Remove any existing invite for this email
  const filtered = items.filter(
    (i) => i.email.toLowerCase() !== input.email.toLowerCase()
  );

  const now = new Date();
  const invite: Invitation = {
    token: crypto.randomUUID(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    ownedSlug: input.ownedSlug ?? null,
    invitedBy: input.invitedBy,
    expiresAt: new Date(now.getTime() + EXPIRY_MS).toISOString(),
    createdAt: now.toISOString(),
  };

  filtered.push(invite);
  await saveInvitations(filtered);
  return invite;
}

export async function getInvitation(token: string): Promise<Invitation | null> {
  const items = await loadInvitations();
  const invite = items.find((i) => i.token === token);
  if (!invite) return null;
  if (new Date(invite.expiresAt) < new Date()) {
    // Expired — remove it
    await saveInvitations(items.filter((i) => i.token !== token));
    return null;
  }
  return invite;
}

export async function consumeInvitation(token: string): Promise<Invitation | null> {
  const items = await loadInvitations();
  const idx = items.findIndex((i) => i.token === token);
  if (idx === -1) return null;

  const invite = items[idx];
  if (new Date(invite.expiresAt) < new Date()) {
    items.splice(idx, 1);
    await saveInvitations(items);
    return null;
  }

  items.splice(idx, 1);
  await saveInvitations(items);
  return invite;
}
