"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { runMigration, type MigrationResult } from "@/lib/migrations";

export async function runMigrationAction(name: string): Promise<MigrationResult> {
  console.log(`[run-migration] entry name=${name}`);
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log(`[run-migration] unauthorized user=${user?.email ?? "unauthenticated"}`);
    return { updated: 0, skipped: 0, log: ["ERROR: Unauthorized - developer access required"] };
  }
  console.log(`[run-migration] authorized user=${user.email}`);

  try {
    const result = await runMigration(name);
    console.log(`[run-migration] success name=${name} updated=${result.updated} skipped=${result.skipped}`);
    return result;
  } catch (err) {
    console.error(`[run-migration] error name=${name}`, err instanceof Error ? err.message : err);
    return { updated: 0, skipped: 0, log: [`ERROR: ${String(err)}`] };
  }
}
