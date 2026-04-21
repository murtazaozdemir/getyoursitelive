"use client";

import type { Business, DaySchedule, HoursSchedule } from "@/lib/business-types";
import type { ContactContent, EmergencyContent, FooterContent } from "@/types/site";

const DAYS: Array<{ key: keyof HoursSchedule; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export function ContactHoursTab({
  business,
  update,
}: {
  business: Business;
  update: <K extends keyof Business>(key: K, value: Business[K]) => void;
}) {
  const info = business.businessInfo;
  const hours = business.hoursSchedule;
  const emergency = business.emergency;
  const contact = business.contact;
  const footer = business.footer;

  function patchInfo<K extends keyof Business["businessInfo"]>(
    key: K,
    value: Business["businessInfo"][K],
  ) {
    update("businessInfo", { ...info, [key]: value });
  }

  function patchSocial<K extends keyof Business["businessInfo"]["social"]>(
    key: K,
    value: Business["businessInfo"]["social"][K],
  ) {
    update("businessInfo", {
      ...info,
      social: { ...info.social, [key]: value },
    });
  }

  function patchDay(day: keyof HoursSchedule, value: DaySchedule) {
    update("hoursSchedule", { ...hours, [day]: value });
  }

  function toggleDay(day: keyof HoursSchedule, closed: boolean) {
    patchDay(day, closed ? null : { open: "08:00", close: "18:00" });
  }

  function patchEmergency<K extends keyof EmergencyContent>(
    key: K,
    value: EmergencyContent[K],
  ) {
    update("emergency", { ...emergency, [key]: value });
  }

  function patchContact<K extends keyof ContactContent>(
    key: K,
    value: ContactContent[K],
  ) {
    update("contact", { ...contact, [key]: value });
  }

  function patchFooter<K extends keyof FooterContent>(
    key: K,
    value: FooterContent[K],
  ) {
    update("footer", { ...footer, [key]: value });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-section-title">Contact &amp; Hours</h2>
      <p className="admin-section-lede">
        Everything visitors need to reach you: phone, email, address, weekly
        schedule, and the emergency banner that appears just before the
        booking form.
      </p>

      <h3 className="admin-subsection-title">Contact</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Primary phone</span>
          <input
            className="admin-input"
            type="tel"
            value={info.phone}
            onChange={(e) => patchInfo("phone", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Emergency / after-hours phone</span>
          <input
            className="admin-input"
            type="tel"
            value={info.emergencyPhone}
            onChange={(e) => patchInfo("emergencyPhone", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Email</span>
          <input
            className="admin-input"
            type="email"
            value={info.email}
            onChange={(e) => patchInfo("email", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Address</span>
          <input
            className="admin-input"
            type="text"
            value={info.address}
            onChange={(e) => patchInfo("address", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Hours summary (display string)</span>
          <input
            className="admin-input"
            type="text"
            value={info.hours}
            onChange={(e) => patchInfo("hours", e.target.value)}
          />
          <span className="admin-field-help">
            Short human-readable version shown in the footer.
          </span>
        </label>
      </div>

      <h3 className="admin-subsection-title">Social links</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Facebook</span>
          <input
            className="admin-input"
            type="url"
            value={info.social.facebook}
            onChange={(e) => patchSocial("facebook", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Instagram</span>
          <input
            className="admin-input"
            type="url"
            value={info.social.instagram}
            onChange={(e) => patchSocial("instagram", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">LinkedIn</span>
          <input
            className="admin-input"
            type="url"
            value={info.social.linkedin}
            onChange={(e) => patchSocial("linkedin", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">YouTube</span>
          <input
            className="admin-input"
            type="url"
            value={info.social.youtube}
            onChange={(e) => patchSocial("youtube", e.target.value)}
          />
        </label>
      </div>

      <h3 className="admin-subsection-title">Weekly hours</h3>
      <div className="admin-hours-grid">
        {DAYS.map(({ key, label }) => {
          const value = hours[key];
          const isClosed = value === null;
          return (
            <div key={key} className="admin-hours-row">
              <span className="admin-hours-day">{label}</span>
              <label className="admin-hours-toggle">
                <input
                  type="checkbox"
                  checked={isClosed}
                  onChange={(e) => toggleDay(key, e.target.checked)}
                />
                <span>Closed</span>
              </label>
              <input
                type="time"
                className="admin-input admin-input--time"
                disabled={isClosed}
                value={value?.open ?? ""}
                onChange={(e) =>
                  patchDay(key, { ...(value ?? { close: "18:00" }), open: e.target.value })
                }
              />
              <span className="admin-hours-sep">to</span>
              <input
                type="time"
                className="admin-input admin-input--time"
                disabled={isClosed}
                value={value?.close ?? ""}
                onChange={(e) =>
                  patchDay(key, { ...(value ?? { open: "08:00" }), close: e.target.value })
                }
              />
            </div>
          );
        })}
      </div>

      <h3 className="admin-subsection-title">Emergency banner</h3>
      <div className="admin-grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Heading</span>
          <input
            className="admin-input"
            value={emergency.heading}
            onChange={(e) => patchEmergency("heading", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Description</span>
          <input
            className="admin-input"
            value={emergency.description}
            onChange={(e) => patchEmergency("description", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Button label</span>
          <input
            className="admin-input"
            value={emergency.ctaLabel}
            onChange={(e) => patchEmergency("ctaLabel", e.target.value)}
          />
          <span className="admin-field-help">
            Button dials the emergency phone above.
          </span>
        </label>
      </div>

      <h3 className="admin-subsection-title">Booking form text</h3>
      <div className="admin-grid">
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Section heading</span>
          <input
            className="admin-input"
            value={contact.heading}
            onChange={(e) => patchContact("heading", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Section description</span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={2}
            value={contact.description}
            onChange={(e) => patchContact("description", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Submit button label</span>
          <input
            className="admin-input"
            value={contact.bookButtonLabel}
            onChange={(e) => patchContact("bookButtonLabel", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Extra dropdown options (one per line)</span>
          <textarea
            className="admin-input admin-input--textarea"
            rows={3}
            value={contact.extraServiceOptions.join("\n")}
            onChange={(e) =>
              patchContact(
                "extraServiceOptions",
                e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
              )
            }
          />
          <span className="admin-field-help">
            Added after your services in the booking dropdown. &ldquo;Other&rdquo; reveals a free-text field.
          </span>
        </label>
      </div>

      <h3 className="admin-subsection-title">Footer labels</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span className="admin-field-label">Location label</span>
          <input
            className="admin-input"
            value={footer.locationLabel}
            onChange={(e) => patchFooter("locationLabel", e.target.value)}
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Phone label</span>
          <input
            className="admin-input"
            value={footer.phoneLabel}
            onChange={(e) => patchFooter("phoneLabel", e.target.value)}
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Copyright suffix</span>
          <input
            className="admin-input"
            value={footer.copyrightSuffix}
            onChange={(e) => patchFooter("copyrightSuffix", e.target.value)}
          />
          <span className="admin-field-help">
            Appears after the business name in the footer, e.g. &ldquo;All rights reserved.&rdquo;
          </span>
        </label>
      </div>
    </section>
  );
}
