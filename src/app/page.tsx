import type { Metadata } from "next";
import { LandingPageClient } from "@/components/landing-page-client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export const metadata: Metadata = {
  title: "Get Your Site Live — Websites for Local Business",
  description:
    "Professionally built websites for auto repair shops, salons, restaurants, and other local businesses. Flat fee, no monthly fees, yours forever.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Get Your Site Live — Websites for Local Business",
    description: "Professionally built websites for local businesses. Flat fee, no monthly fees, yours forever.",
    url: BASE_URL,
    type: "website",
    siteName: "Get Your Site Live",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Your Site Live — Websites for Local Business",
    description: "Professionally built websites for local businesses. Flat fee, no monthly fees.",
  },
};

export const dynamic = "force-static";

export default function LandingPage() {
  return (
    <LandingPageClient
      year={new Date().getFullYear()}
    />
  );
}
