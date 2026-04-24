export const runtime = "edge";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm, ChangeEmailForm, ChangePasswordForm } from "./account-actions";

export const metadata = {
  title: "My Account · Admin",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Admin</p>
          <h1 className="admin-h1">My Account</h1>
          <p className="admin-lede">Manage your profile, email and password.</p>
        </div>
      </div>

      <ProfileForm user={user} />
      <ChangeEmailForm currentEmail={user.email} />
      <ChangePasswordForm />
    </div>
  );
}
