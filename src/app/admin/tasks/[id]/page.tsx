import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findUserById } from "@/lib/users";
import { getTask, getTaskItems } from "@/lib/tasks";
import { getD1 } from "@/lib/db-d1";
import { TaskDetailClient } from "./task-detail-client";

async function zipCoords(zip: string): Promise<{ lat: number; lng: number } | null> {
  const db = await getD1();
  const prospect = await db
    .prepare("SELECT lat, lng FROM prospects WHERE lat IS NOT NULL AND lng IS NOT NULL AND address LIKE ? LIMIT 1")
    .bind(`%${zip}%`)
    .first<{ lat: number; lng: number }>();
  if (prospect) return prospect;
  const cached = await db
    .prepare("SELECT lat, lng FROM places_cache WHERE lat IS NOT NULL AND lng IS NOT NULL AND zip = ? LIMIT 1")
    .bind(zip)
    .first<{ lat: number; lng: number }>();
  return cached ?? null;
}

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) redirect("/admin/login");

  const task = await getTask(id);
  if (!task) notFound();

  const items = await getTaskItems(id);

  // Get user home for map feature (same logic as leads page)
  const fullUser = await findUserById(user.id);
  const userAddressParts = [fullUser?.street, fullUser?.city, fullUser?.state, fullUser?.zip].filter(Boolean) as string[];
  const userAddress = userAddressParts.length > 0 ? userAddressParts.join(", ") : null;
  const userHomeCoords = fullUser?.zip ? await zipCoords(fullUser.zip) : null;
  const userHome = userHomeCoords && userAddress
    ? { lat: userHomeCoords.lat, lng: userHomeCoords.lng, name: fullUser?.name ?? user.name, address: userAddress }
    : null;

  return (
    <TaskDetailClient
      task={task}
      items={items}
      userHome={userHome}
    />
  );
}
