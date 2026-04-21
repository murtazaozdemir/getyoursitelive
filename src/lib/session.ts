import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/users";

/**
 * Session management via signed JWT in an HttpOnly cookie.
 *
 * Why not NextAuth? For a 2-role admin module with email+password, a
 * signed-cookie approach is ~80 lines of code, edge-runtime compatible
 * (Cloudflare Workers), and has zero configuration beyond a secret.
 * NextAuth v5 adds significant surface area we don't need.
 *
 * Token lifetime: 7 days. Slide window is not implemented — users will
 * need to re-login after 7 days of inactivity.
 */

const COOKIE_NAME = "admin-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is not set or is too short (must be ≥32 chars). " +
      "Generate one with: openssl rand -base64 48",
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------
// Token crypto
// ---------------------------------------------------------------

export async function createSessionToken(user: SessionUser): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    ownedSlug: user.ownedSlug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "admin" && payload.role !== "owner") ||
      typeof payload.name !== "string"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
      ownedSlug: (payload.ownedSlug as string | null) ?? null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------
// Cookie helpers (for use in Route Handlers / Server Actions)
// ---------------------------------------------------------------

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/**
 * Read the current session user on the server. Returns null if no valid
 * session. Safe to use in server components, route handlers, server actions.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Throws if no session — use as a guard at the top of admin server actions.
 */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
