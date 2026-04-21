"use server";

import { revalidatePath } from "next/cache";
import { getBusinessBySlug, saveBusiness, deleteBusiness } from "@/lib/db";
import { canEditBusiness, canManageBusinesses } from "@/lib/users";
import { getCurrentUser } from "@/lib/session";
import type { Business } from "@/lib/business-types";
import { validateBusiness } from "@/lib/business-validation";

/**
 * Server actions for admin mutations. Every action:
 *   1. Requires a valid session (throws UNAUTHORIZED otherwise).
 *   2. Enforces role-based authorization on the specific slug.
 *   3. Validates input shape.
 *   4. Revalidates affected cache paths.
 */

export async function saveBusinessAction(
  slug: string,
  incoming: Business,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "UNAUTHORIZED" };
    if (!canEditBusiness(user, slug)) return { ok: false, error: "FORBIDDEN" };

    if (incoming.slug !== slug && user.role !== "admin") {
      return { ok: false, error: "Only admins can change the slug." };
    }

    const validation = validateBusiness(incoming);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }

    // If slug changed, load old record to confirm it exists, and check for
    // collisions on the new slug.
    if (incoming.slug !== slug) {
      const existing = await getBusinessBySlug(incoming.slug);
      if (existing) {
        return { ok: false, error: `A business already uses slug "${incoming.slug}".` };
      }
      // Write new, delete old
      await saveBusiness(incoming);
      await deleteBusiness(slug);
    } else {
      await saveBusiness(incoming);
    }

    revalidatePath(`/${incoming.slug}`);
    revalidatePath(`/admin`);
    revalidatePath(`/${incoming.slug}/admin`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createBusinessAction(
  initial: Business,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };
  if (!canManageBusinesses(user)) return { ok: false, error: "FORBIDDEN" };

  const validation = validateBusiness(initial);
  if (!validation.ok) return { ok: false, error: validation.error };

  const existing = await getBusinessBySlug(initial.slug);
  if (existing) return { ok: false, error: `Slug "${initial.slug}" is already taken.` };

  await saveBusiness(initial);
  revalidatePath("/admin");
  revalidatePath(`/${initial.slug}`);
  return { ok: true, slug: initial.slug };
}

export async function deleteBusinessAction(
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "UNAUTHORIZED" };
  if (!canManageBusinesses(user)) return { ok: false, error: "FORBIDDEN" };

  await deleteBusiness(slug);
  revalidatePath("/admin");
  return { ok: true };
}
