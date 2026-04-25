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
 * Token lifetime: 7 days with sliding window — if the token is past
 * its halfway point, a fresh token is issued on the next page load.
 * Active users never get logged out; inactive users expire after 7 days.
 */

const COOKIE_NAME = "admin-session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const REMEMBER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

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

export async function createSessionToken(
  user: SessionUser,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    ownedSlug: user.ownedSlug,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
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

export async function setSessionCookie(token: string, ttlSeconds?: number): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // If ttlSeconds is 0 or undefined, omit maxAge → session cookie (expires when browser closes)
    ...(ttlSeconds ? { maxAge: ttlSeconds } : {}),
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

/**
 * Sliding window: if the current token is past its halfway point,
 * silently reissue a fresh one. Call from a layout server component
 * so it runs on every page load. No DB hit — all claims are in the JWT.
 */
export async function refreshSessionIfNeeded(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: ["HS256"],
    });

    const iat = payload.iat;
    if (typeof iat !== "number") return;

    const ageSeconds = Math.floor(Date.now() / 1000) - iat;
    if (ageSeconds < SESSION_TTL_SECONDS / 2) return;

    // Token is past halfway — reissue
    const user: SessionUser = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as "admin" | "owner",
      name: payload.name as string,
      ownedSlug: (payload.ownedSlug as string | null) ?? null,
    };

    const fresh = await createSessionToken(user);
    store.set(COOKIE_NAME, fresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
  } catch {
    // Token invalid or expired — don't refresh, let normal auth flow handle it
  }
}
