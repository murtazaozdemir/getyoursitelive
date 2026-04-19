"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Car, ShieldCheck } from "lucide-react";
import { FieldErrors, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { services } from "@/data/site-content";
import { statTargets, whyUsValues } from "@/components/site/home.constants";
import { HomeFormValues } from "@/components/site/home.schema";

export function HeroSection({
  register,
  handleSubmit,
  errors,
  onSubmit,
}: {
  register: UseFormRegister<HomeFormValues>;
  handleSubmit: UseFormHandleSubmit<HomeFormValues>;
  errors: FieldErrors<HomeFormValues>;
  onSubmit: () => Promise<void>;
}) {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1800&q=80"
        alt="Mechanic inspecting engine bay in modern garage"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
        <div>
          <p className="mb-4 inline-block rounded-full bg-[var(--accent)] px-3 py-1 text-sm font-semibold text-[var(--accent-ink)]">
            Family-owned since 2009
          </p>
          <h1 className="text-5xl font-bold text-white md:text-7xl">Expert Care for Your Vehicle</h1>
          <p className="mt-5 max-w-xl text-lg text-white/90">
            Same-day service, clear communication, and repairs performed by ASE-certified technicians.
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg">
          <h2 className="mb-4 text-2xl font-semibold text-white">Request Service Today</h2>
          <form onSubmit={handleSubmit(() => onSubmit())} className="grid gap-3">
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
            </select>
            {errors.service && <FormError message="Please choose a service." />}
            <input type="date" {...register("date")} className="input" />
            {errors.date && <FormError message={errors.date.message ?? "Select a valid date."} />}
            <textarea {...register("message")} placeholder="Tell us what you're experiencing" className="input h-24" />
            <button className="mt-2 rounded-xl bg-[var(--accent)] py-3 font-semibold text-[var(--accent-ink)]">
              Book Service
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export function StatsSection({ counters }: { counters: number[] }) {
  return (
    <section id="stats" className="mx-auto grid max-w-7xl gap-4 px-4 py-16 md:grid-cols-4 md:px-8">
      {statTargets.map((item, index) => (
        <div key={item.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <Car className="mx-auto mb-3 h-6 w-6 text-[var(--accent)]" />
          <p className="text-3xl font-bold">{counters[index].toLocaleString()}{item.suffix}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{item.label}</p>
        </div>
      ))}
    </section>
  );
}

export function AboutSection() {
  return (
    <>
      <section id="about" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
        <div className="relative min-h-96 overflow-hidden rounded-2xl">
          <Image src="https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=1400&q=80" alt="Auto technicians in service bay" fill className="object-cover" />
        </div>
        <div>
          <h2 className="text-3xl font-bold">Precision Auto Care - Where Expertise Meets Honesty</h2>
          <p className="mt-4 text-[var(--muted)]">
            We are a family-operated repair facility trusted by Springfield drivers for over 15 years. Every recommendation includes photos, transparent pricing, and practical guidance.
          </p>
          <ol className="mt-6 grid gap-3">
            <li>1. Free digital inspections with photos and videos</li>
            <li>2. Written warranties on parts and labor</li>
            <li>3. No surprise pricing before work begins</li>
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:px-8">
        <div className="relative min-h-96 overflow-hidden rounded-2xl">
          <Image src="https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1400&q=80" alt="Mechanic team in workshop" fill className="object-cover" />
        </div>
        <div className="grid gap-4">
          {whyUsValues.map(([title, copy]) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-[var(--muted)]">{copy}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function ServicesSection({
  serviceTab,
  onServiceTabChange,
}: {
  serviceTab: string;
  onServiceTabChange: (tab: string) => void;
}) {
  const activeService = services.find((service) => service.id === serviceTab) ?? services[0];

  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h2 className="mb-6 text-3xl font-bold">Our Services</h2>
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <div className="flex gap-2 overflow-auto md:flex-col">
          {services.map((item) => (
            <button
              key={item.id}
              onClick={() => onServiceTabChange(item.id)}
              className={`rounded-xl border px-4 py-3 text-left ${serviceTab === item.id ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--border)]"}`}
            >
              {item.name}
            </button>
          ))}
        </div>
        <motion.div key={activeService.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <p className="inline-block rounded-full bg-[var(--accent)]/15 px-3 py-1 text-sm text-[var(--accent)]">{activeService.priceRange}</p>
          <h3 className="mt-3 text-2xl font-semibold">{activeService.name}</h3>
          <p className="mt-2 text-[var(--muted)]">{activeService.description}</p>
          <ul className="mt-4 grid gap-2">
            {activeService.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
                {feature}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

function FormError({ message }: { message: string }) {
  return <p className="text-sm text-rose-300">{message}</p>;
}
