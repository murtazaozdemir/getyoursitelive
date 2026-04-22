"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Always show the same message regardless of whether the email exists.
      // This prevents leaking which addresses are registered.
      setSubmitted(true);
    });
  }

  if (submitted) {
    return (
      <div className="admin-section">
        <p className="admin-lede">
          If that email is registered, a reset link has been sent. Check your inbox.
        </p>
        <Link href="/admin/login" className="admin-auth-link">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
      <label className="admin-field">
        <span className="admin-field-label">Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          className="admin-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isPending}
          placeholder="you@example.com"
        />
      </label>

      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={isPending || !email.trim()}
      >
        {isPending ? "Sending\u2026" : "Send reset link"}
      </button>

      <Link href="/admin/login" className="admin-auth-link">
        Back to sign in
      </Link>
    </form>
  );
}
