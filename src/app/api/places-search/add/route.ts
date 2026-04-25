import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses } from "@/lib/users";
import { getBusinessBySlug, saveBusiness } from "@/lib/db";
import { createProspect, getProspect, findProspectByPhone, normalizePhone, updateProspectGoogleData } from "@/lib/prospects";
import { logAudit } from "@/lib/audit-log";
import { revalidatePath } from "next/cache";
import { getTemplateForCategory, isCategoryMapped } from "@/lib/templates/registry";
import { sendUnmatchedCategoryAlert } from "@/lib/email";
import { generateUniqueSlug } from "@/lib/slugify";

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canManageBusinesses(user)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const street = (formData.get("street") as string)?.trim() ?? "";
  const city = (formData.get("city") as string)?.trim() ?? "";
  const state = (formData.get("state") as string)?.trim() ?? "";
  const zipCode = (formData.get("zip") as string)?.trim() ?? "";

  // Google Places data
  const googlePlaceId = (formData.get("googlePlaceId") as string)?.trim() ?? "";
  const googleRating = formData.get("googleRating") ? parseFloat(formData.get("googleRating") as string) : null;
  const googleReviewCount = formData.get("googleReviewCount") ? parseInt(formData.get("googleReviewCount") as string, 10) : 0;
  const googleCategory = (formData.get("googleCategory") as string)?.trim() ?? "";
  const googleMapsUrl = (formData.get("googleMapsUrl") as string)?.trim() ?? "";
  const website = (formData.get("website") as string)?.trim() ?? "";
  const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
  const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;
  const googleBusinessStatus = (formData.get("googleBusinessStatus") as string)?.trim() ?? "";
  const googlePriceLevel = (formData.get("googlePriceLevel") as string)?.trim() ?? "";
  const googleEditorialSummary = (formData.get("googleEditorialSummary") as string)?.trim() ?? "";
  const googleOpeningHours = (formData.get("googleOpeningHours") as string)?.trim() ?? "";
  const googleReviews = (formData.get("googleReviews") as string)?.trim() ?? "";
  const googlePhotos = (formData.get("googlePhotos") as string)?.trim() ?? "";
  const googleShortAddress = (formData.get("googleShortAddress") as string)?.trim() ?? "";
  const googleAddressComponents = (formData.get("googleAddressComponents") as string)?.trim() ?? "";

  if (!name) {
    return NextResponse.json({ ok: false, error: "Name is required." });
  }

  const slug = nameToSlug(name);
  if (!slug) {
    return NextResponse.json({ ok: false, error: "Could not generate slug." });
  }

  const googleData = {
    state: state || undefined,
    website: website || undefined,
    googlePlaceId: googlePlaceId || undefined,
    googleRating,
    googleReviewCount,
    googleCategory: googleCategory || undefined,
    googleMapsUrl: googleMapsUrl || undefined,
    googleBusinessStatus: googleBusinessStatus || undefined,
    googlePriceLevel: googlePriceLevel || undefined,
    googleEditorialSummary: googleEditorialSummary || undefined,
    googleOpeningHours: googleOpeningHours || undefined,
    googleReviews: googleReviews || undefined,
    googlePhotos: googlePhotos || undefined,
    googleShortAddress: googleShortAddress || undefined,
    googleAddressComponents: googleAddressComponents || undefined,
    lat,
    lng,
  };

  // Check for existing by slug
  const [existingBiz, existingProspect] = await Promise.all([
    getBusinessBySlug(slug),
    getProspect(slug),
  ]);

  if (existingBiz || existingProspect) {
    // Update existing prospect with Google data
    const targetSlug = existingProspect?.slug ?? slug;
    try {
      await updateProspectGoogleData(targetSlug, googleData);
    } catch { /* ignore if columns don't exist yet */ }
    return NextResponse.json({ ok: true, updated: true, slug: targetSlug });
  }

  // Check duplicate phone
  if (phone && normalizePhone(phone).length >= 7) {
    const phoneMatch = await findProspectByPhone(phone);
    if (phoneMatch) {
      // Update existing prospect with Google data
      try {
        await updateProspectGoogleData(phoneMatch.slug, googleData);
      } catch { /* ignore if columns don't exist yet */ }
      return NextResponse.json({ ok: true, updated: true, slug: phoneMatch.slug });
    }
  }

  const addressParts = [street, city, state && zipCode ? `${state} ${zipCode}` : state || zipCode].filter(Boolean);
  const address = addressParts.join(", ");

  // Generate a unique slug (appends city/state/random if the base name collides)
  let uniqueSlug: string;
  try {
    uniqueSlug = await generateUniqueSlug(name, city, state);
  } catch {
    return NextResponse.json({ ok: false, error: "Could not generate slug." });
  }

  const template = getTemplateForCategory(googleCategory || "Car repair and maintenance service");
  const business = template.buildProspectBusiness(uniqueSlug, name, phone, address);
  await saveBusiness(business);

  const now = new Date().toISOString();
  try {
    await createProspect({
      slug: uniqueSlug,
      name,
      phone,
      address,
      state: state || undefined,
      status: "found",
      notes: [],
      website: googleData.website,
      googlePlaceId: googleData.googlePlaceId,
      googleRating: googleData.googleRating ?? undefined,
      googleReviewCount: googleData.googleReviewCount || undefined,
      googleCategory: googleData.googleCategory,
      googleMapsUrl: googleData.googleMapsUrl,
      googleBusinessStatus: googleData.googleBusinessStatus,
      googlePriceLevel: googleData.googlePriceLevel,
      googleEditorialSummary: googleData.googleEditorialSummary,
      googleOpeningHours: googleData.googleOpeningHours,
      googleReviews: googleData.googleReviews,
      googlePhotos: googleData.googlePhotos,
      googleShortAddress: googleData.googleShortAddress,
      googleAddressComponents: googleData.googleAddressComponents,
      lat: googleData.lat ?? undefined,
      lng: googleData.lng ?? undefined,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    // Rollback
    const { deleteBusiness } = await import("@/lib/db");
    await deleteBusiness(uniqueSlug).catch(() => {});
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Failed to create prospect.",
    });
  }

  const effectiveCategory = googleCategory || "Car repair and maintenance service";
  if (!isCategoryMapped(effectiveCategory)) {
    sendUnmatchedCategoryAlert({
      category: effectiveCategory,
      businessName: name,
      slug: uniqueSlug,
      address,
      addedBy: user.email,
    }).catch(() => {});
  }

  await logAudit({
    userEmail: user.email,
    userName: user.name,
    action: "create_prospect",
    slug: uniqueSlug,
    detail: `${name} (zip search)`,
  });

  revalidatePath("/admin/leads");
  return NextResponse.json({ ok: true, slug: uniqueSlug });
}
