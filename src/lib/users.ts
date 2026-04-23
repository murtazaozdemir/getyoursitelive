import "server-only";
import bcrypt from "bcryptjs";
import { getStorage, readJson, writeJson } from "@/lib/storage";

/**
 * User accounts for the admin module.
 *
 * Two roles:
 *   - "admin" — Murtaza. Sees and edits every business.
 *   - "owner" — A shop owner. Sees + edits only `ownedSlug`.
 *
 * Stored as a single JSON array at `users.json`. Passwords are bcrypt
 * hashes (cost 10) — never store plaintext.
 */

export type UserRole = "admin" | "owner";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  /** Legacy combined name — kept for backward compat. Prefer firstName + lastName. */
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

const USERS_KEY = "users.json";

// ---------------------------------------------------------------
// Queries
// ---------------------------------------------------------------

async function loadUsers(): Promise<User[]> {
  const storage = await getStorage();
  const users = await readJson<User[]>(storage, USERS_KEY);
  return users ?? [];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await loadUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const users = await loadUsers();
  return users.find((u) => u.id === id) ?? null;
}

export async function findOwnerBySlug(slug: string): Promise<SessionUser | null> {
  const users = await loadUsers();
  const found = users.find((u) => u.role === "owner" && u.ownedSlug === slug);
  return found ? toSessionUser(found) : null;
}

export async function listUsers(): Promise<SessionUser[]> {
  const users = await loadUsers();
  return users.map(toSessionUser);
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
// Mutations (used by admin user-management screen, future)
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
  const users = await loadUsers();
  const normalized = input.email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalized)) {
    throw new Error(`User with email ${input.email} already exists`);
  }
  if (input.role === "owner" && !input.ownedSlug) {
    throw new Error("Owners must have an ownedSlug");
  }

  const newUser: User = {
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    email: normalized,
    passwordHash: await bcrypt.hash(input.password, 10),
    role: input.role,
    name: input.name,
    ownedSlug: input.role === "owner" ? input.ownedSlug ?? null : null,
    phone: input.phone ?? null,
    street: input.street ?? null,
    city: input.city ?? null,
    zip: input.zip ?? null,
    state: input.state ?? null,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  const storage = await getStorage();
  await writeJson(storage, USERS_KEY, users);

  return newUser;
}

export async function updateUserPassword(id: string, newPassword: string): Promise<void> {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error(`No user with id ${id}`);

  users[idx].passwordHash = await bcrypt.hash(newPassword, 10);
  const storage = await getStorage();
  await writeJson(storage, USERS_KEY, users);
}

export async function updateUserEmail(id: string, newEmail: string): Promise<void> {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error(`No user with id ${id}`);

  const normalized = newEmail.trim().toLowerCase();
  if (users.some((u) => u.id !== id && u.email.toLowerCase() === normalized)) {
    throw new Error(`Email ${newEmail} is already in use`);
  }

  users[idx].email = normalized;
  const storage = await getStorage();
  await writeJson(storage, USERS_KEY, users);
}

export async function updateUserProfile(
  id: string,
  fields: { firstName: string; lastName: string; phone?: string; street?: string; city?: string; zip?: string; state?: string },
): Promise<void> {
  const users = await loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error(`No user with id ${id}`);

  users[idx].firstName = fields.firstName.trim();
  users[idx].lastName = fields.lastName.trim();
  users[idx].name = [fields.firstName.trim(), fields.lastName.trim()].filter(Boolean).join(" ");
  users[idx].phone = fields.phone?.trim() || null;
  users[idx].street = fields.street?.trim() || null;
  users[idx].city = fields.city?.trim() || null;
  users[idx].zip = fields.zip?.trim() || null;
  users[idx].state = fields.state?.trim() || null;

  const storage = await getStorage();
  await writeJson(storage, USERS_KEY, users);
}

export async function deleteUser(id: string): Promise<void> {
  const users = await loadUsers();
  const filtered = users.filter((u) => u.id !== id);
  if (filtered.length === users.length) throw new Error(`No user with id ${id}`);

  const storage = await getStorage();
  await writeJson(storage, USERS_KEY, filtered);
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
  return user.email.toLowerCase() === founderEmail.toLowerCase();
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
