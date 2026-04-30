"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { runMigration, type MigrationResult } from "@/lib/migrations";

export async function runMigrationAction(name: string): Promise<MigrationResult> {
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    return { updated: 0, skipped: 0, log: ["ERROR: Unauthorized - developer access required"] };
  }

  try {
    return await runMigration(name);
  } catch (err) {
    return { updated: 0, skipped: 0, log: [`ERROR: ${String(err)}`] };
  }
}
