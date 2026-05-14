import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { pingIndexNow } from '@/lib/indexnow';

/**
 * Sanity webhook → on-demand ISR.
 *
 * Without this, content edits in Studio surface only after the 60s ISR window
 * elapses. With this route + a Sanity GROQ-Powered Webhook pointed at
 * https://www.loudface.co/api/revalidate, edits propagate within a few seconds.
 *
 * Sanity sends `sanity-webhook-signature: t=<unix-ms>,v1=<base64url-hmac>`.
 * The HMAC is sha256 of `${timestamp}.${rawBody}` with the shared secret.
 * The body itself is whatever projection you configure in the Studio webhook
 * settings; we expect at least `_type` and `slug` (top-level or nested).
 *
 * To configure in Sanity Studio:
 *   - Add GROQ-Powered Webhook on the project
 *   - URL: https://www.loudface.co/api/revalidate
 *   - Dataset: production
 *   - Trigger: Create, Update, Delete
 *   - Filter: _type in ["blogPost","caseStudy","teamMember","testimonial","client","blogFaq","seoPage","industry","serviceCategory","category","technology"]
 *   - Projection: { _type, "slug": slug.current }
 *   - Secret: same value as SANITY_WEBHOOK_SECRET env var on Vercel
 */

type SanityPayload = {
  _type?: string;
  slug?: string | { current?: string };
};

function verifySanitySignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  // Parse "t=<ts>,v1=<sig>"
  const parts = Object.fromEntries(
    header.split(',').map((seg) => seg.trim().split('=') as [string, string])
  );
  const ts = parts.t;
  const sig = parts.v1;
  if (!ts || !sig) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}.${rawBody}`)
    .digest('base64url');

  if (expected.length !== sig.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}

function pathsFor(type: string | undefined, slug: string | undefined): string[] {
  // Always invalidate the LLM indexes — they aggregate all content.
  const always = ['/llms.txt', '/llms-full.txt', '/sitemap.xml'];

  switch (type) {
    case 'blogPost':
      return [...always, '/', '/blog', slug ? `/blog/${slug}` : null].filter(Boolean) as string[];
    case 'caseStudy':
      return [...always, '/', '/case-studies', slug ? `/case-studies/${slug}` : null].filter(Boolean) as string[];
    case 'teamMember':
      return [...always, '/about', slug ? `/team/${slug}` : null].filter(Boolean) as string[];
    case 'testimonial':
    case 'client':
    case 'blogFaq':
      return [...always, '/', '/about'];
    case 'seoPage':
    case 'industry':
      return [...always, '/', '/seo-for', slug ? `/seo-for/${slug}` : null].filter(Boolean) as string[];
    case 'serviceCategory':
      return [...always, '/', slug ? `/services/${slug}` : null].filter(Boolean) as string[];
    case 'category':
    case 'technology':
      return [...always, '/', '/blog', '/case-studies'];
    default:
      // Unknown type: fall back to a homepage purge — cheap, safe.
      return [...always, '/'];
  }
}

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[sanity-revalidate] SANITY_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('sanity-webhook-signature');

  if (!verifySanitySignature(rawBody, signature, secret)) {
    console.warn('[sanity-revalidate] invalid signature');
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let body: SanityPayload;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const slug = typeof body.slug === 'string' ? body.slug : body.slug?.current;
  const paths = pathsFor(body._type, slug);

  for (const p of paths) revalidatePath(p);

  // Push the changed paths to IndexNow so Bing/Yandex/ChatGPT-search re-crawl
  // within minutes. Excludes the LLM index files (they're not in any sitemap).
  const indexable = paths.filter((p) => !p.startsWith('/llms') && !p.startsWith('/sitemap'));
  const indexNowStatus = await pingIndexNow(indexable);

  return NextResponse.json({
    revalidated: true,
    type: body._type ?? null,
    slug: slug ?? null,
    paths,
    indexNowStatus,
  });
}
