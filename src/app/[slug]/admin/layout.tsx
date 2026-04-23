import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";
import { getBusinessBySlug } from "@/lib/db";
import { ShopAdminHeader } from "./shop-admin-header";
import "../../admin/admin.css";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ShopAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();

  // Redirect unauthenticated requests to the shop login.
  // Also redirect users who aren't allowed to edit this slug.
  if (!user) redirect(`/${slug}/admin/login`);
  if (!canEditBusiness(user, slug)) redirect(`/${slug}/admin/login`);

  const business = await getBusinessBySlug(slug);

  return (
    <div className="admin-shell" data-theme="modern">
      {business && (
        <ShopAdminHeader user={user} businessName={business.businessInfo.name} slug={slug} />
      )}
      <main className="admin-main">{children}</main>
      <footer className="admin-footer">
        <div className="admin-footer-inner">
          <span>Get Your Site Live · Shop admin</span>
          <Link href={`/${slug}`} className="admin-footer-link">
            View public site
          </Link>
        </div>
      </footer>
    </div>
  );
}
