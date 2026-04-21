import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer-core";

// Y-offsets (px from top) for each section of the business site
const SECTION_OFFSETS: Record<string, number> = {
  hero: 0,
  services: 2050,
  team: 3200,
};

const CROP_HEIGHT = 700;
const PAGE_WIDTH = 1200;
const PAGE_HEIGHT = 5000;
const CACHE_DIR = join(process.cwd(), "public", "proposal-screenshots");

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const section = searchParams.get("section") ?? "hero";

  if (!slug || !(section in SECTION_OFFSETS)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Serve from disk cache if available (avoids re-launching Chrome)
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
  const yOffset = SECTION_OFFSETS[section];

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
    await page.setViewport({ width: PAGE_WIDTH, height: PAGE_HEIGHT });
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 20000 });

    const buf = await page.screenshot({
      type: "png",
      clip: { x: 0, y: yOffset, width: PAGE_WIDTH, height: CROP_HEIGHT },
    });

    // Cache to disk for subsequent requests
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
