import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";
import { logAudit } from "@/lib/audit-log";

export async function POST(req: NextRequest) {
  console.log("[admin/transfer-stage] POST stage transfer request");
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log("[admin/transfer-stage] unauthorized");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { fromSlug?: string; toSlug?: string };
  try {
    body = await req.json();
  } catch {
    console.log("[admin/transfer-stage] invalid JSON");
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const fromSlug = body.fromSlug?.trim();
  const toSlug = body.toSlug?.trim();
  if (!fromSlug || !toSlug) {
    console.log("[admin/transfer-stage] missing fromSlug or toSlug");
    return NextResponse.json({ ok: false, error: "fromSlug and toSlug are required" }, { status: 400 });
  }

  try {
    console.log(`[admin/transfer-stage] from=${fromSlug} to=${toSlug} user=${user.email}`);
    const fromProspect = await getProspect(fromSlug);
    if (!fromProspect) {
      console.log(`[admin/transfer-stage] source not found from=${fromSlug}`);
      return NextResponse.json({ ok: false, error: `Prospect "${fromSlug}" not found` }, { status: 404 });
    }

    const toProspect = await getProspect(toSlug);
    if (!toProspect) {
      console.log(`[admin/transfer-stage] target not found to=${toSlug}`);
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
      console.log(`[admin/transfer-stage] transferred stage=${fromProspect.status} from=${fromSlug} to=${toSlug}`);
    } else {
      console.log(`[admin/transfer-stage] skipped transfer (target stage not lower) from=${fromProspect.status} to=${toProspect.status}`);
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
    const msg = err instanceof Error ? err.message : "Transfer failed";
    console.error(`[admin/transfer-stage] error from=${fromSlug} to=${toSlug} error=${msg}`);
    return NextResponse.json({
      ok: false,
      error: msg,
    });
  }
}
