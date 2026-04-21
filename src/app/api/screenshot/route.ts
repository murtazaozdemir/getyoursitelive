import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer-core";

// Give Vercel enough time to download Chromium + navigate + screenshot
export const maxDuration = 60;

// CSS selector for each named section of the business site
const SECTION_SELECTORS: Record<string, string> = {
  hero: "#home",
  services: "#services",
  contact: "#contact",
};

const PAGE_WIDTH = 1280;

// Vercel's filesystem is read-only except /tmp — write cache there in prod
const CACHE_DIR = process.env.VERCEL
  ? join("/tmp", "proposal-screenshots")
  : join(process.cwd(), "public", "proposal-screenshots");

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const section = searchParams.get("section") ?? "hero";

  if (!slug || !(section in SECTION_SELECTORS)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Serve from cache if available (avoids re-launching Chrome)
  const cacheDir = join(CACHE_DIR, slug);
  const cachePath = join(cacheDir, `${section}.png`);
  if (existsSync(cachePath)) {
    const cached = readFileSync(cachePath);
    return new NextResponse(cached, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const targetUrl = `${siteUrl}/${slug}`;
  const selector = SECTION_SELECTORS[section];

  // Pick the right Chromium executable
  let executablePath: string;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // Vercel: download Chromium from CDN into /tmp at runtime
    const chromium = (await import("@sparticuz/chromium-min")).default;
    executablePath = await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    );
  } else {
    // Local Mac
    executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: PAGE_WIDTH, height: 900 });
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for the target section then screenshot its exact bounding box
    await page.waitForSelector(selector, { timeout: 5000 });
    const element = await page.$(selector);
    if (!element) {
      return new NextResponse("Section not found", { status: 404 });
    }

    const buf = await element.screenshot({ type: "png" });

    // Cache for subsequent requests
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, buf as Buffer);

    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("[screenshot] failed:", err);
    return new NextResponse("Screenshot failed", { status: 500 });
  } finally {
    await browser?.close();
  }
}
