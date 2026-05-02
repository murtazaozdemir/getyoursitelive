import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/debug-biz?slug=lexington-service-garage
 * Returns the raw content JSON for a business. Admin-only.
 */
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageBusinesses(user)) {
      console.log("[admin/debug-biz] unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    if (!slug) {
      console.log("[admin/debug-biz] missing slug param");
      return NextResponse.json({ error: "Missing ?slug= param" }, { status: 400 });
    }

    console.log(`[admin/debug-biz] GET slug=${slug} user=${user.email}`);

    const db = await getD1();
    const row = await db
      .prepare("SELECT slug, name, category, content FROM businesses WHERE slug = ?")
      .bind(slug)
      .first<{ slug: string; name: string; category: string; content: string }>();

    if (!row) {
      console.log(`[admin/debug-biz] not found slug=${slug}`);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    console.log(`[admin/debug-biz] found slug=${slug} name=${row.name}`);
    const parsed = JSON.parse(row.content);
    return NextResponse.json({
      slug: row.slug,
      name: row.name,
      category: row.category,
      showBooking: parsed.visibility?.showBooking,
      visibility: parsed.visibility,
      contactHeading: parsed.contact?.heading,
      hasHero: !!parsed.hero,
      hasAbout: !!parsed.about,
      servicesCount: parsed.services?.length ?? 0,
      heroImage: parsed.hero?.heroImage,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[admin/debug-biz] error=${msg}`);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
