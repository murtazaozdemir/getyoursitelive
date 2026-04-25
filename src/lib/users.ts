import bcrypt from "bcryptjs";
import { getD1 } from "@/lib/db-d1";

/**
 * User accounts for the admin module.
 *
 * Two roles:
 *   - "admin" — Murtaza. Sees and edits every business.
 *   - "owner" — A shop owner. Sees + edits only `ownedSlug`.
 *
 * Stored in D1 `users` table. Passwords are bcrypt hashes (cost 10).
 */

export type UserRole = "admin" | "owner";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  /** Combined display name (firstName + lastName). */
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  /** Required when role is "owner"; null for admins */
  ownedSlug: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  state?: string | null;
  createdAt: string;
}

/** Public-safe view (no passwordHash) — what we put into the auth session. */
export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  ownedSlug: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  state?: string | null;
  createdAt?: string;
}

// ---------------------------------------------------------------
// D1 row → User
// ---------------------------------------------------------------

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  owned_slug: string | null;
  phone: string | null;
  street: string | null;
  city: string | null;
  zip: string | null;
  state: string | null;
  created_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role as UserRole,
    name: row.name,
    firstName: row.first_name,
    lastName: row.last_name,
    ownedSlug: row.owned_slug,
    phone: row.phone,
    street: row.street,
    city: row.city,
    zip: row.zip,
    state: row.state,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------
// Queries
// ---------------------------------------------------------------

export async function findUserByEmail(email: string): Promise<User | null> {
  const db = await getD1();
  const normalized = email.trim().toLowerCase();
  const row = await db
    .prepare("SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1")
    .bind(normalized)
    .first<UserRow>();
  return row ? rowToUser(row) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM users WHERE id = ? LIMIT 1")
    .bind(id)
    .first<UserRow>();
  return row ? rowToUser(row) : null;
}

export async function findOwnerBySlug(slug: string): Promise<SessionUser | null> {
  const db = await getD1();
  const row = await db
    .prepare("SELECT * FROM users WHERE owned_slug = ? AND role = 'owner' LIMIT 1")
    .bind(slug)
    .first<UserRow>();
  return row ? toSessionUser(rowToUser(row)) : null;
}

export async function listUsers(): Promise<SessionUser[]> {
  const db = await getD1();
  const { results } = await db
    .prepare("SELECT * FROM users ORDER BY created_at DESC")
    .all<UserRow>();
  return results.map((r) => toSessionUser(rowToUser(r)));
}

// ---------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------

/**
 * Verify an email + plaintext password against the stored bcrypt hash.
 * Returns the SessionUser on success, null on any failure (wrong email,
 * wrong password, malformed hash). Does NOT differentiate the failure
 * mode to the caller — protects against user enumeration.
 */
export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    // Still run a dummy compare so timing doesn't leak whether the email exists.
    await bcrypt.compare(password, "$2b$10$0000000000000000000000000000000000000000000000000000O");
    return null;
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;

  return toSessionUser(user);
}

// ---------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------

export async function createUser(input: {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  ownedSlug?: string | null;
  phone?: string | null;
  street?: string | null;
  city?: string | null;
  zip?: string | null;
  state?: string | null;
}): Promise<User> {
  const db = await getD1();
  const normalized = input.email.trim().toLowerCase();

  const existing = await db
    .prepare("SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1")
    .bind(normalized)
    .first<{ id: string }>();
  if (existing) throw new Error(`User with email ${input.email} already exists`);

  if (input.role === "owner" && !input.ownedSlug) {
    throw new Error("Owners must have an ownedSlug");
  }

  const id = `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const passwordHash = await bcrypt.hash(input.password, 10);
  const now = new Date().toISOString();
  const name = input.name;
  const ownedSlug = input.role === "owner" ? (input.ownedSlug ?? null) : null;

  await db
    .prepare(
      `INSERT INTO users (
        id, email, password_hash, role, name,
        first_name, last_name, owned_slug,
        phone, street, city, zip, state, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      normalized,
      passwordHash,
      input.role,
      name,
      null,
      null,
      ownedSlug,
      input.phone ?? null,
      input.street ?? null,
      input.city ?? null,
      input.zip ?? null,
      input.state ?? null,
      now,
    )
    .run();

  return {
    id,
    email: normalized,
    passwordHash,
    role: input.role,
    name,
    firstName: null,
    lastName: null,
    ownedSlug,
    phone: input.phone ?? null,
    street: input.street ?? null,
    city: input.city ?? null,
    zip: input.zip ?? null,
    state: input.state ?? null,
    createdAt: now,
  };
}

export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const db = await getD1();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  const { meta } = await db
    .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    .bind(passwordHash, id)
    .run();
  if (meta.changes === 0) throw new Error(`No user with id ${id}`);
}

export async function updateUserEmail(id: string, newEmail: string): Promise<void> {
  const db = await getD1();
  const normalized = newEmail.trim().toLowerCase();

  const conflict = await db
    .prepare("SELECT id FROM users WHERE LOWER(email) = ? AND id != ? LIMIT 1")
    .bind(normalized, id)
    .first<{ id: string }>();
  if (conflict) throw new Error(`Email ${newEmail} is already in use`);

  const { meta } = await db
    .prepare("UPDATE users SET email = ? WHERE id = ?")
    .bind(normalized, id)
    .run();
  if (meta.changes === 0) throw new Error(`No user with id ${id}`);
}

export async function updateUserProfile(
  id: string,
  fields: {
    firstName: string;
    lastName: string;
    phone?: string;
    street?: string;
    city?: string;
    zip?: string;
    state?: string;
  },
): Promise<void> {
  const db = await getD1();
  const firstName = fields.firstName.trim();
  const lastName = fields.lastName.trim();
  const name = [firstName, lastName].filter(Boolean).join(" ");

  const { meta } = await db
    .prepare(
      `UPDATE users SET
        first_name = ?, last_name = ?, name = ?,
        phone = ?, street = ?, city = ?, zip = ?, state = ?
       WHERE id = ?`,
    )
    .bind(
      firstName,
      lastName,
      name,
      fields.phone?.trim() || null,
      fields.street?.trim() || null,
      fields.city?.trim() || null,
      fields.zip?.trim() || null,
      fields.state?.trim() || null,
      id,
    )
    .run();
  if (meta.changes === 0) throw new Error(`No user with id ${id}`);
}

export async function deleteUser(id: string): Promise<void> {
  const db = await getD1();
  const { meta } = await db
    .prepare("DELETE FROM users WHERE id = ?")
    .bind(id)
    .run();
  if (meta.changes === 0) throw new Error(`No user with id ${id}`);
}

// ---------------------------------------------------------------
// Authorization helpers
// ---------------------------------------------------------------

/**
 * Can this user edit the given business slug?
 * - Admins: always yes.
 * - Owners: only their own slug.
 */
export function canEditBusiness(user: SessionUser, slug: string): boolean {
  if (user.role === "admin") return true;
  return user.ownedSlug === slug;
}

/**
 * Can this user create / delete businesses (admin-only operations)?
 */
export function canManageBusinesses(user: SessionUser): boolean {
  return user.role === "admin";
}

/**
 * The platform founder — has elevated permissions such as overriding
 * lead ownership locks. Read from env so the email isn't scattered
 * across source files.
 */
export function isFounder(user: { email: string }): boolean {
  const founderEmail = process.env.FOUNDER_EMAIL ?? "murtaza@getyoursitelive.com";
  const email = user.email.toLowerCase();
  return email === founderEmail.toLowerCase();
}

// ---------------------------------------------------------------
// Internal
// ---------------------------------------------------------------

function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.name,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    ownedSlug: u.ownedSlug,
    phone: u.phone ?? null,
    street: u.street ?? null,
    city: u.city ?? null,
    zip: u.zip ?? null,
    state: u.state ?? null,
    createdAt: u.createdAt,
  };
}
