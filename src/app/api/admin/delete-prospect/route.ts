import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { deleteProspect } from "@/lib/prospects";
import { deleteBusiness } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Slug is required" }, { status: 400 });
  }

  try {
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

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Delete failed",
    });
  }
}
