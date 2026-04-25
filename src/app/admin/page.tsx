import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function AdminHomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "owner" && user.ownedSlug) {
    redirect(`/${user.ownedSlug}/admin/edit`);
  }

  redirect("/admin/help");
}
