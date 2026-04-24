export const runtime = "edge";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvitation } from "@/lib/invitations";
import { AcceptInviteForm } from "./accept-form";

export const metadata: Metadata = {
  title: "Accept Invitation · Get Your Site Live",
  robots: { index: false, follow: false },
};

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvitation(token);
  if (!invite) notFound();

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-card" style={{ maxWidth: 480 }}>
        <div className="admin-auth-header">
          <div className="admin-auth-brand">Get Your Site Live</div>
          <h1 className="admin-auth-title">Create your account</h1>
          <p className="admin-auth-subtitle">
            You've been invited to join as a{" "}
            <strong>{invite.role === "admin" ? "Admin" : "Business Owner"}</strong>.
            Fill in your details below.
          </p>
        </div>
        <AcceptInviteForm
          token={token}
          email={invite.email}
          role={invite.role}
        />
      </div>
    </div>
  );
}
