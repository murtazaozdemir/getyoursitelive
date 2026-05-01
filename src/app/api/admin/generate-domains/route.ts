import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";
import { generateVerifiedDomains } from "@/lib/domains";

export const runtime = "edge";

/**
 * POST /api/admin/generate-domains
 * Body: { slug: string }
 *
 * Generates up to 3 verified-available .com domains for a prospect
 * and saves them to the DB. Only runs if the prospect has no domains yet.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = (await req.json()) as { slug: string };
    if (!slug) {
      return NextResponse.json({ ok: false, error: "slug is required" });
    }

    const prospect = await getProspect(slug);
    if (!prospect) {
      return NextResponse.json({ ok: false, error: "Prospect not found" });
    }

    // Skip if domains already exist
    if (prospect.domain1 && prospect.domain2 && prospect.domain3) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const state = prospect.address?.match(/\b([A-Z]{2})\s+\d{5}/)?.[1] || "NJ";
    const domains = await generateVerifiedDomains(prospect.name, state);

    if (domains.length === 0) {
      return NextResponse.json({ ok: true, domains: [] });
    }

    await updateProspect(slug, {
      domain1: prospect.domain1 || domains[0] || undefined,
      domain2: prospect.domain2 || domains[1] || undefined,
      domain3: prospect.domain3 || domains[2] || undefined,
    });

    return NextResponse.json({ ok: true, domains });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[generate-domains] error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
