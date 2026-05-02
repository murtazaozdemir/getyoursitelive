"use server";

import { revalidatePath } from "next/cache";
import { getBusinessBySlug, saveBusiness, deleteBusiness } from "@/lib/db";
import { canEditBusiness, canManageBusinesses } from "@/lib/users";
import { getCurrentUser } from "@/lib/session";
import type { Business } from "@/lib/business-types";
import { validateBusiness } from "@/lib/business-validation";
import { logAudit } from "@/lib/audit-log";

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
    console.log(`[save-business] entry slug=${slug} incomingSlug=${incoming.slug}`);
    const user = await getCurrentUser();
    if (!user) {
      console.log("[save-business] unauthenticated");
      return { ok: false, error: "UNAUTHORIZED" };
    }
    console.log(`[save-business] user=${user.email} role=${user.role}`);
    if (!canEditBusiness(user, slug)) {
      console.log(`[save-business] forbidden user=${user.email} slug=${slug}`);
      return { ok: false, error: "FORBIDDEN" };
    }

    if (incoming.slug !== slug && user.role !== "admin") {
      console.log(`[save-business] slug change denied for non-admin user=${user.email}`);
      return { ok: false, error: "Only admins can change the slug." };
    }

    const validation = validateBusiness(incoming);
    if (!validation.ok) {
      console.log(`[save-business] validation failed slug=${slug} error=${validation.error}`);
      return { ok: false, error: validation.error };
    }

    // If slug changed, load old record to confirm it exists, and check for
    // collisions on the new slug.
    if (incoming.slug !== slug) {
      const existing = await getBusinessBySlug(incoming.slug);
      if (existing) {
        console.log(`[save-business] slug collision newSlug=${incoming.slug}`);
        return { ok: false, error: `A business already uses slug "${incoming.slug}".` };
      }
      // Write new, delete old
      await saveBusiness(incoming);
      await deleteBusiness(slug);
      console.log(`[save-business] renamed slug from=${slug} to=${incoming.slug}`);
    } else {
      await saveBusiness(incoming);
      console.log(`[save-business] saved slug=${slug}`);
    }

    await logAudit({
      userEmail: user.email,
      userName: user.name,
      action: "save_business",
      slug: incoming.slug,
      detail: incoming.slug !== slug ? `Renamed slug from "${slug}" to "${incoming.slug}"` : undefined,
    });

    revalidatePath(`/${incoming.slug}`);
    revalidatePath(`/admin`);
    revalidatePath(`/${incoming.slug}/admin`);
    console.log(`[save-business] success slug=${incoming.slug} user=${user.email}`);
    return { ok: true };
  } catch (err) {
    console.error(`[save-business] error slug=${slug}`, err instanceof Error ? err.message : err);
    return { ok: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createBusinessAction(
  initial: Business,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  console.log(`[create-business] entry slug=${initial.slug}`);
  const user = await getCurrentUser();
  if (!user) {
    console.log("[create-business] unauthenticated");
    return { ok: false, error: "UNAUTHORIZED" };
  }
  if (!canManageBusinesses(user)) {
    console.log(`[create-business] forbidden user=${user.email}`);
    return { ok: false, error: "FORBIDDEN" };
  }

  const validation = validateBusiness(initial);
  if (!validation.ok) {
    console.log(`[create-business] validation failed slug=${initial.slug} error=${validation.error}`);
    return { ok: false, error: validation.error };
  }

  const existing = await getBusinessBySlug(initial.slug);
  if (existing) {
    console.log(`[create-business] slug taken slug=${initial.slug}`);
    return { ok: false, error: `Slug "${initial.slug}" is already taken.` };
  }

  await saveBusiness(initial);
  await logAudit({ userEmail: user.email, userName: user.name, action: "create_business", slug: initial.slug });
  revalidatePath("/admin");
  revalidatePath(`/${initial.slug}`);
  console.log(`[create-business] success slug=${initial.slug} user=${user.email}`);
  return { ok: true, slug: initial.slug };
}

export async function deleteBusinessAction(
  slug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  console.log(`[delete-business] entry slug=${slug}`);
  const user = await getCurrentUser();
  if (!user) {
    console.log("[delete-business] unauthenticated");
    return { ok: false, error: "UNAUTHORIZED" };
  }
  if (!canManageBusinesses(user)) {
    console.log(`[delete-business] forbidden user=${user.email}`);
    return { ok: false, error: "FORBIDDEN" };
  }

  await deleteBusiness(slug);
  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_business", slug });
  revalidatePath("/admin");
  console.log(`[delete-business] success slug=${slug} user=${user.email}`);
  return { ok: true };
}
