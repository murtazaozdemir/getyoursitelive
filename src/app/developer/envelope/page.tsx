import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { isDeveloper } from "@/lib/users";
import { getEnvelopeMargins, ENVELOPE1_DEFAULTS, ENVELOPE2_DEFAULTS } from "@/lib/platform-settings";
import { EnvelopeMarginsEditor } from "./envelope-margins-editor";

export default async function EnvelopeSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!isDeveloper(user)) redirect("/admin");

  const margins1 = await getEnvelopeMargins("envelope1");
  const margins2 = await getEnvelopeMargins("envelope2");

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-h1">Envelope Margins</h1>
          <p className="admin-lede">
            Adjust positioning of elements on envelopes. All values in inches.
          </p>
        </div>
      </div>

      <h2 className="admin-h2" style={{ marginTop: "1rem" }}>Envelope A — Text only</h2>
      <EnvelopeMarginsEditor
        envelope="envelope1"
        initial={margins1}
        defaults={ENVELOPE1_DEFAULTS}
      />

      <hr style={{ margin: "2.5rem 0", borderColor: "#ddd" }} />

      <h2 className="admin-h2">Envelope B — With screenshot</h2>
      <EnvelopeMarginsEditor
        envelope="envelope2"
        initial={margins2}
        defaults={ENVELOPE2_DEFAULTS}
      />
    </div>
  );
}
