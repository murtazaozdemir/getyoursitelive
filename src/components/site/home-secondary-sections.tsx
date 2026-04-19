"use client";

import Image from "next/image";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { businessInfo, services, teamMembers, testimonials } from "@/data/site-content";
import { faqQuestions, pricingCards, processSteps } from "@/components/site/home.constants";

export function TechniciansSection() {
  return (
    <section id="technicians" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-6 text-3xl font-bold">Meet Our Technicians</h2>
      <div className="grid gap-5 md:grid-cols-4">
        {teamMembers.map((member) => (
          <div key={member.name} className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="relative h-64 overflow-hidden">
              <Image src={member.image} alt={member.name} fill className="object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div className="p-4">
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-[var(--muted)]">{member.role}</p>
              <p className="mt-2 text-xs">{member.experience} - {member.specialty}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
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
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-6 text-3xl font-bold">What Customers Say</h2>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="mb-3 flex gap-1 text-[var(--accent)]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
        <p className="text-lg">&ldquo;{testimonials[testimonialIndex].quote}&rdquo;</p>
        <p className="mt-4 font-semibold">{testimonials[testimonialIndex].name} - {testimonials[testimonialIndex].vehicle}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={onPrevious} aria-label="Previous testimonial"><ChevronLeft /></button>
          <button onClick={onNext} aria-label="Next testimonial"><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
}

export function EmergencyBanner() {
  return (
    <section className="bg-[var(--accent)] py-10 text-[var(--accent-ink)]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
        <div>
          <h3 className="text-2xl font-bold">Car Won&apos;t Start? We&apos;re Here 24/7.</h3>
          <p>Emergency towing, after-hours repairs, and loaner car options available.</p>
        </div>
        <a href={`tel:${businessInfo.emergencyPhone}`} className="rounded-full bg-black/20 px-5 py-3 font-semibold">
          Call Emergency Line
        </a>
      </div>
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-6 text-3xl font-bold">Transparent Pricing</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {pricingCards.map((card) => (
          <div key={card.name} className={`rounded-2xl border p-6 ${card.popular ? "border-[var(--accent)] shadow-lg" : "border-[var(--border)]"}`}>
            <p className="text-sm text-[var(--muted)]">{card.popular ? "Popular" : "No surprises"}</p>
            <h3 className="mt-2 text-xl font-semibold">{card.name}</h3>
            <p className="mt-4 text-4xl font-bold">{card.price}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{card.note}</p>
          </div>
        ))}
      </div>
    </section>
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

export function FaqSection({
  faqOpen,
  onToggle,
}: {
  faqOpen: number;
  onToggle: (index: number) => void;
}) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h2 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h2>
      {faqQuestions.map((question, index) => (
        <div key={question} className="mb-3 rounded-xl border border-[var(--border)]">
          <button className="flex w-full items-center justify-between p-4 text-left" onClick={() => onToggle(index)}>
            {question}
            <ChevronDown className={`transition-transform ${faqOpen === index ? "rotate-180" : ""}`} />
          </button>
          {faqOpen === index && (
            <p className="px-4 pb-4 text-[var(--muted)]">
              {index === 2
                ? "Yes. We service domestic, Asian, and European vehicles including late-model hybrids."
                : "Absolutely. Our team will walk you through timing, pricing, and options before work begins."}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
      <div>
        <h2 className="text-3xl font-bold">Contact & Booking</h2>
        <p className="mt-3 text-[var(--muted)]">Call {businessInfo.phone} or send us your service request any time.</p>
        <ul className="mt-5 space-y-2 text-sm">
          <li>{businessInfo.address}</li>
          <li>{businessInfo.hours}</li>
          <li className="font-semibold text-emerald-600">Currently Open</li>
        </ul>
      </div>
      <iframe
        title="Precision Auto Care Map"
        className="h-80 w-full rounded-2xl border border-[var(--border)]"
        src="https://maps.google.com/maps?q=Springfield%20IL&t=&z=13&ie=UTF8&iwloc=&output=embed"
        loading="lazy"
      />
    </section>
  );
}

export function FooterSection() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-semibold">{businessInfo.name}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{businessInfo.tagline}</p>
        </div>
        <div>
          <p className="font-semibold">Hours</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{businessInfo.hours}</p>
        </div>
        <div>
          <p className="font-semibold">Services</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">{services.slice(0, 6).map((service) => <li key={service.id}>{service.name}</li>)}</ul>
        </div>
        <div>
          <p className="font-semibold">Newsletter</p>
          <input className="input mt-3" placeholder="Email address" />
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-4 text-center text-sm text-[var(--muted)]">
        © 2024 Precision Auto Care. All rights reserved.
      </div>
    </footer>
  );
}
