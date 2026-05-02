import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { deleteProspect } from "@/lib/prospects";
import { deleteBusiness } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  console.log("[admin/delete-prospect] POST delete request");
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log("[admin/delete-prospect] unauthorized");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    console.log("[admin/delete-prospect] invalid JSON");
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    console.log("[admin/delete-prospect] missing slug");
    return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
  }

  try {
    console.log(`[admin/delete-prospect] deleting slug=${slug} user=${user.email}`);
    // Delete from both tables (prospect + site preview)
    await Promise.all([
      deleteProspect(slug),
      deleteBusiness(slug),
    ]);

    await logAudit({
      userEmail: user.email,
      userName: user.name,
      action: "delete_prospect",
      slug,
      detail: `Duplicate cleanup`,
    });

    console.log(`[admin/delete-prospect] success slug=${slug}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Delete failed";
    console.error(`[admin/delete-prospect] error slug=${slug} error=${msg}`);
    return NextResponse.json({
      ok: false,
      error: msg,
    });
  }
}
