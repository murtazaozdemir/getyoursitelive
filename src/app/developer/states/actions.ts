"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { setStateVisible } from "@/lib/state-visibility";
import { revalidatePath } from "next/cache";

export async function toggleStateAction(state: string, visible: boolean) {
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) throw new Error("UNAUTHORIZED");

  await setStateVisible(state, visible);
  revalidatePath("/developer/states");
  revalidatePath("/admin/leads");
}
