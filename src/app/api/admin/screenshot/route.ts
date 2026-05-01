import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";

export const runtime = "edge";

/**
 * GET /api/admin/screenshot?url=...&width=...&height=...
 *
 * Proxies screenshot requests to the Fly.io screenshot service,
 * avoiding CORS issues when called from the browser.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.searchParams.get("url");
  const width = req.nextUrl.searchParams.get("width") || "1400";
  const height = req.nextUrl.searchParams.get("height") || "700";

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  try {
    const screenshotUrl = `https://gysl-screenshots.fly.dev/screenshot?url=${encodeURIComponent(url)}&width=${width}&height=${height}`;
    const res = await fetch(screenshotUrl);

    if (!res.ok) {
      return NextResponse.json({ error: "Screenshot service error" }, { status: 502 });
    }

    const imageData = await res.arrayBuffer();
    return new NextResponse(imageData, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[screenshot proxy] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
