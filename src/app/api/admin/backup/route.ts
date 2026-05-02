import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getD1 } from "@/lib/db-d1";

const TABLES = [
  "businesses",
  "prospects",
  "prospect_notes",
  "users",
  "audit_log",
  "tasks",
  "task_items",
  "places_cache",
  "invitations",
  "password_resets",
  "rate_limits",
  "migrations",
];

export async function GET() {
  console.log("[admin/backup] GET backup request");
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log("[admin/backup] unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[admin/backup] starting backup user=${user.email}`);
  const db = await getD1();
  const backup: Record<string, unknown[]> = {};

  for (const table of TABLES) {
    try {
      const { results } = await db
        .prepare(`SELECT * FROM ${table}`)
        .all();
      backup[table] = results;
    } catch {
      // Table may not exist yet — skip it
      backup[table] = [];
    }
  }

  const tableCounts = Object.fromEntries(
    Object.entries(backup).map(([k, v]) => [k, v.length])
  );

  const payload = {
    exportedAt: new Date().toISOString(),
    gitCommit: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME ?? "unknown",
    tables: backup,
    tableCounts,
  };

  const json = JSON.stringify(payload, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

  console.log(`[admin/backup] success counts=${JSON.stringify(tableCounts)}`);

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="gysl-backup-${timestamp}.json"`,
    },
  });
}
