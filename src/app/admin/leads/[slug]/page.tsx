import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProspect, PIPELINE_STAGES } from "@/lib/prospects";
import { getBusinessBySlug } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { canManageBusinesses, isFounder } from "@/lib/users";
import { ProspectActions } from "./prospect-actions";
import { getAuditLogForSlug, type AuditEntry } from "@/lib/audit-log";

function formatActivityAction(entry: AuditEntry): string {
  const d = entry.detail;
  switch (entry.action) {
    case "create_prospect":      return "Lead created";
    case "prospect_status":      return `Status → ${d ?? ""}`;
    case "update_prospect_info": return "Contact info updated";
    case "create_user":          return `Owner login created${d ? ` (${d})` : ""}`;
    case "delete_prospect":      return "Lead deleted";
    case "save_business":        return "Site saved";
    case "create_business":      return "Site created";
    case "view_proposal":        return "Proposal viewed";
    case "invite_accepted":      return `Invite accepted${d ? ` by ${d}` : ""}`;
    default:                     return entry.action.replace(/_/g, " ");
  }
}

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
  const [prospect, biz, activity] = await Promise.all([
    getProspect(slug),
    getBusinessBySlug(slug),
    getAuditLogForSlug(slug),
  ]);
  if (!prospect) notFound();

  const currentStageIdx = PIPELINE_STAGES.findIndex((s) => s.status === prospect.status);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";
  const previewUrl = `${siteUrl}/${slug}`;
  const shortUrl = prospect.shortId ? `${siteUrl}/p/${prospect.shortId}` : null;

  // Lock stage changes: only the reseller who first contacted it (or Founder) can advance
  const isLocked =
    !!prospect.contactedBy &&
    prospect.contactedBy !== user.email &&
    !isFounder(user);
  const lockedToName = prospect.contactedByName ?? prospect.contactedBy ?? null;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            <Link href="/admin/leads" className="admin-back-link">
              ← Leads
            </Link>
          </p>
          <h1 className="admin-h1">{prospect.name}</h1>
          <p className="admin-lede">
            {prospect.phone && <span>{prospect.phone}</span>}
            {prospect.phone && prospect.address && <span> &middot; </span>}
            {prospect.address && <span>{prospect.address}</span>}
          </p>
          {prospect.googleCategory && (
            <p className="admin-lede" style={{ marginTop: 6 }}>
              <span className="prospect-chip prospect-chip--muted">{prospect.googleCategory}</span>
            </p>
          )}
          {!prospect.googleCategory && biz?.category && biz.category !== "Car repair and maintenance service" && (
            <p className="admin-lede" style={{ marginTop: 6 }}>
              <span className="prospect-chip prospect-chip--muted">{biz.category}</span>
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
            {isLocked && (
              <p className="prospect-stage-locked">
                🔒 Locked to {lockedToName} — only they can advance this lead.
              </p>
            )}
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
                  locked={isLocked}
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
              category={prospect.googleCategory ?? biz?.category ?? "Car repair and maintenance service"}
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
            {shortUrl && (
              <p style={{ marginTop: 10, fontSize: 13, color: "var(--admin-text-soft)" }}>
                Short link for print:{" "}
                <a href={shortUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 600, color: "var(--admin-text)" }}>
                  {shortUrl}
                </a>
              </p>
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

          {/* Activity log */}
          {activity.length > 0 && (
            <section className="admin-section">
              <h2 className="admin-section-title">Activity</h2>
              <ul className="prospect-notes">
                {activity.map((entry) => (
                  <li key={entry.id} className="prospect-note">
                    <p className="prospect-note-text">{formatActivityAction(entry)}</p>
                    <p className="prospect-note-date">
                      {formatDate(entry.at)} &middot; {entry.userName || entry.userEmail}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Danger zone */}
          <section className="admin-section admin-section--danger">
            <h2 className="admin-section-title">Delete lead</h2>
            <p className="admin-section-lede">
              Removes the lead record and the preview site at{" "}
              <code>/{slug}</code>. This cannot be undone.
            </p>
            <ProspectActions slug={slug} action="delete" />
          </section>
        </div>

        {/* ── RIGHT: sidebar ── */}
        <aside className="prospect-detail-sidebar">

          {/* Commission attribution */}
          <div className="prospect-sidebar-card">
            <h2 className="admin-section-title">Commission</h2>
            {prospect.contactedBy ? (
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 2px" }}>
                  {prospect.contactedByName ?? prospect.contactedBy}
                </p>
                <p style={{ fontSize: 12, color: "var(--admin-text-soft)", margin: 0 }}>
                  {prospect.contactedBy}
                </p>
                {prospect.contactedAt && (
                  <p style={{ fontSize: 12, color: "var(--admin-text-soft)", marginTop: 4 }}>
                    Contacted {formatDate(prospect.contactedAt)}
                  </p>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "var(--admin-text-soft)", margin: 0 }}>
                Not yet contacted. The first admin to mark this lead as <strong>Contacted</strong> will be credited.
              </p>
            )}
          </div>

          {(prospect.googleRating || prospect.googleReviewCount || prospect.googleCategory || prospect.googleMapsUrl) && (
            <div className="prospect-sidebar-card">
              <h2 className="admin-section-title">Google Maps</h2>
              {prospect.googleCategory && (
                <p style={{ fontSize: 13, margin: "0 0 6px", color: "var(--admin-text-soft)" }}>
                  {prospect.googleCategory}
                </p>
              )}
              {prospect.googleRating != null && (
                <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px" }}>
                  {"★".repeat(Math.round(prospect.googleRating))} {prospect.googleRating}
                  {prospect.googleReviewCount ? ` (${prospect.googleReviewCount} reviews)` : ""}
                </p>
              )}
              {prospect.googleMapsUrl && (
                <a
                  href={prospect.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="admin-link"
                  style={{ fontSize: 13 }}
                >
                  View on Google Maps →
                </a>
              )}
            </div>
          )}

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
