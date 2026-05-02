"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { setEnvelopeMargins, type EnvelopeMargins } from "@/lib/platform-settings";
import { revalidatePath } from "next/cache";

export async function saveEnvelopeMarginsAction(
  envelope: "envelope1" | "envelope2",
  margins: EnvelopeMargins
) {
  console.log(`[save-envelope-margins] entry envelope=${envelope}`);
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) {
    console.log(`[save-envelope-margins] unauthorized user=${user?.email ?? "unauthenticated"}`);
    throw new Error("UNAUTHORIZED");
  }

  await setEnvelopeMargins(envelope, margins);
  revalidatePath(`/developer/${envelope === "envelope1" ? "envelope" : "envelope2"}`);
  console.log(`[save-envelope-margins] success envelope=${envelope} user=${user.email}`);
  return { ok: true };
}
