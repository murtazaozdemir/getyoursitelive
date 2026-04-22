"use client";

import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { SectionBlock } from "@/components/editable/section-block";
import { OpenStatus } from "@/components/site/open-status";
import { HoursList } from "@/components/site/hours-list";
import { HomeFormValues } from "@/components/site/home.schema";

function FormError({ message }: { message: string }) {
  return <p className="text-sm text-rose-500">{message}</p>;
}

export function ContactSection({
  register,
  handleSubmit,
  errors,
  onSubmit,
  watch,
  submitted,
}: {
  register: UseFormRegister<HomeFormValues>;
  handleSubmit: UseFormHandleSubmit<HomeFormValues>;
  errors: FieldErrors<HomeFormValues>;
  onSubmit: (data: HomeFormValues) => Promise<void>;
  watch: UseFormWatch<HomeFormValues>;
  submitted?: boolean;
}) {
  const { businessInfo, contact, services } = useBusiness();
  const edit = useEditMode();

  function patchInfo<K extends keyof typeof businessInfo>(key: K, value: (typeof businessInfo)[K]) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }

  function patchContact<K extends keyof typeof contact>(key: K, value: (typeof contact)[K]) {
    edit?.updateField("contact", { ...contact, [key]: value });
  }

  const mapsEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(businessInfo.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="contact" className="section-shell mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
      <SectionBlock name="Booking" visibilityKey="showBooking">
        <div>
          <h2 className="section-title text-3xl font-bold">
            {edit ? (
              <EditableText
                value={contact.heading}
                onCommit={(v) => patchContact("heading", v)}
                placeholder="Request Service"
              />
            ) : (
              contact.heading
            )}
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            {edit ? (
              <EditableText
                value={contact.description}
                onCommit={(v) => patchContact("description", v)}
                multiline
                placeholder="Short pitch about the booking form"
              />
            ) : (
              contact.description
            )}
          </p>
          {edit ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--border)] p-6 text-sm text-[var(--muted)]">
              <p>
                📋 Booking form (shown to customers — not editable here).
                Submissions are routed to <strong>{businessInfo.email || "your email"}</strong>.
              </p>
              <p className="mt-4">
                Submit button label:{" "}
                <strong>
                  <EditableText
                    value={contact.bookButtonLabel}
                    onCommit={(v) => patchContact("bookButtonLabel", v)}
                    placeholder="Book Service"
                  />
                </strong>
              </p>
              <div className="mt-4">
                <p className="mb-2">Dropdown extras (appended after your services list):</p>
                <ul className="ml-4 list-disc">
                  <EditableList
                    items={contact.extraServiceOptions}
                    keyOf={(_, i) => `extra-${i}`}
                    addLabel="Add option"
                    onAdd={() =>
                      patchContact("extraServiceOptions", [
                        ...contact.extraServiceOptions,
                        "New option",
                      ])
                    }
                    onRemove={(i) =>
                      patchContact(
                        "extraServiceOptions",
                        contact.extraServiceOptions.filter((_, idx) => idx !== i),
                      )
                    }
                    onMove={(i, dir) =>
                      patchContact(
                        "extraServiceOptions",
                        moveInArray(contact.extraServiceOptions, i, dir),
                      )
                    }
                    renderItem={(opt, i) => (
                      <li>
                        <EditableText
                          value={opt}
                          onCommit={(v) => {
                            const next = [...contact.extraServiceOptions];
                            next[i] = v;
                            patchContact("extraServiceOptions", next);
                          }}
                          placeholder="Option label"
                        />
                      </li>
                    )}
                  />
                </ul>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Tip: an option named exactly &ldquo;Other&rdquo; reveals a text input so
                  customers can describe what they need.
                </p>
              </div>
            </div>
          ) : submitted ? (
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">&#10003; Request received!</p>
              <p className="mt-2 text-[var(--muted)]">
                We&rsquo;ll confirm your appointment by phone or email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="premium-form mt-6 grid gap-3">
              <input {...register("name")} placeholder="Full name" className="input" />
              {errors.name && <FormError message="Enter a valid name (2+ letters)." />}
              <input {...register("email")} placeholder="Email" className="input" />
              {errors.email && <FormError message="Enter a valid email address." />}
              <input {...register("phone")} placeholder="Phone" className="input" />
              {errors.phone && <FormError message={errors.phone.message ?? "Phone is required."} />}
              <select {...register("service")} className="input">
                <option value="">Select service</option>
                {services.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
                {contact.extraServiceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.service && <FormError message="Please choose a service." />}
              {watch("service") === "Other" && (
                <>
                  <input
                    {...register("serviceOther")}
                    placeholder="What service do you need?"
                    className="input"
                  />
                  {errors.serviceOther && (
                    <FormError
                      message={errors.serviceOther.message ?? "Please describe the service you need."}
                    />
                  )}
                </>
              )}
              <input type="date" {...register("date")} className="input" />
              {errors.date && <FormError message={errors.date.message ?? "Select a valid date."} />}
              <textarea {...register("message")} placeholder="Describe the issue" className="input h-24" />
              <button className="btn-primary mt-2">{contact.bookButtonLabel}</button>
            </form>
          )}
        </div>
      </SectionBlock>
      <SectionBlock name="Contact Info" visibilityKey="showContactInfo">
        <div>
          <SectionBlock name="Map" visibilityKey="showMap">
            <iframe
              title={`${businessInfo.name} Map`}
              className="h-80 w-full rounded-2xl border border-[var(--border)]"
              src={mapsEmbed}
              loading="lazy"
            />
          </SectionBlock>
          <div className="mt-5 space-y-4 text-sm">
            <p>
              {edit ? (
                <EditableText
                  value={businessInfo.address}
                  onCommit={(v) => patchInfo("address", v)}
                  placeholder="Street address"
                />
              ) : (
                businessInfo.address
              )}
            </p>
            {edit && (
              <p className="text-[var(--muted)]">
                Phone:{" "}
                <EditableText
                  value={businessInfo.phone}
                  onCommit={(v) => patchInfo("phone", v)}
                  placeholder="(000) 000-0000"
                />
              </p>
            )}
            {edit && (
              <p className="text-[var(--muted)]">
                Email:{" "}
                <EditableText
                  value={businessInfo.email}
                  onCommit={(v) => patchInfo("email", v)}
                  placeholder="you@shop.com"
                />
              </p>
            )}
            <OpenStatus />
            <SectionBlock name="Hours" visibilityKey="showHours">
              <HoursList className="mt-4" />
            </SectionBlock>
          </div>
        </div>
      </SectionBlock>
    </section>
  );
}
