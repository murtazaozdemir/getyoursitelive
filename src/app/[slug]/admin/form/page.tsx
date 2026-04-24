import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canEditBusiness } from "@/lib/users";
import { BusinessEditor } from "../editor";

export const metadata: Metadata = {
  title: "Form editor · Admin",
  robots: { index: false, follow: false },
};

export default async function ShopAdminFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/${slug}/admin/login`);

  if (!canEditBusiness(user, slug)) {
    return (
      <div className="admin-page">
        <h1 className="admin-h1">Not your site</h1>
        <p className="admin-lede">
          You&rsquo;re signed in, but this admin area belongs to a different
          shop. Contact your administrator if you think this is a mistake.
        </p>
        <div className="admin-page-header" style={{ marginTop: 16 }}>
          {user.ownedSlug ? (
            <Link href={`/${user.ownedSlug}/admin/form`} className="admin-btn admin-btn--primary">
              Go to your site&rsquo;s admin
            </Link>
          ) : (
            <Link href="/admin" className="admin-btn admin-btn--primary">
              Go to admin dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  return (
    <div className="admin-page admin-page--editor">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            {user.role === "admin" ? (
              <>
                <Link href="/admin" className="admin-crumb">Dashboard</Link>
                <span> / </span>
              </>
            ) : null}
            <span>{business.slug}</span>
          </p>
          <h1 className="admin-h1">{business.businessInfo.name}</h1>
          <p className="admin-lede">
            Edit your site content. Click &ldquo;Save changes&rdquo; to publish.
          </p>
        </div>
        <Link
          href={`/${business.slug}`}
          className="admin-btn admin-btn--ghost"
          target="_blank"
          rel="noreferrer"
        >
          View live &rarr;
        </Link>
      </div>

      <BusinessEditor initialBusiness={business} userRole={user.role} />
    </div>
  );
}
