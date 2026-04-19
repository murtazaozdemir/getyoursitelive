"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { testimonials } from "@/data/site-content";
import { statTargets } from "@/components/site/home.constants";
import { HomeFormValues, homeFormSchema } from "@/components/site/home.schema";
import { BackToTopButton } from "@/components/site/back-to-top";
import { LoadingOverlay, SiteHeader, Topbar } from "@/components/site/home-chrome";
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
  ProcessSection,
  TechniciansSection,
  TestimonialsSection,
} from "@/components/site/home-secondary-sections";
import { useThemeStore } from "@/store/theme-store";

export function HomePage() {
  const { theme, setTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [serviceTab, setServiceTab] = useState("diagnostic");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counters, setCounters] = useState<number[]>([0, 0, 0, 0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<HomeFormValues>({
    resolver: zodResolver(homeFormSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setTestimonialIndex((index) => (index + 1) % testimonials.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

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
    const stats = document.getElementById("stats");
    if (!stats) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const duration = 2000;
        const start = performance.now();
        const animate = (time: number) => {
          const progress = Math.min((time - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          setCounters(statTargets.map((item) => Math.round(item.value * eased)));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(stats);
    return () => observer.disconnect();
  }, []);

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    reset();
    alert("Thanks! Your booking request has been received.");
  };

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] transition-theme">
      <LoadingOverlay loading={loading} />
      <Topbar />
      <SiteHeader
        theme={theme}
        onThemeChange={setTheme}
        mobileOpen={mobileOpen}
        onMobileToggle={setMobileOpen}
      />
      <HeroSection
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        onSubmit={onSubmit}
      />
      <StatsSection counters={counters} />
      <AboutSection />
      <ServicesSection serviceTab={serviceTab} onServiceTabChange={setServiceTab} />
      <TechniciansSection />
      <TestimonialsSection
        testimonialIndex={testimonialIndex}
        onPrevious={() => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
        onNext={() => setTestimonialIndex((i) => (i + 1) % testimonials.length)}
      />
      <EmergencyBanner />
      <PricingSection />
      <ProcessSection />
      <FaqSection faqOpen={faqOpen} onToggle={(index) => setFaqOpen(index === faqOpen ? -1 : index)} />
      <ContactSection />
      <FooterSection />
      <BackToTopButton show={showTop} />
    </div>
  );
}
