import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageBusinesses(user)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getD1();
    const now = new Date().toISOString();

    const { results } = await db
      .prepare(
        `SELECT ti.prospect_slug FROM task_items ti
         JOIN prospects p ON p.slug = ti.prospect_slug
         WHERE ti.status = 'dropped_off' AND p.status = 'found'`,
      )
      .all<{ prospect_slug: string }>();

    const updated: string[] = [];
    for (const row of results) {
      await db
        .prepare(
          `UPDATE prospects SET status = 'contacted', contacted_by = ?, contacted_by_name = ?, contacted_at = ?, updated_at = ? WHERE slug = ?`,
        )
        .bind(user.email, user.name, now, now, row.prospect_slug)
        .run();
      updated.push(row.prospect_slug);
    }

    return NextResponse.json({ updated: updated.length, slugs: updated });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
