"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Reset failed. The link may have expired.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    });
  }

  if (success) {
    return (
      <p className="admin-lede">
        Password updated. Redirecting to sign in\u2026
      </p>
    );
  }

  return (
    <form className="admin-auth-form" onSubmit={handleSubmit} noValidate>
      <label className="admin-field">
        <span className="admin-field-label">New password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
          minLength={8}
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Confirm new password</span>
        <input
          type="password"
          autoComplete="new-password"
          required
          className="admin-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={isPending}
        />
      </label>

      {error && (
        <div className="admin-auth-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={isPending || !password || !confirm}
      >
        {isPending ? "Updating\u2026" : "Update password"}
      </button>
    </form>
  );
}
