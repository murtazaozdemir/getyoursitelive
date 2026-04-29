import type { Metadata } from "next";
import { AboutPageClient } from "./about-client";

export const metadata: Metadata = {
  title: "About Us — SALESFORCE HUB LLC",
  description:
    "SALESFORCE HUB LLC is a New Jersey based company specializing in developing computer applications for small businesses.",
};

export const dynamic = "force-static";

export default function AboutPage() {
  return <AboutPageClient year={new Date().getFullYear()} />;
}
