"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/ui/password-input";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const isLoading = isPending || isFetching;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsFetching(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "Something went wrong. Try again.");
      setIsFetching(false);
      return;
    }

    // Decide destination. If the caller passed an explicit `nextPath` other
    // than the generic fallback ("/admin"), honor it — they wanted a
    // specific page. Otherwise route by role: admins to the platform
    // dashboard, owners to their own shop's admin area.
    const data = await res.json().catch(() => ({})) as { user?: { role: "admin" | "owner"; ownedSlug: string | null } };
    const user = data?.user;

    // Restrict to same-origin paths only — reject protocol-relative URLs like //evil.com
    const safeNextPath =
      nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/admin";

    let destination = safeNextPath;
    if (safeNextPath === "/admin" && user) {
      destination =
        user.role === "owner" && user.ownedSlug
          ? `/${user.ownedSlug}/admin/edit`
          : "/admin";
    }

    setIsFetching(false);
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
        <PasswordInput
          autoComplete="current-password"
          required
          className="admin-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
      </label>

      <div className="admin-checkbox-row">
        <input
          id="remember-me"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          disabled={isPending}
        />
        <label htmlFor="remember-me">Remember me for 30 days</label>
      </div>

      {error && (
        <div className="admin-auth-error" role="alert">
          {error}
        </div>
      )}

      <button type="submit" className="admin-btn admin-btn--primary" disabled={isLoading}>
        {isLoading ? "Signing in\u2026" : "Sign in"}
      </button>

      <Link href="/admin/forgot-password" className="admin-auth-link">
        Forgot password?
      </Link>
    </form>
  );
}
