import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-content-center bg-[var(--bg)] px-6 text-center text-[var(--text)]">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">404</p>
        <h1 className="mt-2 text-4xl font-bold">We couldn&apos;t find that page.</h1>
        <p className="mt-4 text-[var(--muted)]">
          The business or page you&apos;re looking for doesn&apos;t exist on this site.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          ← Back to homepage
        </Link>
      </div>
    </main>
  );
}
