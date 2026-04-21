import { MetadataRoute } from "next";
import { promises as fs } from "node:fs";
import { resolve } from "node:path";
import { getAllSlugs } from "@/lib/db";

// Base URL — set via env var in production, falls back to localhost in dev
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getyoursitelive.com";

async function businessLastModified(slug: string): Promise<Date> {
  try {
    const path = resolve(process.cwd(), `data/businesses/${slug}.json`);
    const stat = await fs.stat(path);
    return stat.mtime;
  } catch {
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllSlugs();

  const businessEntries = await Promise.all(
    slugs.map(async (slug) => ({
      url: `${BASE_URL}/${slug}`,
      lastModified: await businessLastModified(slug),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

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
