import "server-only";
import { getD1 } from "@/lib/db-d1";
import type { UserRole } from "@/lib/users";

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

interface InvitationRow {
  token: string;
  email: string;
  role: string;
  owned_slug: string | null;
  invited_by: string;
  expires_at: string;
  created_at: string;
}

function rowToInvitation(row: InvitationRow): Invitation {
  return {
    token: row.token,
    email: row.email,
    role: row.role as UserRole,
    ownedSlug: row.owned_slug,
    invitedBy: row.invited_by,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function listInvitations(): Promise<Invitation[]> {
  const db = getD1();
  const now = new Date().toISOString();
  const { results } = await db
    .prepare("SELECT * FROM invitations WHERE expires_at > ? ORDER BY created_at DESC")
    .bind(now)
    .all<InvitationRow>();
  return results.map(rowToInvitation);
}

export async function revokeInvitation(token: string): Promise<void> {
  const db = getD1();
  await db.prepare("DELETE FROM invitations WHERE token = ?").bind(token).run();
}

export async function createInvitation(input: {
  email: string;
  role: UserRole;
  ownedSlug?: string | null;
  invitedBy: string;
}): Promise<Invitation> {
  const db = getD1();
  const email = input.email.trim().toLowerCase();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_MS).toISOString();
  const createdAt = now.toISOString();
  const token = crypto.randomUUID();

  // Remove any existing invite for this email first
  await db.prepare("DELETE FROM invitations WHERE LOWER(email) = ?").bind(email).run();

  await db
    .prepare(
      `INSERT INTO invitations (token, email, role, owned_slug, invited_by, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      token,
      email,
      input.role,
      input.ownedSlug ?? null,
      input.invitedBy,
      expiresAt,
      createdAt,
    )
    .run();

  return {
    token,
    email,
    role: input.role,
    ownedSlug: input.ownedSlug ?? null,
    invitedBy: input.invitedBy,
    expiresAt,
    createdAt,
  };
}

export async function getInvitation(token: string): Promise<Invitation | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT * FROM invitations WHERE token = ? LIMIT 1")
    .bind(token)
    .first<InvitationRow>();

  if (!row) return null;

  if (new Date(row.expires_at) < new Date()) {
    await db.prepare("DELETE FROM invitations WHERE token = ?").bind(token).run();
    return null;
  }

  return rowToInvitation(row);
}

export async function consumeInvitation(token: string): Promise<Invitation | null> {
  const db = getD1();
  const row = await db
    .prepare("SELECT * FROM invitations WHERE token = ? LIMIT 1")
    .bind(token)
    .first<InvitationRow>();

  if (!row) return null;

  // Always delete — whether expired or not
  await db.prepare("DELETE FROM invitations WHERE token = ?").bind(token).run();

  if (new Date(row.expires_at) < new Date()) return null;

  return rowToInvitation(row);
}
