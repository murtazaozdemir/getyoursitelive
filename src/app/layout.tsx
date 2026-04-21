import type { Metadata } from "next";
import {
  Chakra_Petch,
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

// Geist fonts — used by the per-business demo sites (inherited template default)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial fonts — used on the landing page (/) to establish craft/print identity
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Chakra Petch — mechanical/technical display font for the Industrial theme
const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Default / fallback metadata. Individual pages (root landing, [slug] demos)
// override these via their own `metadata` or `generateMetadata` exports.
export const metadata: Metadata = {
  title: {
    default: "Professional Websites for Local Businesses",
    template: "%s",
  },
  description:
    "Affordable, professionally built websites for auto repair shops, salons, restaurants, and other local businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="industrial"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSans.variable} ${jetbrainsMono.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
