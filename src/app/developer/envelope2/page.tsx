import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getEnvelopeMargins, ENVELOPE2_DEFAULTS } from "@/lib/platform-settings";
import { EnvelopeMarginsEditor } from "../envelope/envelope-margins-editor";

export default async function Envelope2SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const margins = await getEnvelopeMargins("envelope2");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Envelope B — Margins</h1>
          <p className="admin-lede">
            Adjust positioning of elements on Envelope B (with screenshot). All values in inches.
          </p>
        </div>
      </div>
      <EnvelopeMarginsEditor
        envelope="envelope2"
        initial={margins}
        defaults={ENVELOPE2_DEFAULTS}
      />
    </div>
  );
}
