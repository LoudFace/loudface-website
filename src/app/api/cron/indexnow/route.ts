import { NextResponse } from 'next/server';
import { pingIndexNow, indexNowKey } from '@/lib/indexnow';

/**
 * Weekly IndexNow refresh cron.
 *
 * Day-to-day, the Sanity webhook at /api/revalidate pings IndexNow on every
 * content change. This cron is the backstop — it fetches the current sitemap
 * and re-submits the entire URL list weekly. Catches:
 *   - New top-level static pages (added in code, not Sanity)
 *   - JSON content file changes (src/data/content/*.json)
 *   - Anything else that didn't flow through a Sanity webhook
 *
 * Authentication: Vercel Cron injects `Authorization: Bearer ${CRON_SECRET}`
 * on every call. We reject anything without it.
 *
 * Schedule: configured in vercel.json. Currently weekly, Monday 04:00 UTC.
 */

const SITEMAP_URL = 'https://www.loudface.co/sitemap.xml';

export async function GET(request: Request) {
  // Vercel Cron auth — Bearer token in the Authorization header.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!indexNowKey()) {
    return NextResponse.json({ error: 'INDEXNOW_KEY not configured' }, { status: 500 });
  }

  let urls: string[];
  try {
    const xml = await fetch(SITEMAP_URL, { cache: 'no-store' }).then((r) => r.text());
    urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter(Boolean);
  } catch (err) {
    console.error('[cron/indexnow] sitemap fetch failed:', err);
    return NextResponse.json({ error: 'sitemap fetch failed' }, { status: 502 });
  }

  if (urls.length === 0) {
    return NextResponse.json({ error: 'sitemap returned 0 URLs' }, { status: 502 });
  }

  const status = await pingIndexNow(urls);
  return NextResponse.json({
    submitted: urls.length,
    indexNowStatus: status,
    sitemap: SITEMAP_URL,
  });
}
