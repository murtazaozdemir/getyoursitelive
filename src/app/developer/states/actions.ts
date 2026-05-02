"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { setStateVisible } from "@/lib/state-visibility";
import { revalidatePath } from "next/cache";

export async function toggleStateAction(state: string, visible: boolean) {
  console.log(`[toggle-state] entry state=${state} visible=${visible}`);
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log(`[toggle-state] unauthorized user=${user?.email ?? "unauthenticated"}`);
    throw new Error("UNAUTHORIZED");
  }

  await setStateVisible(state, visible);
  revalidatePath("/developer/states");
  revalidatePath("/admin/leads");
  console.log(`[toggle-state] success state=${state} visible=${visible} user=${user.email}`);
}
