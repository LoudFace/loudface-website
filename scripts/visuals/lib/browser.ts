/**
 * Playwright launcher for the screenshot worker.
 *
 * Keeps a single browser instance alive across all captures in a run.
 * Exposes viewport presets that map to the `Viewport` enum in types.ts,
 * plus a helper that gets a fresh page with sane defaults for a capture.
 */

import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';
import type { Viewport } from '../types';

interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
  userAgent: string;
}

const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1';

/**
 * Viewport presets. The deviceScaleFactor of 2 keeps screenshots retina-crisp
 * — important because the blog renders hero-width at up to 1200px and an
 * unscaled 1440px capture would look soft on high-density screens.
 */
export const VIEWPORTS: Record<Viewport, ViewportConfig> = {
  desktop: {
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
    userAgent: DESKTOP_UA,
  },
  tablet: {
    width: 1024,
    height: 768,
    deviceScaleFactor: 2,
    userAgent: DESKTOP_UA,
  },
  mobile: {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    userAgent: MOBILE_UA,
  },
};

let cachedBrowser: Browser | null = null;

/**
 * Returns a shared headless browser instance, launching one on first call.
 * Callers must eventually invoke `closeBrowser()` to release resources.
 *
 * Throws a clear, actionable error if Chromium isn't installed on the machine
 * — this is the #1 failure mode on a fresh clone, since `npm install` alone
 * doesn't pull down browser binaries.
 */
export async function getBrowser(): Promise<Browser> {
  if (cachedBrowser && cachedBrowser.isConnected()) return cachedBrowser;
  try {
    cachedBrowser = await chromium.launch({
      headless: true,
      // Common flags that help with bot-detection on fingerprinted targets
      // without needing a full stealth plugin. Good enough for the sites we
      // target (public pages + Perplexity). If we ever need authenticated
      // ChatGPT/Claude/Gemini, move to a hosted browser service.
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-features=IsolateOrigins,site-per-process',
        '--no-sandbox',
      ],
    });
    return cachedBrowser;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Playwright's own "Executable doesn't exist" error is cryptic and buries
    // the fix. Re-throw with a clear one-line remedy so the user knows what
    // to do even on their first-ever visuals run.
    if (msg.includes("Executable doesn't exist") || msg.includes('browserType.launch')) {
      throw new Error(
        `Playwright Chromium binary not installed. Run: npm run visuals:setup\n(Original error: ${msg})`,
      );
    }
    throw err;
  }
}

export async function closeBrowser(): Promise<void> {
  if (cachedBrowser) {
    await cachedBrowser.close().catch(() => null);
    cachedBrowser = null;
  }
}

export interface PageSession {
  context: BrowserContext;
  page: Page;
  viewport: ViewportConfig;
}

/**
 * Opens a fresh incognito context + page configured for a given viewport.
 * Always dispose with `session.context.close()` once the capture is done so
 * cookies from one target never contaminate the next.
 */
export async function openPageSession(viewport: Viewport = 'desktop'): Promise<PageSession> {
  const browser = await getBrowser();
  const config = VIEWPORTS[viewport];
  const context = await browser.newContext({
    viewport: { width: config.width, height: config.height },
    deviceScaleFactor: config.deviceScaleFactor,
    userAgent: config.userAgent,
    // Dismiss most cookie banners/notifications prompts before they bite.
    // Locale matters because some AI engines serve region-specific UIs.
    locale: 'en-US',
    timezoneId: 'America/New_York',
    // Without this header Google serves a Spanish/French consent modal
    // over every SERP, regardless of `locale`. Setting Accept-Language
    // explicitly gets us the English page Google shows to US visitors.
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  // Pre-accept Google's EU cookie consent so SERPs render clean. Without this,
  // the first time Chromium hits google.com it gets a full-screen consent modal
  // (even on en-US locale). These cookie values are the "accept all" response
  // from a real session — setting them before navigation skips the modal.
  await context.addCookies([
    {
      name: 'CONSENT',
      value: 'YES+cb.20210328-17-p0.en+F+678',
      domain: '.google.com',
      path: '/',
    },
    {
      name: 'SOCS',
      value: 'CAESHAgBEhJnd3NfMjAyMzA2MjctMF9SQzIaAmVuIAEaBgiA_eSaBg',
      domain: '.google.com',
      path: '/',
    },
  ]);

  const page = await context.newPage();
  return { context, page, viewport: config };
}
