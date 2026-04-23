import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProspect, PIPELINE_STAGES } from "@/lib/prospects";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, findOwnerBySlug } from "@/lib/users";
import { ProspectActions } from "./prospect-actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageBusinesses(user)) redirect("/admin");

  const { slug } = await params;
  const [prospect, biz, existingOwner] = await Promise.all([
    getProspect(slug),
    getBusinessBySlug(slug),
    findOwnerBySlug(slug),
  ]);
  if (!prospect) notFound();

  const currentStageIdx = PIPELINE_STAGES.findIndex((s) => s.status === prospect.status);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const previewUrl = `${siteUrl}/${slug}`;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin/prospects" className="admin-back-link">
              ← Leads
            </Link>
          </p>
          <h1 className="admin-h1">{prospect.name}</h1>
          <p className="admin-lede">
            {prospect.phone && <span>{prospect.phone}</span>}
            {prospect.phone && prospect.address && <span> &middot; </span>}
            {prospect.address && <span>{prospect.address}</span>}
          </p>
          {biz?.category && biz.category !== "Auto Repair" && (
            <p className="admin-lede" style={{ marginTop: 6 }}>
              <span className="prospect-chip prospect-chip--muted">{biz.category}</span>
              {" "}
              <span style={{ fontSize: 13, color: "var(--admin-text-soft)" }}>
                Not in the auto repair pipeline
              </span>
            </p>
          )}
          {biz?.description && (
            <p className="admin-lede" style={{ marginTop: 8, maxWidth: 640, fontStyle: "italic" }}>
              {biz.description}
            </p>
          )}
        </div>
      </div>

      <div className="prospect-detail-layout">
        {/* ── LEFT: main content ── */}
        <div className="prospect-detail-main">

          {/* Pipeline stage selector */}
          <section className="admin-section">
            <h2 className="admin-section-title">Pipeline stage</h2>
            <div className="prospect-stages">
              {PIPELINE_STAGES.map(({ status, label }, i) => (
                <ProspectActions
                  key={status}
                  slug={slug}
                  action="status"
                  status={status}
                  label={label}
                  active={prospect.status === status}
                  past={i < currentStageIdx}
                />
              ))}
            </div>
          </section>

          {/* Edit contact info */}
          <section className="admin-section">
            <h2 className="admin-section-title">Contact info</h2>
            <ProspectActions
              slug={slug}
              action="edit-info"
              name={prospect.name}
              phone={prospect.phone ?? ""}
              address={prospect.address ?? ""}
              category={biz?.category ?? "Auto Repair"}
            />
          </section>

          {/* Preview link to copy */}
          <section className="admin-section">
            <h2 className="admin-section-title">Preview link</h2>
            <p className="admin-section-lede">
              Send this to the mechanic. It looks like a finished website — no
              mention of pricing or your brand.
            </p>
            <div className="prospect-preview-row">
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="prospect-preview-url"
              >
                {previewUrl}
              </a>
              <ProspectActions slug={slug} action="copy" previewUrl={previewUrl} />
            </div>
          </section>

          {/* Business owner login */}
          <section className="admin-section">
            <h2 className="admin-section-title">Business Owner Login</h2>
            {existingOwner ? (
              <p className="admin-section-lede">
                Login already created for{" "}
                <strong>{existingOwner.name}</strong> ({existingOwner.email}).
                They can sign in at{" "}
                <code>/{slug}/admin/login</code>.
              </p>
            ) : (
              <>
                <p className="admin-section-lede">
                  Create a login so the business owner can sign in and edit their own site.
                  Share the credentials with them — they can change the password from their account page.
                </p>
                <ProspectActions slug={slug} action="create-login" />
              </>
            )}
          </section>

          {/* Notes */}
          <section className="admin-section">
            <h2 className="admin-section-title">Notes</h2>
            <ProspectActions slug={slug} action="add-note" />

            {prospect.notes.length > 0 && (
              <ul className="prospect-notes">
                {prospect.notes.map((note) => (
                  <li key={note.id} className="prospect-note">
                    <p className="prospect-note-text">{note.text}</p>
                    <p className="prospect-note-date">{formatDate(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Danger zone */}
          <section className="admin-section admin-section--danger">
            <h2 className="admin-section-title">Delete prospect</h2>
            <p className="admin-section-lede">
              Removes the prospect record and the preview site at{" "}
              <code>/{slug}</code>. This cannot be undone.
            </p>
            <ProspectActions slug={slug} action="delete" />
          </section>
        </div>

        {/* ── RIGHT: sidebar ── */}
        <aside className="prospect-detail-sidebar">
          <div className="prospect-sidebar-card">
            <h2 className="admin-section-title">Domain options</h2>
            <ProspectActions
              slug={slug}
              action="edit-domains"
              domain1={prospect.domain1 ?? ""}
              domain2={prospect.domain2 ?? ""}
              domain3={prospect.domain3 ?? ""}
            />
          </div>
          <div className="prospect-sidebar-btns">
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn--primary admin-btn--wide"
            >
              View preview site →
            </a>
            <Link href={`/${slug}/admin`} className="admin-btn admin-btn--ghost admin-btn--wide">
              Edit site
            </Link>
            <Link
              href={`/admin/proposal/${slug}`}
              className="admin-btn admin-btn--ghost admin-btn--wide"
            >
              View proposal
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
