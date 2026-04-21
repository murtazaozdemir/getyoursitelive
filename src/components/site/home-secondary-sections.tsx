"use client";

import Image from "next/image";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { useBusiness } from "@/lib/business-context";
import { useEditMode } from "@/lib/edit-mode-context";
import { processSteps } from "@/components/site/home.constants";
import { EditableText } from "@/components/editable/editable-text";
import { EditableList, moveInArray } from "@/components/editable/editable-list";
import { EditableImage } from "@/components/editable/editable-image";
import { SectionBlock } from "@/components/editable/section-block";
import { SectionH2 } from "@/components/site/section-h2";
import type {
  FaqItem,
  PricingCard,
  TeamMember,
  Testimonial,
} from "@/types/site";
import { HomeFormValues } from "@/components/site/home.schema";
import { OpenStatus } from "@/components/site/open-status";
import { HoursList } from "@/components/site/hours-list";

function blankMember(): TeamMember {
  return {
    name: "New team member",
    role: "Technician",
    experience: "5+ years",
    specialty: "",
    image: "https://images.pexels.com/photos/2182972/pexels-photo-2182972.jpeg?auto=compress&cs=tinysrgb&w=800",
  };
}

export function TechniciansSection() {
  const { teamMembers } = useBusiness();
  const edit = useEditMode();

  function patchMember(i: number, patch: Partial<TeamMember>) {
    if (!edit) return;
    const next = [...teamMembers];
    next[i] = { ...next[i], ...patch };
    edit.updateField("teamMembers", next);
  }

  return (
    <SectionBlock name="Team" visibilityKey="showTeam" isEmpty={teamMembers.length === 0}>
    <section id="technicians" className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="team" />
      </h2>
      <div className="grid gap-5 md:grid-cols-4">
        {edit ? (
          <EditableList
            items={teamMembers}
            keyOf={(_, i) => `tm-${i}`}
            addLabel="Add team member"
            onAdd={() => edit.updateField("teamMembers", [...teamMembers, blankMember()])}
            onRemove={(i) =>
              edit.updateField("teamMembers", teamMembers.filter((_, idx) => idx !== i))
            }
            onMove={(i, dir) =>
              edit.updateField("teamMembers", moveInArray(teamMembers, i, dir))
            }
            renderItem={(member, i) => (
              <div className="content-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                <EditableImage
                  value={member.image}
                  onCommit={(url) => patchMember(i, { image: url })}
                  uploadLabel={member.image ? "Replace photo" : "Upload photo"}
                  className="team-image-frame relative h-64 overflow-hidden block"
                >
                  {member.image && (
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="team-image object-cover transition duration-500 group-hover:scale-105"
                    />
                  )}
                </EditableImage>
                <div className="p-4">
                  <p className="font-semibold">
                    <EditableText
                      value={member.name}
                      onCommit={(v) => patchMember(i, { name: v })}
                      placeholder="Name"
                    />
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    <EditableText
                      value={member.role}
                      onCommit={(v) => patchMember(i, { role: v })}
                      placeholder="Role"
                    />
                  </p>
                  <p className="mt-2 text-xs">
                    <EditableText
                      value={member.experience}
                      onCommit={(v) => patchMember(i, { experience: v })}
                      placeholder="Experience"
                    />
                    {" - "}
                    <EditableText
                      value={member.specialty}
                      onCommit={(v) => patchMember(i, { specialty: v })}
                      placeholder="Specialty"
                    />
                  </p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    Image URL (optional, or use upload above):{" "}
                    <EditableText
                      value={member.image}
                      onCommit={(v) => patchMember(i, { image: v })}
                      placeholder="https://…"
                    />
                  </p>
                </div>
              </div>
            )}
          />
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.name}
              className="content-card group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]"
            >
              <div className="team-image-frame relative h-64 overflow-hidden">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="team-image object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-[var(--muted)]">{member.role}</p>
                <p className="mt-2 text-xs">
                  {member.experience} - {member.specialty}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
    </SectionBlock>
  );
}

function blankTestimonial(): Testimonial {
  return { name: "New customer", vehicle: "Vehicle", quote: "Great service." };
}

export function TestimonialsSection({
  testimonialIndex,
  onPrevious,
  onNext,
}: {
  testimonialIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { testimonials } = useBusiness();
  const edit = useEditMode();

  function patchT(i: number, patch: Partial<Testimonial>) {
    if (!edit) return;
    const next = [...testimonials];
    next[i] = { ...next[i], ...patch };
    edit.updateField("testimonials", next);
  }

  // In edit mode: show all testimonials stacked so the owner can edit each.
  if (edit) {
    return (
      <SectionBlock name="Testimonials" visibilityKey="showTestimonials" isEmpty={false}>
      <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="testimonials" />
      </h2>
        <div className="grid gap-4">
          <EditableList
            items={testimonials}
            keyOf={(_, i) => `tt-${i}`}
            addLabel="Add testimonial"
            onAdd={() =>
              edit.updateField("testimonials", [...testimonials, blankTestimonial()])
            }
            onRemove={(i) =>
              edit.updateField(
                "testimonials",
                testimonials.filter((_, idx) => idx !== i),
              )
            }
            onMove={(i, dir) =>
              edit.updateField("testimonials", moveInArray(testimonials, i, dir))
            }
            renderItem={(t, i) => (
              <div className="content-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <div className="mb-3 flex gap-1 text-[var(--accent)]">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <Star key={star} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-lg">
                  &ldquo;
                  <EditableText
                    value={t.quote}
                    onCommit={(v) => patchT(i, { quote: v })}
                    multiline
                    placeholder="What the customer said"
                  />
                  &rdquo;
                </p>
                <p className="mt-4 font-semibold">
                  <EditableText
                    value={t.name}
                    onCommit={(v) => patchT(i, { name: v })}
                    placeholder="Customer name"
                  />
                  {" - "}
                  <EditableText
                    value={t.vehicle}
                    onCommit={(v) => patchT(i, { vehicle: v })}
                    placeholder="Vehicle"
                  />
                </p>
              </div>
            )}
          />
        </div>
      </section>
      </SectionBlock>
    );
  }

  // View mode: original carousel
  const current = testimonials[testimonialIndex] ?? testimonials[0];
  return (
    <SectionBlock name="Testimonials" visibilityKey="showTestimonials" isEmpty={testimonials.length === 0}>
    <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="testimonials" />
      </h2>
      <div className="content-card testimonial-card rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-3 flex gap-1 text-[var(--accent)]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-current" />
          ))}
        </div>
        <p className="testimonial-quote text-lg">&ldquo;{current.quote}&rdquo;</p>
        <p className="mt-4 font-semibold">
          {current.name} - {current.vehicle}
        </p>
        <div className="mt-4 flex gap-2">
          <button className="icon-button" onClick={onPrevious} aria-label="Previous testimonial">
            <ChevronLeft />
          </button>
          <button className="icon-button" onClick={onNext} aria-label="Next testimonial">
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
    </SectionBlock>
  );
}

export function EmergencyBanner() {
  const { businessInfo, emergency } = useBusiness();
  const edit = useEditMode();

  function patchEmergency<K extends keyof typeof emergency>(
    key: K,
    value: (typeof emergency)[K],
  ) {
    edit?.updateField("emergency", { ...emergency, [key]: value });
  }

  return (
    <SectionBlock
      name="Emergency Banner"
      visibilityKey="showEmergencyBanner"
      isEmpty={!businessInfo.emergencyPhone}
    >
    <section className="bg-[var(--accent)] py-10 text-[var(--accent-ink)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        <div>
          <h3 className="text-2xl font-bold">
            {edit ? (
              <EditableText
                value={emergency.heading}
                onCommit={(v) => patchEmergency("heading", v)}
                placeholder="Emergency heading"
              />
            ) : (
              emergency.heading
            )}
          </h3>
          <p>
            {edit ? (
              <EditableText
                value={emergency.description}
                onCommit={(v) => patchEmergency("description", v)}
                multiline
                placeholder="Emergency description"
              />
            ) : (
              emergency.description
            )}
          </p>
        </div>
        {edit ? (
          <span className="rounded-full bg-black/20 px-5 py-3 font-semibold">
            <EditableText
              value={emergency.ctaLabel}
              onCommit={(v) => patchEmergency("ctaLabel", v)}
              placeholder="Button label"
            />
          </span>
        ) : (
          <a
            href={`tel:${businessInfo.emergencyPhone}`}
            className="rounded-full bg-black/20 px-5 py-3 font-semibold"
          >
            {emergency.ctaLabel}
          </a>
        )}
      </div>
    </section>
    </SectionBlock>
  );
}

function blankPricing(): PricingCard {
  return {
    id: `price-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "New service",
    price: "$0",
    note: "",
    popular: false,
  };
}

export function PricingSection() {
  const { pricing, sectionTitles } = useBusiness();
  const edit = useEditMode();

  function patchCard(i: number, patch: Partial<PricingCard>) {
    if (!edit) return;
    const next = [...pricing];
    next[i] = { ...next[i], ...patch };
    edit.updateField("pricing", next);
  }

  return (
    <SectionBlock name="Pricing" visibilityKey="showPricing" isEmpty={pricing.length === 0}>
    <section className="section-shell mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="pricing" />
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {edit ? (
          <EditableList
            items={pricing}
            keyOf={(c) => c.id}
            addLabel="Add pricing card"
            onAdd={() => edit.updateField("pricing", [...pricing, blankPricing()])}
            onRemove={(i) =>
              edit.updateField("pricing", pricing.filter((_, idx) => idx !== i))
            }
            onMove={(i, dir) =>
              edit.updateField("pricing", moveInArray(pricing, i, dir))
            }
            renderItem={(card, i) => (
              <div
                className={`pricing-card rounded-2xl border p-6 ${card.popular ? "border-[var(--accent)] shadow-lg card-popular" : "border-[var(--border)]"}`}
              >
                <p className="text-sm text-[var(--muted)]">
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={card.popular}
                      onChange={(e) => patchCard(i, { popular: e.target.checked })}
                    />
                    {card.popular
                      ? sectionTitles.pricingPopular
                      : "Mark as popular"}
                  </label>
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  <EditableText
                    value={card.name}
                    onCommit={(v) => patchCard(i, { name: v })}
                    placeholder="Service name"
                  />
                </h3>
                <p className="mt-4 text-4xl font-bold">
                  <EditableText
                    value={card.price}
                    onCommit={(v) => patchCard(i, { price: v })}
                    placeholder="$0"
                  />
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  <EditableText
                    value={card.note}
                    onCommit={(v) => patchCard(i, { note: v })}
                    multiline
                    placeholder="Short note"
                  />
                </p>
              </div>
            )}
          />
        ) : (
          pricing.map((card) => (
            <div
              key={card.id}
              className={`pricing-card rounded-2xl border p-6 ${card.popular ? "border-[var(--accent)] shadow-lg card-popular" : "border-[var(--border)]"}`}
            >
              <p className="pricing-kicker text-sm text-[var(--muted)]">
                {card.popular ? sectionTitles.pricingPopular : sectionTitles.pricingRegular}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{card.name}</h3>
              <p className="pricing-price mt-4 text-4xl font-bold">{card.price}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{card.note}</p>
            </div>
          ))
        )}
      </div>
    </section>
    </SectionBlock>
  );
}

export function ProcessSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-6 text-3xl font-bold">How It Works</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {processSteps.map((step) => (
          <div key={step} className="rounded-2xl border border-[var(--border)] p-5">
            <Calendar className="mb-3 h-6 w-6 text-[var(--accent)]" />
            <p className="font-semibold">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function blankFaq(): FaqItem {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    question: "New question?",
    answer: "Answer to the question.",
  };
}

export function FaqSection({
  faqOpen,
  onToggle,
}: {
  faqOpen: number;
  onToggle: (index: number) => void;
}) {
  const { faqs } = useBusiness();
  const edit = useEditMode();

  function patchFaq(i: number, patch: Partial<FaqItem>) {
    if (!edit) return;
    const next = [...faqs];
    next[i] = { ...next[i], ...patch };
    edit.updateField("faqs", next);
  }

  return (
    <SectionBlock name="FAQ" visibilityKey="showFaq" isEmpty={faqs.length === 0}>
    <section className="section-shell mx-auto max-w-4xl px-4 py-16">
      <h2 className="section-title mb-6 text-3xl font-bold">
        <SectionH2 titleKey="faq" />
      </h2>
      {edit ? (
        <EditableList
          items={faqs}
          keyOf={(f) => f.id}
          addLabel="Add question"
          onAdd={() => edit.updateField("faqs", [...faqs, blankFaq()])}
          onRemove={(i) =>
            edit.updateField("faqs", faqs.filter((_, idx) => idx !== i))
          }
          onMove={(i, dir) => edit.updateField("faqs", moveInArray(faqs, i, dir))}
          renderItem={(faq, i) => (
            <div className="content-card mb-3 rounded-xl border border-[var(--border)] p-4">
              <p className="font-semibold">
                <EditableText
                  value={faq.question}
                  onCommit={(v) => patchFaq(i, { question: v })}
                  placeholder="Question"
                />
              </p>
              <p className="mt-2 text-[var(--muted)]">
                <EditableText
                  value={faq.answer}
                  onCommit={(v) => patchFaq(i, { answer: v })}
                  multiline
                  placeholder="Answer"
                />
              </p>
            </div>
          )}
        />
      ) : (
        faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="content-card mb-3 rounded-xl border border-[var(--border)]"
          >
            <button
              className="flex w-full items-center justify-between p-4 text-left"
              onClick={() => onToggle(index)}
            >
              {faq.question}
              <ChevronDown
                className={`transition-transform ${faqOpen === index ? "rotate-180" : ""}`}
              />
            </button>
            {faqOpen === index && (
              <p className="px-4 pb-4 text-[var(--muted)]">{faq.answer}</p>
            )}
          </div>
        ))
      )}
    </section>
    </SectionBlock>
  );
}

export function ContactSection({
  register,
  handleSubmit,
  errors,
  onSubmit,
  watch,
}: {
  register: UseFormRegister<HomeFormValues>;
  handleSubmit: UseFormHandleSubmit<HomeFormValues>;
  errors: FieldErrors<HomeFormValues>;
  onSubmit: () => Promise<void>;
  watch: UseFormWatch<HomeFormValues>;
}) {
  const { businessInfo, contact, services } = useBusiness();
  const edit = useEditMode();

  function patchInfo<K extends keyof typeof businessInfo>(
    key: K,
    value: (typeof businessInfo)[K],
  ) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }

  function patchContact<K extends keyof typeof contact>(
    key: K,
    value: (typeof contact)[K],
  ) {
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
              <p className="mb-2">
                Dropdown extras (appended after your services list):
              </p>
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
              <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                Tip: an option named exactly &ldquo;Other&rdquo; reveals a
                text input so customers can describe what they need.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(() => onSubmit())} className="premium-form mt-6 grid gap-3">
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
            <button className="btn-primary mt-2">
              {contact.bookButtonLabel}
            </button>
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
            {edit ? (
              <p className="text-[var(--muted)]">
                Phone:{" "}
                <EditableText
                  value={businessInfo.phone}
                  onCommit={(v) => patchInfo("phone", v)}
                  placeholder="(000) 000-0000"
                />
              </p>
            ) : null}
            {edit ? (
              <p className="text-[var(--muted)]">
                Email:{" "}
                <EditableText
                  value={businessInfo.email}
                  onCommit={(v) => patchInfo("email", v)}
                  placeholder="you@shop.com"
                />
              </p>
            ) : null}
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

export function FooterSection() {
  const { businessInfo, footer } = useBusiness();
  const edit = useEditMode();
  const year = new Date().getFullYear();

  function patchInfo<K extends keyof typeof businessInfo>(
    key: K,
    value: (typeof businessInfo)[K],
  ) {
    edit?.updateField("businessInfo", { ...businessInfo, [key]: value });
  }
  function patchFooter<K extends keyof typeof footer>(
    key: K,
    value: (typeof footer)[K],
  ) {
    edit?.updateField("footer", { ...footer, [key]: value });
  }

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-6 text-sm md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-8 md:px-8">
        <div>
          <span className="font-semibold">
            {edit ? (
              <EditableText
                value={businessInfo.name}
                onCommit={(v) => patchInfo("name", v)}
                placeholder="Shop name"
              />
            ) : (
              businessInfo.name
            )}
          </span>
          {" — "}
          <span className="text-[var(--muted)]">
            {edit ? (
              <EditableText
                value={businessInfo.tagline}
                onCommit={(v) => patchInfo("tagline", v)}
                placeholder="Tagline"
              />
            ) : (
              businessInfo.tagline
            )}
          </span>
        </div>
        <div className="text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">
            {edit ? (
              <EditableText
                value={footer.locationLabel}
                onCommit={(v) => patchFooter("locationLabel", v)}
                placeholder="Location"
              />
            ) : (
              footer.locationLabel
            )}
          </span>
          {": "}
          {edit ? (
            <EditableText
              value={businessInfo.address}
              onCommit={(v) => patchInfo("address", v)}
              placeholder="Address"
            />
          ) : (
            businessInfo.address
          )}
          {" · "}
          <span className="font-semibold text-[var(--text)]">
            {edit ? (
              <EditableText
                value={footer.phoneLabel}
                onCommit={(v) => patchFooter("phoneLabel", v)}
                placeholder="Phone"
              />
            ) : (
              footer.phoneLabel
            )}
          </span>
          {": "}
          {edit ? (
            <EditableText
              value={businessInfo.phone}
              onCommit={(v) => patchInfo("phone", v)}
              placeholder="Phone number"
            />
          ) : (
            <a href={`tel:${businessInfo.phone}`} className="hover:text-[var(--accent)]">
              {businessInfo.phone}
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-sm text-[var(--muted)]">
        © {year} {businessInfo.name}.{" "}
        {edit ? (
          <EditableText
            value={footer.copyrightSuffix}
            onCommit={(v) => patchFooter("copyrightSuffix", v)}
            placeholder="All rights reserved."
          />
        ) : (
          footer.copyrightSuffix
        )}
      </div>
    </footer>
  );
}

function FormError({ message }: { message: string }) {
  return <p className="text-sm text-rose-500">{message}</p>;
}
