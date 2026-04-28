import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findUserById } from "@/lib/users";
import { getProspect, updateProspect } from "@/lib/prospects";
import { logAudit } from "@/lib/audit-log";
import { PrintButton } from "./print-button";
import { ProposalContent } from "../proposal-content";
import { domainSuggestions, buildSellerInfo } from "../proposal-utils";
import "./proposal.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) return { title: "Proposal" };
  const date = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).replace(/\//g, "-");
  return { title: `${biz.businessInfo.name} - Proposal - ${date}` };
}

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const sessionUser = await getCurrentUser();
  if (!sessionUser || !canManageBusinesses(sessionUser)) {
    return <div style={{ padding: "2rem" }}>Not authorized.</div>;
  }

  const user = await findUserById(sessionUser.id) ?? sessionUser;

  const biz = await getBusinessBySlug(slug);
  if (!biz) notFound();

  const prospect = await getProspect(slug);
  if (prospect) {
    const updates: Partial<{ proposalSentAt: string; proposalSentBy: string }> = {};
    if (!prospect.proposalSentAt) {
      updates.proposalSentAt = new Date().toISOString();
      updates.proposalSentBy = sessionUser.email;
    }
    await Promise.all([
      Object.keys(updates).length > 0 ? updateProspect(slug, updates) : Promise.resolve(),
      logAudit({
        userEmail: sessionUser.email,
        userName: sessionUser.name,
        action: "view_proposal",
        slug,
        detail: biz.businessInfo.name,
      }),
    ]);
  }

  const seller = buildSellerInfo(user as unknown as Record<string, unknown>, sessionUser.email);

  const storedDomains = [prospect?.domain1, prospect?.domain2, prospect?.domain3].filter(Boolean) as string[];
  const domains = storedDomains.length > 0 ? storedDomains : domainSuggestions(biz.businessInfo.name);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";
  const previewUrl = `${siteUrl}/${slug}`;
  const shortUrl = prospect?.shortId ? `${siteUrl}/p/${prospect.shortId}` : null;
  const qrUrl = shortUrl ?? previewUrl;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;
  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  return (
    <>
      <div className="proposal-toolbar no-print">
        <span className="proposal-toolbar-label">Get Your Site Live — Proposal</span>
        <PrintButton />
      </div>

      <ProposalContent
        name={biz.businessInfo?.name ?? slug}
        address={biz.businessInfo?.address ?? ""}
        category={biz.category ?? ""}
        domains={domains}
        shortUrl={shortUrl}
        qrImageUrl={qrImageUrl}
        today={today}
        sellerName={seller.sellerName}
        sellerEmail={seller.sellerEmail}
        sellerPhone={seller.sellerPhone}
        sellerAddress={seller.sellerAddress}
      />
    </>
  );
}
