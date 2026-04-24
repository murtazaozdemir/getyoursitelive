import { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // getAllSlugs requires a D1 request context — safe at runtime, not at build.
  const slugs = await getAllSlugs().catch(() => []);

  const businessEntries = slugs.map((slug) => ({
    url: `${BASE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...businessEntries,
  ];
}
