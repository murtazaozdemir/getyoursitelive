import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findUserById } from "@/lib/users";
import { getProspect } from "@/lib/prospects";
import { ProposalContent } from "../proposal-content";
import { domainSuggestions, buildSellerInfo } from "../proposal-utils";
import { AutoPrint } from "./auto-print";
import "../[slug]/proposal.css";

export const metadata: Metadata = {
  title: "Bulk Proposals — Print",
};

export default async function BulkProposalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || !canManageBusinesses(sessionUser)) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const slugsParam = params.slugs ?? "";
  const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);

  if (slugs.length === 0) {
    return <div style={{ padding: "2rem" }}>No proposals selected.</div>;
  }

  const user = await findUserById(sessionUser.id) ?? sessionUser;
  const seller = buildSellerInfo(user as unknown as Record<string, unknown>, sessionUser.email);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";
  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Fetch all businesses + prospects in parallel
  const entries = await Promise.all(
    slugs.map(async (slug) => {
      const [biz, prospect] = await Promise.all([
        getBusinessBySlug(slug),
        getProspect(slug),
      ]);
      return { slug, biz, prospect };
    }),
  );

  // Filter out any that don't have a business record
  const valid = entries.filter((e) => e.biz != null);

  if (valid.length === 0) {
    return <div style={{ padding: "2rem" }}>No valid businesses found for the given slugs.</div>;
  }

  return (
    <>
      {/* Toolbar — hidden when printing */}
      <div className="proposal-toolbar no-print">
        <span className="proposal-toolbar-label">
          Printing {valid.length} proposal{valid.length !== 1 ? "s" : ""}
        </span>
        <AutoPrint />
      </div>

      {valid.map((entry, i) => {
        const { slug, biz, prospect } = entry;
        const name = biz?.businessInfo?.name ?? slug;
        const address = biz?.businessInfo?.address ?? "";

        const storedDomains = [prospect?.domain1, prospect?.domain2, prospect?.domain3].filter(Boolean) as string[];
        const domains = storedDomains.length > 0 ? storedDomains : domainSuggestions(name);
        const previewUrl = `${siteUrl}/${slug}`;
        const shortUrl = prospect?.shortId ? `${siteUrl}/p/${prospect.shortId}` : null;
        const qrUrl = shortUrl ?? previewUrl;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

        return (
          <div
            key={slug}
            className={i < valid.length - 1 ? "proposal-page-break" : undefined}
          >
            <ProposalContent
              name={name}
              address={address}
              category={biz?.category ?? ""}
              domains={domains}
              shortUrl={shortUrl}
              qrImageUrl={qrImageUrl}
              today={today}
              sellerName={seller.sellerName}
              sellerEmail={seller.sellerEmail}
              sellerPhone={seller.sellerPhone}
              sellerAddress={seller.sellerAddress}
            />
          </div>
        );
      })}
    </>
  );
}
