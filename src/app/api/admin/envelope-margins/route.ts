import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

const ENVELOPE1_DEFAULTS = {
  returnTop: "0.3", returnLeft: "0.35",
  postageTop: "0.25", postageRight: "0.35",
  noticeTop: "0.28", noticeLeft: "3.0",
  recipientTop: "3.35", recipientLeft: "2.6",
  backContentTop: "0.75", backContentBottom: "0.75",
  backContentLeft: "0.6", backContentRight: "1.6",
};

const ENVELOPE2_DEFAULTS = {
  returnTop: "0.3", returnLeft: "0.35",
  postageTop: "0.25", postageRight: "0.35",
  noticeTop: "0.28", noticeLeft: "3.0",
  recipientTop: "3.35", recipientLeft: "2.6",
  backContentTop: "0.15", backContentBottom: "0.15",
  backContentLeft: "0.15", backContentRight: "1.6",
};

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !canManageBusinesses(user)) {
      console.log("[admin/envelope-margins] unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const envelope = req.nextUrl.searchParams.get("type") as "envelope1" | "envelope2" | null;
    if (!envelope || !["envelope1", "envelope2"].includes(envelope)) {
      console.log("[admin/envelope-margins] invalid type param");
      return NextResponse.json({ error: "type must be envelope1 or envelope2" }, { status: 400 });
    }

    console.log(`[admin/envelope-margins] GET type=${envelope}`);
    const defaults = envelope === "envelope1" ? ENVELOPE1_DEFAULTS : ENVELOPE2_DEFAULTS;

    try {
      const db = await getD1();
      const row = await db
        .prepare("SELECT value FROM platform_settings WHERE key = ?")
        .bind(`${envelope}_margins`)
        .first<{ value: string }>();
      if (row?.value) {
        console.log(`[admin/envelope-margins] found saved margins type=${envelope}`);
        return NextResponse.json({ ...defaults, ...JSON.parse(row.value) });
      }
    } catch {
      // Table doesn't exist yet — return defaults
    }

    console.log(`[admin/envelope-margins] returning defaults type=${envelope}`);
    return NextResponse.json(defaults);
  } catch (err) {
    console.error(`[admin/envelope-margins] catch-all error=${err instanceof Error ? err.message : String(err)}`);
    // Catch-all: return envelope1 defaults
    return NextResponse.json(ENVELOPE1_DEFAULTS);
  }
}
