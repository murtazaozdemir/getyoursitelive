import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

// CSS selector for each named section of the business site.
// null = capture the full viewport (no element pick), e.g. hero includes the nav bar.
const SECTION_SELECTORS: Record<string, string | null> = {
  hero: null,        // full viewport — includes header/nav
  services: "#services",
  contact: "#contact",
};

const PAGE_WIDTH = 1280;

// Vercel filesystem is read-only except /tmp
const CACHE_DIR = process.env.VERCEL
  ? join("/tmp", "proposal-screenshots")
  : join(process.cwd(), "public", "proposal-screenshots");

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const section = searchParams.get("section") ?? "hero";

  if (!slug || !/^[a-z0-9-]+$/.test(slug) || !(section in SECTION_SELECTORS)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  // Serve from cache if available
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

  // On Vercel (Hobby plan = 10s timeout, can't run Chrome locally):
  // proxy to the gysl-screenshots Fly.io service instead.
  const screenshotServiceUrl = process.env.SCREENSHOT_SERVICE_URL;
  if (screenshotServiceUrl) {
    return proxyToService(screenshotServiceUrl, targetUrl, selector, cacheDir, cachePath);
  }

  // Local dev: run Chrome directly via puppeteer-core
  return runLocally(targetUrl, selector, cacheDir, cachePath);
}

async function proxyToService(
  serviceUrl: string,
  targetUrl: string,
  selector: string | null,
  cacheDir: string,
  cachePath: string,
): Promise<NextResponse> {
  try {
    const params = new URLSearchParams({ url: targetUrl, width: String(PAGE_WIDTH) });
    if (selector) params.set("pick", selector);
    const res = await fetch(`${serviceUrl}/screenshot?${params}`, {
      signal: AbortSignal.timeout(55_000),
    });
    if (!res.ok) {
      console.error("[screenshot] service returned", res.status);
      return new NextResponse("Screenshot failed", { status: 500 });
    }
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, buf);
    return new NextResponse(buf, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("[screenshot] proxy failed:", err);
    return new NextResponse("Screenshot failed", { status: 500 });
  }
}

async function runLocally(
  targetUrl: string,
  selector: string | null,
  cacheDir: string,
  cachePath: string,
): Promise<NextResponse> {
  const executablePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
    let buf: Buffer | Uint8Array;
    if (!selector) {
      buf = await page.screenshot({ type: "png" }) as Buffer;
    } else {
      await page.waitForSelector(selector, { timeout: 5000 });
      const element = await page.$(selector);
      if (!element) {
        return new NextResponse("Section not found", { status: 404 });
      }
      buf = await element.screenshot({ type: "png" }) as Buffer;
    }
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, buf as Buffer);
    return new NextResponse(buf as unknown as BodyInit, {
      headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" },
    });
  } catch (err) {
    console.error("[screenshot] local puppeteer failed:", err);
    return new NextResponse("Screenshot failed", { status: 500 });
  } finally {
    await browser?.close();
  }
}
