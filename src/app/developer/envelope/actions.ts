"use server";

import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { setEnvelopeMargins, type EnvelopeMargins } from "@/lib/platform-settings";
import { revalidatePath } from "next/cache";

export async function saveEnvelopeMarginsAction(
  envelope: "envelope1" | "envelope2",
  margins: EnvelopeMargins
) {
  const user = await getCurrentUser();
  if (!user || !isDeveloper(user)) throw new Error("UNAUTHORIZED");

  await setEnvelopeMargins(envelope, margins);
  revalidatePath(`/developer/${envelope === "envelope1" ? "envelope" : "envelope2"}`);
  return { ok: true };
}
