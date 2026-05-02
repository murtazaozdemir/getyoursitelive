import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getEnvelopeMargins, ENVELOPE1_DEFAULTS } from "@/lib/platform-settings";
import { EnvelopeMarginsEditor } from "./envelope-margins-editor";

export default async function EnvelopeSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const margins = await getEnvelopeMargins("envelope1");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Envelope 1 — Margins</h1>
          <p className="admin-lede">
            Adjust positioning of elements on the original envelope. All values in inches.
          </p>
        </div>
      </div>
      <EnvelopeMarginsEditor
        envelope="envelope1"
        initial={margins}
        defaults={ENVELOPE1_DEFAULTS}
      />
    </div>
  );
}
