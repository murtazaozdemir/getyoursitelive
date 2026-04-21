import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-content-center bg-slate-50 px-6 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">We couldn&apos;t find that page.</h1>
        <p className="mt-4 text-slate-600">
          The business or page you&apos;re looking for doesn&apos;t exist on this site.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          ← Back to homepage
        </Link>
      </div>
    </main>
  );
}
