import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";
import { LoginForm } from "@/app/admin/login/login-form";

export const metadata: Metadata = {
  title: "Business Owner Login",
  robots: { index: false, follow: false },
};

export default async function ShopLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  // If already signed in with permission to edit this shop, skip the form
  const user = await getCurrentUser();
  if (user && canEditBusiness(user, slug)) {
    redirect(`/${slug}/admin`);
  }

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="admin-auth-header">
          <div className="admin-auth-brand">{business.businessInfo.name}</div>
          <h1 className="admin-auth-title">Business Owner Login</h1>
          <p className="admin-auth-subtitle">
            Use the credentials provided to you. Forgot them? Use the link below.
          </p>
        </div>
        <LoginForm nextPath={`/${slug}/admin`} />
      </div>
    </div>
  );
}
