import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Gate admin routes behind a valid session cookie.
 *
 * Two admin URL spaces:
 *   - /admin/*           platform admin (Murtaza only — role check in page)
 *   - /{slug}/admin/*    per-shop admin (shop owner or platform admin)
 *
 * Login pages inside either space are allowed through unauthenticated:
 *   - /admin/login
 *   - /{slug}/admin/login
 */

const COOKIE_NAME = "admin-session";

async function isValidToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

function isLoginPath(pathname: string): boolean {
  return (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname.startsWith("/admin/invite/") ||
    /^\/[^/]+\/admin\/login$/.test(pathname)
  );
}

function loginPathFor(pathname: string): string {
  if (pathname.startsWith("/developer")) return "/admin/login";
  const slugMatch = pathname.match(/^\/([^/]+)\/admin(?:\/|$)/);
  if (slugMatch) return `/${slugMatch[1]}/admin/login`;
  return "/admin/login";
}

function defaultDestinationForAuthedUser(pathname: string): string {
  const slugMatch = pathname.match(/^\/([^/]+)\/admin\/login$/);
  if (slugMatch) return `/${slugMatch[1]}/admin`;
  return "/admin";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never gate /api/* routes — they handle their own auth internally
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  const authed = await isValidToken(token);

  if (isLoginPath(pathname)) {
    if (authed) {
      return NextResponse.redirect(new URL(defaultDestinationForAuthedUser(pathname), req.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const loginUrl = new URL(loginPathFor(pathname), req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/developer/:path*",
    "/:slug/admin/:path*",
  ],
};
