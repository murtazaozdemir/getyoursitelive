import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Precision Auto Care | Expert Auto Repair in Springfield",
  description:
    "Family-owned auto repair shop since 2009. Same-day service, transparent pricing, and ASE-certified technicians in Springfield, IL.",
  keywords: ["auto repair springfield", "brake repair", "oil change", "diagnostic service", "transmission repair"],
  openGraph: {
    title: "Precision Auto Care",
    description: "Expert hands. Honest service. Since 2009.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Precision Auto Care",
    description: "Expert hands. Honest service. Since 2009.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
