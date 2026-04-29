import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { findUserById } from "@/lib/users";
import { ProfileForm, ChangeEmailForm, ChangePasswordForm } from "./account-actions";

export const metadata = {
  title: "My Account · Admin",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/admin/login");

  // Fetch the full user record from DB (session JWT only has id/email/role/name)
  const fullUser = await findUserById(sessionUser.id);
  const user = fullUser
    ? { ...sessionUser, firstName: fullUser.firstName, lastName: fullUser.lastName, phone: fullUser.phone, street: fullUser.street, city: fullUser.city, state: fullUser.state, zip: fullUser.zip, wifiIp: fullUser.wifiIp, mobileIp: fullUser.mobileIp, company: fullUser.company }
    : sessionUser;

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
