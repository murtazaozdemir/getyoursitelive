"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBusiness } from "@/lib/business-context";
import { HomeFormValues, homeFormSchema } from "@/components/site/home.schema";
import { BackToTopButton } from "@/components/site/back-to-top";
import { LoadingOverlay, SiteHeader } from "@/components/site/home-chrome";
import {
  AboutSection,
  HeroSection,
  ServicesSection,
  StatsSection,
} from "@/components/site/home-primary-sections";
import {
  ContactSection,
  EmergencyBanner,
  FaqSection,
  FooterSection,
  PricingSection,
  TechniciansSection,
  TestimonialsSection,
} from "@/components/site/home-secondary-sections";
import { DealsSection } from "@/components/site/deals-section";
import { useThemeStore } from "@/store/theme-store";

export function HomePage() {
  const { testimonials, services, stats, theme: businessTheme } = useBusiness();
  const { theme, setTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serviceTab, setServiceTab] = useState(services[0]?.id ?? "");

  // Seed the theme store from the business's DB theme on first render.
  // Runs once per page load; user can still override via the dropdown.
  useEffect(() => {
    setTheme(businessTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessTheme]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState<number[]>(() => stats.map(() => 0));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<HomeFormValues>({
    resolver: zodResolver(homeFormSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (testimonials.length === 0) return;
    const id = window.setInterval(() => {
      setTestimonialIndex((index) => (index + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [testimonials.length]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setLoading(false), 700);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const statsEl = document.getElementById("stats");
    if (!statsEl || stats.length === 0) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 2000;
        const start = performance.now();
        const animate = (time: number) => {
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setCounters(stats.map((item) => Math.round(item.value * eased)));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(statsEl);
    return () => observer.disconnect();
  }, [stats]);

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset();
    alert("Thanks! Your booking request has been received.");
  };

  return (
    <div
      data-theme={theme}
      className="site-container premium-refresh bg-[var(--bg)] text-[var(--text)] transition-theme"
    >
      <LoadingOverlay loading={loading} />
      <SiteHeader
        theme={theme}
        onThemeChange={setTheme}
        mobileOpen={mobileOpen}
        onMobileToggle={setMobileOpen}
      />
      {/*
        Flow rationale (top → bottom):
          1. Hero             — promise + CTA
          2. About            — who we are, why trust us
          3. Stats            — numeric proof of the About claims
          4. Services         — what we do
          5. Pricing          — transparent cost (pairs with services)
          6. Technicians      — faces build trust
          7. Testimonials     — social proof
          8. FAQ              — answers objections
          9. Emergency banner — urgency push just before CTA
         10. Contact / booking — the conversion
         11. Footer
      */}
      <HeroSection />
      <AboutSection />
      <StatsSection counters={counters} />
      <ServicesSection serviceTab={serviceTab} onServiceTabChange={setServiceTab} />
      <DealsSection />
      <PricingSection />
      <TechniciansSection />
      <TestimonialsSection
        testimonialIndex={testimonialIndex}
        onPrevious={() => setTestimonialIndex((i) => (i - 1 + Math.max(testimonials.length, 1)) % Math.max(testimonials.length, 1))}
        onNext={() => setTestimonialIndex((i) => (i + 1) % Math.max(testimonials.length, 1))}
      />
      <FaqSection faqOpen={faqOpen} onToggle={(index) => setFaqOpen(index === faqOpen ? -1 : index)} />
      <EmergencyBanner />
      <ContactSection
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
        watch={watch}
      />
      <FooterSection />
      <BackToTopButton show={showTop} />
    </div>
  );
}
