import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { fromSlug?: string; toSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const fromSlug = body.fromSlug?.trim();
  const toSlug = body.toSlug?.trim();
  if (!fromSlug || !toSlug) {
    return NextResponse.json({ ok: false, error: "fromSlug and toSlug are required" }, { status: 400 });
  }

  try {
    const fromProspect = await getProspect(fromSlug);
    if (!fromProspect) {
      return NextResponse.json({ ok: false, error: `Prospect "${fromSlug}" not found` }, { status: 404 });
    }

    const toProspect = await getProspect(toSlug);
    if (!toProspect) {
      return NextResponse.json({ ok: false, error: `Prospect "${toSlug}" not found` }, { status: 404 });
    }

    // Only transfer if the source has a more advanced stage
    const STAGE_ORDER = ["found", "contacted", "interested", "paid", "delivered"];
    const fromIdx = STAGE_ORDER.indexOf(fromProspect.status);
    const toIdx = STAGE_ORDER.indexOf(toProspect.status);

    if (fromIdx > toIdx) {
      await updateProspect(toSlug, {
        status: fromProspect.status,
        contactedBy: fromProspect.contactedBy,
        contactedByName: fromProspect.contactedByName,
        contactedAt: fromProspect.contactedAt,
      });
    }

    await logAudit({
      userEmail: user.email,
      userName: user.name,
      action: "prospect_status",
      slug: toSlug,
      detail: `Stage transferred from ${fromSlug}: ${fromProspect.status}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Transfer failed",
    });
  }
}
