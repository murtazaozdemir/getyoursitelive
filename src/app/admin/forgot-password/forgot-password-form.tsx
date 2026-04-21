"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({})) as { token?: string | null };

      setSubmitted(true);

      if (data.token) {
        setResetUrl(`${window.location.origin}/admin/reset-password?token=${data.token}`);
      }
    });
  }

  if (submitted) {
    return (
      <div className="admin-section">
        <p className="admin-lede">
          If that email is registered, a reset link will appear below.
        </p>
        {resetUrl && (
          <div className="admin-reset-link-box">
            <p className="admin-reset-link-label">Your reset link:</p>
            <a href={resetUrl} className="admin-reset-link-url">{resetUrl}</a>
          </div>
        )}
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
