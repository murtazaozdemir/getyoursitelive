import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { listMigrations } from "@/lib/migrations";
import { MigrationRunner } from "./migration-runner";

export const metadata = {
  title: "Migrations · Developer",
  robots: { index: false, follow: false },
};

export default async function MigrationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const migrations = listMigrations();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Developer</p>
          <h1 className="admin-h1">Migrations</h1>
          <p className="admin-lede">
            {migrations.length} available migrations. Select one and click Run to execute.
            All migrations are idempotent (safe to run multiple times).
          </p>
        </div>
      </div>

      <MigrationRunner migrations={migrations} />
    </div>
  );
}
