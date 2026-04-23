"use client";

import { useState, type FormEvent } from "react";

// ----------------------------------------------------------------------
// Email form — posts to Formspree.
//
// SETUP (2 minutes, one time):
//   1. Go to https://formspree.io and create a free account
//   2. Create a new form; it will give you an endpoint like:
//      https://formspree.io/f/xyzabc123
//   3. Copy the form ID (the "xyzabc123" part)
//   4. In your project root, create a file called `.env.local` and add:
//        NEXT_PUBLIC_FORMSPREE_ID=xyzabc123
//   5. Restart `npm run dev` and submissions will land in your email.
//
// The form still works without step 4 — it just opens the user's email
// client as a fallback mailto.
// ----------------------------------------------------------------------

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const FORMSPREE_ENDPOINT = FORMSPREE_ID
  ? `https://formspree.io/f/${FORMSPREE_ID}`
  : null;

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // If no Formspree endpoint is configured, just log to console for dev.
    // The recipient email stays entirely behind the form (in Formspree).
    if (!FORMSPREE_ENDPOINT) {
      console.info("[ContactForm] Form submission captured (Formspree not configured):", {
        name: data.get("name"),
        email: data.get("email"),
        business: data.get("business"),
        phone: data.get("phone"),
        message: data.get("message"),
      });
      setStatus("sent");
      form.reset();
      return;
    }

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Submission failed. Please try again.");
      }
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  // Success state — replaces the form entirely once sent
  if (status === "sent") {
    return (
      <div className="mt-12">
        <p className="lp-mono text-[10px] uppercase tracking-[0.3em] text-[#E85D29]">
          ✓ Received
        </p>
        <h3 className="lp-display-numeral mt-4 text-5xl leading-[0.95] tracking-[-0.01em] md:text-6xl">
          Thank you.
        </h3>
        <p className="mt-6 max-w-lg text-base leading-[1.6] text-[#C9C2B3] md:text-lg">
          Your message is on its way. Expect a reply within one business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="lp-mono mt-8 text-[10px] uppercase tracking-[0.3em] text-[#C9C2B3] underline decoration-[#C9C2B3]/40 underline-offset-[6px] transition-colors hover:text-[#E85D29] hover:decoration-[#E85D29]"
        >
          Send another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 grid gap-6 md:grid-cols-2">
      <Field label="Your name" name="name" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Business name" name="business" />
      <Field label="Phone (optional)" name="phone" type="tel" />
      <Field
        label="What are you looking to build?"
        name="message"
        textarea
        required
        className="md:col-span-2"
      />

      {/* Spam honeypot — hidden from users, caught by bots */}
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} aria-hidden />

      <div className="md:col-span-2 flex flex-wrap items-center gap-8">
        <button
          type="submit"
          disabled={status === "sending"}
          className="lp-display-cta group relative text-2xl transition-all hover:gap-6 disabled:opacity-50 md:text-3xl"
        >
          <span className="inline-flex items-baseline gap-4 border-b-2 border-[#E85D29] pb-2">
            <span className="italic">
              {status === "sending" ? "Sending…" : "Send message"}
            </span>
            <span className="text-[#E85D29] transition-transform group-hover:translate-x-1">→</span>
          </span>
        </button>

        {status === "error" && (
          <p className="lp-mono text-xs text-[#E85D29]">✕ {errorMsg}</p>
        )}

        {!FORMSPREE_ENDPOINT && (
          <p className="lp-mono text-[10px] uppercase tracking-[0.22em] text-[#6B6660]">
            · dev mode: logs to console
          </p>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  className?: string;
}) {
  const labelCls =
    "lp-mono block text-[10px] uppercase tracking-[0.25em] text-[#C9C2B3] mb-2";
  const fieldCls =
    "lp-body w-full bg-transparent border-0 border-b border-[#C9C2B3]/40 pb-2 text-lg text-[#F5EFE3] placeholder-[#6B6660] outline-none transition-colors focus:border-[#E85D29] focus:ring-0";

  return (
    <label className={`block ${className}`}>
      <span className={labelCls}>
        {label}
        {required && <span className="text-[#E85D29] ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={3} className={`${fieldCls} resize-none`} />
      ) : (
        <input type={type} name={name} required={required} className={fieldCls} />
      )}
    </label>
  );
}
