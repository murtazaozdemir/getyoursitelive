"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Try again.");
      return;
    }

    // Decide destination. If the caller passed an explicit `nextPath` other
    // than the generic fallback ("/admin"), honor it — they wanted a
    // specific page. Otherwise route by role: admins to the platform
    // dashboard, owners to their own shop's admin area.
    const data = await res.json().catch(() => ({}));
    const user = data?.user as
      | { role: "admin" | "owner"; ownedSlug: string | null }
      | undefined;

    let destination = nextPath;
    if (nextPath === "/admin" && user) {
      destination =
        user.role === "owner" && user.ownedSlug
          ? `/${user.ownedSlug}/admin/edit`
          : "/admin";
    }

    startTransition(() => {
      router.push(destination);
      router.refresh();
    });
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
        />
      </label>

      <label className="admin-field">
        <span className="admin-field-label">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </label>

      {error && (
        <div className="admin-auth-error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={isPending}>
        {isPending ? "Signing in\u2026" : "Sign in"}
      </button>
    </form>
  );
}
