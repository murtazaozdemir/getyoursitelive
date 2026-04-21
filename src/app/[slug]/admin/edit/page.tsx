import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";
import { EditableHome } from "./editable-home";
import "@/components/editable/editable.css";

export const metadata: Metadata = {
  title: "Edit your site (inline)",
  robots: { index: false, follow: false },
};

export default async function InlineEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/${slug}/admin/login`);
  if (!canEditBusiness(user, slug)) redirect(`/${slug}/admin`);

  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  return <EditableHome business={business} />;
}
