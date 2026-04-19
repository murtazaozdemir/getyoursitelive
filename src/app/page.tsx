import { HomePage } from "@/components/site/home-page";

export default function Home() {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "Precision Auto Care",
    telephone: "(555) 832-4826",
    email: "service@precisionautocare.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1234 Main Street",
      addressLocality: "Springfield",
      addressRegion: "IL",
      postalCode: "62701",
      addressCountry: "US",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Do I need an appointment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Appointments are recommended, but we do accept same-day walk-ins based on bay availability.",
        },
      },
      {
        "@type": "Question",
        name: "How long do repairs typically take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most standard services are completed the same day, and complex repairs are usually done within 24 to 48 hours.",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomePage />
    </>
  );
}
