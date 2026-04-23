"use client";

import { useEffect, useState } from "react";
import { ContactForm } from "@/components/contact-form";

export function ContactModal({
  label = "Get in touch →",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-[#111827] px-8 pb-8 pt-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Contact us</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/30 transition-colors hover:bg-white/10 hover:text-white/70"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <ContactForm />
          </div>
        </div>
      )}
    </>
  );
}
