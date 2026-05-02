import type { Metadata } from "next";
import { LandingPageClient } from "@/components/landing-page-client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export const metadata: Metadata = {
  title: "Website Design Services — Get Your Site Live",
  description:
    "Professional website design for local businesses — auto shops, barbershops, restaurants, and more. Your own .com domain, mobile-ready, fully customizable. One flat fee, no monthly costs.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Website Design Services — Get Your Site Live",
    description: "Professional website design for local businesses. Your own .com, mobile-ready, fully customizable. One flat fee, yours forever.",
    url: BASE_URL,
    type: "website",
    siteName: "Get Your Site Live",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Design Services — Get Your Site Live",
    description: "Professional website design for local businesses. Your own .com, mobile-ready, fully customizable. One flat fee, yours forever.",
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
