export const runtime = "edge";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBusinessBySlug } from "@/lib/db";
import { BusinessProvider } from "@/lib/business-context";
import { HomePage } from "@/components/site/home-page";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

// All business pages are server-rendered on demand (no static generation).
// Cloudflare Pages does not support ISR, and D1 bindings are only available
// at request time — not during the build step.
export const dynamic = "force-dynamic";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Extract "City, ST" from a full address string. */
function cityFromAddress(address: string): string {
  // "123 Bird Street, Clifton, NJ 07011" → "Clifton, NJ"
  const parts = address.split(",").map((s) => s.trim());
  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1].replace(/\d{5}(-\d{4})?$/, "").trim();
    return `${parts[parts.length - 2]}, ${stateZip}`.replace(/,\s*$/, "");
  }
  return address;
}

/** Build the LocalBusiness + FAQPage JSON-LD for a business. */
function buildJsonLd(biz: NonNullable<Awaited<ReturnType<typeof getBusinessBySlug>>>) {
  const { name, phone, address, email } = biz.businessInfo;
  const pageUrl = `${BASE_URL}/${biz.slug}`;

  const openingHours = Object.entries(biz.hoursSchedule)
    .filter(([, day]) => day !== null)
    .map(([dayKey, day]) => {
      const dayMap: Record<string, string> = {
        mon: "Mo", tue: "Tu", wed: "We", thu: "Th",
        fri: "Fr", sat: "Sa", sun: "Su",
      };
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${
          { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
            fri: "Friday", sat: "Saturday", sun: "Sunday" }[dayKey]
        }`,
        opens: (day as { open: string; close: string }).open,
        closes: (day as { open: string; close: string }).close,
      };
    });

  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name,
    url: pageUrl,
    telephone: phone,
    email,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.split(",")[0]?.trim() ?? address,
      addressLocality: address.split(",")[1]?.trim() ?? "",
      addressRegion: address.split(",")[2]?.replace(/\d{5}(-\d{4})?/, "").trim() ?? "",
      postalCode: address.match(/\d{5}(-\d{4})?/)?.[0] ?? "",
      addressCountry: "US",
    },
    openingHoursSpecification: openingHours,
    ...(biz.hero.heroImage ? { image: biz.hero.heroImage } : {}),
  };

  if (biz.faqs.length === 0) return [localBusiness];

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: biz.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return [localBusiness, faqPage];
}

// ---------------------------------------------------------------
// Per-business metadata
// ---------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const biz = await getBusinessBySlug(slug);
  if (!biz) return { title: "Not Found" };

  const { name, phone, address, tagline } = biz.businessInfo;
  const city = cityFromAddress(address);
  const category = biz.category ?? "Auto Repair";
  const pageUrl = `${BASE_URL}/${slug}`;

  const title = `${category} in ${city} | ${name}`;
  const description =
    `Trusted ${category.toLowerCase()} in ${city} since ${biz.businessInfo.founded}. ` +
    `${biz.services.slice(0, 3).map((s) => s.name).join(", ")} & more. ` +
    `Fair prices, reliable service. Call ${phone}.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "website",
      siteName: name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ---------------------------------------------------------------
// Page component
// ---------------------------------------------------------------

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);

  if (!business) notFound();

  const jsonLd = buildJsonLd(business);

  return (
    <BusinessProvider business={business}>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data, not user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <HomePage />
    </BusinessProvider>
  );
}
