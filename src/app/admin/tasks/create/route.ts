import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { createTask } from "@/lib/tasks";
import { logAudit } from "@/lib/audit-log";

export const runtime = "edge";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const slugsRaw = formData.get("slugs") as string;
  if (!slugsRaw) {
    return NextResponse.json({ error: "No slugs" }, { status: 400 });
  }

  const slugs = slugsRaw.split(",").filter(Boolean);
  if (slugs.length === 0) {
    return NextResponse.json({ error: "No leads selected" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const today = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  const name = `Task - ${today}`;

  await createTask(
    { id, name, createdBy: user.email, createdByName: user.name },
    slugs,
  );

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_task",
    detail: `Created task "${name}" with ${slugs.length} leads`,
  });

  // Redirect to the new task's detail page
  return NextResponse.redirect(new URL(`/admin/tasks/${id}`, req.url));
}
