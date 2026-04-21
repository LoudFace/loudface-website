/**
 * Screenshot worker — reads a plan.json, captures all screenshot shots via
 * Playwright, saves PNGs + metadata to .visuals-cache/<slug>/screenshots/.
 *
 * Results are cached by sha(sourceUrl + selector + viewport) — re-running with
 * the same inputs reuses the existing PNG. Safe to interrupt and resume.
 *
 * Usage: npx tsx scripts/visuals/screenshot.ts <slug>
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { closeBrowser, openPageSession, VIEWPORTS } from './lib/browser';
import { ShotListSchema, type CaptureSpec, type ScreenshotResult, type Viewport } from './types';

const CACHE_ROOT = path.resolve(process.cwd(), '.visuals-cache');
const SHARED_CACHE = path.join(CACHE_ROOT, '_screenshot-cache');

/**
 * Deterministic key for a capture spec. Same URL + same selector + same
 * viewport = same output, so we cache globally across articles.
 */
function captureSha(spec: CaptureSpec): string {
  const viewport = spec.viewport ?? 'desktop';
  const selector = spec.selector ?? '';
  const input = `${spec.sourceUrl}\n${selector}\n${viewport}`;
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export async function screenshotPlan(slug: string): Promise<ScreenshotResult[]> {
  const planPath = path.join(CACHE_ROOT, slug, 'plan.json');
  if (!fs.existsSync(planPath)) {
    throw new Error(`No plan found at ${planPath}. Run plan.ts first.`);
  }

  const plan = ShotListSchema.parse(JSON.parse(fs.readFileSync(planPath, 'utf-8')));
  const screenshotShots = plan.shots.filter((s) => s.type === 'screenshot');

  if (screenshotShots.length === 0) {
    console.log('→ No screenshot shots in plan. Nothing to do.');
    return [];
  }

  const outDir = path.join(CACHE_ROOT, slug, 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(SHARED_CACHE, { recursive: true });

  console.log(`→ Capturing ${screenshotShots.length} screenshots via Playwright...`);

  const results: ScreenshotResult[] = [];

  try {
    for (const shot of screenshotShots) {
      if (!shot.capture) {
        console.warn(`  ⚠  Skipping "${shot.slot}" — missing capture spec`);
        continue;
      }
      const spec = shot.capture;
      const viewport: Viewport = spec.viewport ?? 'desktop';
      const sha = captureSha(spec);
      const cachePath = path.join(SHARED_CACHE, `${sha}.png`);
      const outPath = path.join(outDir, `${shot.slot}.png`);

      process.stdout.write(`  · ${shot.slot} [${viewport}] ${spec.sourceUrl} ... `);

      let width = VIEWPORTS[viewport].width;
      let height = VIEWPORTS[viewport].height;

      if (fs.existsSync(cachePath)) {
        // Copy from global cache to per-slug output so compose.ts finds it.
        fs.copyFileSync(cachePath, outPath);
        console.log('cached ✓');
      } else {
        try {
          const dims = await captureOne(spec, outPath);
          fs.copyFileSync(outPath, cachePath);
          width = dims.width;
          height = dims.height;
          console.log(`captured ✓ (${dims.width}×${dims.height})`);
        } catch (err) {
          console.log('failed ✗');
          console.error(`    ${err instanceof Error ? err.message : err}`);
          throw err;
        }
      }

      results.push({
        slot: shot.slot,
        localPath: outPath,
        sha,
        capture: {
          sourceUrl: spec.sourceUrl,
          selector: spec.selector ?? undefined,
          viewport,
          width,
          height,
          capturedAt: new Date().toISOString(),
        },
      });
    }
  } finally {
    await closeBrowser();
  }

  const resultsPath = path.join(CACHE_ROOT, slug, 'screenshots.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`✓ Saved ${results.length} screenshots → .visuals-cache/${slug}/screenshots/`);

  return results;
}

interface CaptureDims {
  width: number;
  height: number;
}

/**
 * Google's SERP locale is driven by IP geolocation, not just the Accept-Language
 * header. Without `hl=en&gl=us` we get Spanish/French results on non-US IPs.
 * Force English/US for consistent captures across whatever network the runner
 * happens to be on.
 */
function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.endsWith('google.com') && url.pathname.startsWith('/search')) {
      if (!url.searchParams.has('hl')) url.searchParams.set('hl', 'en');
      if (!url.searchParams.has('gl')) url.searchParams.set('gl', 'us');
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Navigates to `spec.sourceUrl`, optionally waits for `spec.waitFor`, and
 * captures either the full page or a single element when `spec.selector` is
 * provided. Writes the PNG to `outPath`.
 */
async function captureOne(spec: CaptureSpec, outPath: string): Promise<CaptureDims> {
  const viewport: Viewport = spec.viewport ?? 'desktop';
  const session = await openPageSession(viewport);
  const finalUrl = normalizeUrl(spec.sourceUrl);
  try {
    // `networkidle` handles most SPAs. Fallback to `load` if a page never
    // settles within 30s — better to capture something than hang forever.
    await session.page.goto(finalUrl, {
      waitUntil: 'networkidle',
      timeout: 30_000,
    }).catch(async () => {
      await session.page.goto(finalUrl, { waitUntil: 'load', timeout: 15_000 });
    });

    if (spec.waitFor) {
      await session.page.waitForSelector(spec.waitFor, { timeout: 15_000 }).catch(() => null);
    }

    // Give streamed answers (Perplexity, AI Overviews) a beat to settle after
    // the initial networkidle fires. 1.5s is empirically enough for tokens to
    // finish rendering without making every capture slow.
    await session.page.waitForTimeout(1500);

    if (spec.selector) {
      const element = await session.page.$(spec.selector);
      if (element) {
        const box = await element.boundingBox();
        await element.screenshot({ path: outPath, type: 'png' });
        return {
          width: Math.round(box?.width ?? session.viewport.width),
          height: Math.round(box?.height ?? session.viewport.height),
        };
      }
      // Fall through to viewport capture rather than hard-failing. The planner
      // sometimes guesses selectors that don't exist on the live page; a slightly
      // wider screenshot is always more useful than a pipeline crash.
      process.stdout.write(`(selector "${spec.selector}" missed → viewport) `);
    }

    await session.page.screenshot({
      path: outPath,
      type: 'png',
      fullPage: false,
    });
    return {
      width: session.viewport.width,
      height: session.viewport.height,
    };
  } finally {
    await session.context.close();
  }
}

// ── CLI ─────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/visuals/screenshot.ts <slug>');
    process.exit(1);
  }
  try {
    await screenshotPlan(slug);
  } catch (err) {
    console.error('✗ Screenshot worker failed:');
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
