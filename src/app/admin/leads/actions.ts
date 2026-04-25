"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, isFounder } from "@/lib/users";
import {
  createProspect,
  updateProspect,
  deleteProspect,
  getProspect,
  findProspectByPhone,
  normalizePhone,
  type ProspectStatus,
} from "@/lib/prospects";
import { saveBusiness, getBusinessBySlug, deleteBusiness } from "@/lib/db";
import { createUser } from "@/lib/users";
import { logAudit } from "@/lib/audit-log";
import { getTemplateForCategory } from "@/lib/templates/registry";
import { generateUniqueSlug } from "@/lib/slugify";

export async function createProspectAction(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; slug?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return { ok: false, error: "Unauthorized" };
  }

  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const street = (formData.get("street") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const state = (formData.get("state") as string)?.trim() ?? "";
  const zip = (formData.get("zip") as string)?.trim() ?? "";
  const addressParts = [street, city, state && zip ? `${state} ${zip}` : state || zip].filter(Boolean);
  const address = addressParts.join(", ");

  if (!name) return { ok: false, error: "Business name is required." };

  let slug: string;
  try {
    slug = await generateUniqueSlug(name, city, state);
  } catch {
    return { ok: false, error: "Could not generate a valid slug from that name." };
  }

  // Block duplicate phone number
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch) {
      return {
        ok: false,
        error: `Phone ${phone} is already on file for "${phoneMatch.name}". Check the prospects list before adding again.`,
      };
    }
  }

  const template = getTemplateForCategory("Car repair and maintenance service");
  const business = template.buildProspectBusiness(slug, name, phone, address);
  await saveBusiness(business);

  const now = new Date().toISOString();
  try {
    await createProspect({
      slug,
      name,
      phone,
      address,
      status: "found",
      notes: [],
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    // Rollback: remove the business we just created so data stays consistent
    await deleteBusiness(slug).catch(() => {});
    throw err;
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "create_prospect", slug, detail: name });
  revalidatePath("/admin/leads");
  revalidatePath(`/${slug}`);

  redirect(`/admin/leads/${slug}`);
}

export async function updateProspectStatusAction(slug: string, status: ProspectStatus): Promise<{ ok: boolean; locked?: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  const existing = await getProspect(slug);

  // Once a lead is contacted, it's locked to that reseller.
  // Only the reseller who contacted it (or the Founder) can advance the stage.
  if (existing?.contactedBy && existing.contactedBy !== user.email && !isFounder(user)) {
    return { ok: false, locked: true };
  }

  const patch: Partial<Parameters<typeof updateProspect>[1]> & { status: ProspectStatus } = { status };

  // Record who first moved this lead to "contacted" — used for commission tracking.
  // Only set once; never overwrite an existing attribution.
  if (status === "contacted" && existing && !existing.contactedBy) {
    patch.contactedBy = user.email;
    patch.contactedByName = user.name;
    patch.contactedAt = new Date().toISOString();
  }

  await updateProspect(slug, patch);
  await logAudit({ userEmail: user.email, userName: user.name, action: "prospect_status", slug, detail: status });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function updateProspectInfoAction(
  slug: string,
  data: { name: string; phone: string; address: string; category: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  const { name, phone, address, category } = data;
  if (!name.trim()) return { ok: false, error: "Name is required." };

  // Block if new phone belongs to a different prospect
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch && phoneMatch.slug !== slug) {
      return {
        ok: false,
        error: `Phone ${phone} is already on file for "${phoneMatch.name}".`,
      };
    }
  }

  // Update prospect record
  await updateProspect(slug, { name: name.trim(), phone: phone.trim(), address: address.trim() });

  // Keep business JSON in sync (name, phone, address, category)
  const biz = await getBusinessBySlug(slug);
  if (biz) {
    biz.businessInfo.name = name.trim();
    biz.businessInfo.phone = phone.trim();
    biz.businessInfo.address = address.trim();
    biz.businessInfo.emergencyPhone = phone.trim();
    biz.category = category.trim();
    await saveBusiness(biz);
  }

  await logAudit({ userEmail: user.email, userName: user.name, action: "update_prospect_info", slug, detail: name.trim() });
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${slug}`);
  revalidatePath(`/${slug}`);
  return { ok: true };
}

export async function addProspectNoteAction(slug: string, text: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  const prospect = await getProspect(slug);
  if (!prospect) return { ok: false };

  const note = { id: `n-${Date.now()}`, text, createdAt: new Date().toISOString() };
  await updateProspect(slug, { notes: [note, ...prospect.notes] });
  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function updateProspectDomainsAction(
  slug: string,
  data: { domain1: string; domain2: string; domain3: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  await updateProspect(slug, {
    domain1: data.domain1.trim() || undefined,
    domain2: data.domain2.trim() || undefined,
    domain3: data.domain3.trim() || undefined,
  });

  revalidatePath(`/admin/leads/${slug}`);
  return { ok: true };
}

export async function createOwnerLoginAction(
  slug: string,
  data: { name: string; email: string; password: string },
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false, error: "Unauthorized" };

  const { name, email, password } = data;
  if (!name.trim()) return { ok: false, error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "A valid email is required." };
  if (password.length < 8) return { ok: false, error: "Password must be at least 8 characters." };

  const biz = await getBusinessBySlug(slug);
  if (!biz) return { ok: false, error: `No business found with slug "${slug}".` };

  try {
    await createUser({ name: name.trim(), email: email.trim(), password, role: "owner", ownedSlug: slug });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to create user." };
  }

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_user",
    slug,
    detail: `${email.trim()} (owner → ${slug})`,
  });
  revalidatePath(`/admin/leads/${slug}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteProspectAction(slug: string): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) return { ok: false };

  await logAudit({ userEmail: user.email, userName: user.name, action: "delete_prospect", slug });
  await deleteProspect(slug);
  await deleteBusiness(slug);

  revalidatePath("/admin/leads");
  redirect("/admin/leads");
}
