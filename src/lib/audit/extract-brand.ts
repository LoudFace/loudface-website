/**
 * Server-side brand extractor.
 * Given a URL, fetch the page and extract the brand/company name in priority order:
 *   1. JSON-LD Organization schema `name`
 *   2. `og:site_name` meta tag
 *   3. `<title>` tag (strip common suffixes like " | Acme" or " - Acme")
 *   4. Humanized domain fallback (e.g. "loudface.co" → "Loudface")
 *
 * Also returns the cleaned domain (no protocol, no www, no path).
 * Returns `null` if the URL doesn't resolve or returns non-HTML.
 */

export interface ExtractedBrand {
  name: string;
  domain: string;
  source: 'json-ld' | 'og-site-name' | 'title' | 'domain-fallback';
}

const FETCH_TIMEOUT_MS = 8000;

/**
 * Bot-flagged User-Agents are rejected by Cloudflare/Akamai-fronted sites
 * (e.g. warbyparker.com returns 403). Pretend to be a desktop Chrome so we
 * get real HTML back. A concatenated "Warbyparker" fallback breaks the whole
 * audit when the LLMs don't recognize the malformed name.
 */
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const BROWSER_ACCEPT =
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8';

/**
 * Fetch HTML from the target URL. Tries the requested URL first, then falls
 * back to the `www.` variant on non-ok responses (some origins redirect
 * apex → www only for browsers, not for arbitrary bots).
 * Returns `null` if both attempts fail.
 */
export async function fetchHtml(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<string | null> {
  const tryOnce = async (target: string): Promise<string | null> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(target, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': BROWSER_UA,
          Accept: BROWSER_ACCEPT,
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') ?? '';
      if (!/text\/html|application\/xhtml/i.test(contentType)) return null;
      return await res.text();
    } catch {
      return null;
    } finally {
      clearTimeout(timeout);
    }
  };

  const html = await tryOnce(url);
  if (html) return html;

  // Retry with the www. variant if the first try failed. Many origins block
  // bare-domain bot requests but allow the www. subdomain, or vice-versa.
  try {
    const u = new URL(url);
    if (!u.hostname.startsWith('www.')) {
      u.hostname = `www.${u.hostname}`;
      return await tryOnce(u.toString());
    }
    u.hostname = u.hostname.replace(/^www\./, '');
    return await tryOnce(u.toString());
  } catch {
    return null;
  }
}

/** Strip protocol, www, and path from a URL to return a bare domain. */
export function cleanDomain(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();
}

/** Capitalize a domain segment as a fallback brand name. */
function humanizeDomain(domain: string): string {
  const root = domain.split('.')[0];
  if (!root) return domain;
  return root
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Extract a brand name from a `<title>` tag by trimming common suffix patterns. */
function cleanTitle(rawTitle: string): string {
  const decoded = decodeEntities(rawTitle).trim();
  // Split on common separators and pick the shortest meaningful segment.
  // "Acme | Home" → "Acme", "Home — Acme" → "Acme"
  const segments = decoded
    .split(/[|\u2013\u2014–—·•]| - /)
    .map((s) => s.trim())
    .filter(Boolean);

  if (segments.length === 0) return decoded;
  if (segments.length === 1) return segments[0];

  // Heuristic: the brand name is usually the shortest segment, and often at the end.
  // Prefer the last segment if it's short (likely brand), otherwise the first.
  const last = segments[segments.length - 1];
  const first = segments[0];
  if (last.length <= 30 && last.split(/\s+/).length <= 4) return last;
  return first;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

/** Pull the first JSON-LD Organization (or subtype) name from HTML. */
function extractJsonLdOrgName(html: string): string | null {
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const orgTypes = new Set([
    'Organization', 'Corporation', 'LocalBusiness', 'OnlineBusiness',
    'OnlineStore', 'NewsMediaOrganization', 'EducationalOrganization',
    'GovernmentOrganization', 'NGO', 'MedicalOrganization',
    'ProfessionalService', 'Restaurant', 'Store', 'WebSite',
  ]);

  for (const match of html.matchAll(scriptRe)) {
    const raw = match[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      // Also check @graph
      const expanded = nodes.flatMap((n: unknown) => {
        if (n && typeof n === 'object' && '@graph' in n && Array.isArray((n as { '@graph': unknown[] })['@graph'])) {
          return (n as { '@graph': unknown[] })['@graph'];
        }
        return [n];
      });

      for (const node of expanded) {
        if (!node || typeof node !== 'object') continue;
        const typed = node as { '@type'?: string | string[]; name?: string; legalName?: string };
        const type = typed['@type'];
        const types = Array.isArray(type) ? type : type ? [type] : [];
        const isOrg = types.some((t) => orgTypes.has(t));
        if (!isOrg) continue;
        const name = typed.legalName || typed.name;
        if (name && typeof name === 'string' && name.trim().length > 0) {
          return decodeEntities(name).trim();
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks
      continue;
    }
  }
  return null;
}

/** Pull meta content for a given property or name attribute. */
function extractMeta(html: string, key: string): string | null {
  // Match <meta property="og:site_name" content="X"> or <meta name="X" content="Y">
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["']`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]).trim();
  }
  return null;
}

function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? m[1].trim() : null;
}

/**
 * Fetch a URL and extract the brand identity.
 * Returns null if fetch fails or the response is not HTML.
 */
export async function extractBrandFromUrl(
  url: string,
): Promise<ExtractedBrand | null> {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  const domain = cleanDomain(normalized);
  if (!domain || !domain.includes('.')) return null;

  const html = await fetchHtml(normalized);
  if (!html) {
    return {
      name: humanizeDomain(domain),
      domain,
      source: 'domain-fallback',
    };
  }

  // Only look at the <head> for performance and to avoid false positives from body content.
  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const searchSpace = headMatch ? headMatch[0] : html.slice(0, 50000);

  // 1. JSON-LD
  const jsonLdName = extractJsonLdOrgName(searchSpace);
  if (jsonLdName) {
    return { name: jsonLdName, domain, source: 'json-ld' };
  }

  // 2. og:site_name
  const ogSiteName = extractMeta(searchSpace, 'og:site_name');
  if (ogSiteName) {
    return { name: ogSiteName, domain, source: 'og-site-name' };
  }

  // 3. application-name meta
  const appName = extractMeta(searchSpace, 'application-name');
  if (appName) {
    return { name: appName, domain, source: 'og-site-name' };
  }

  // 4. <title> tag
  const title = extractTitle(searchSpace);
  if (title) {
    const cleaned = cleanTitle(title);
    if (cleaned && cleaned.length >= 2 && cleaned.length <= 60) {
      return { name: cleaned, domain, source: 'title' };
    }
  }

  // 5. Humanized domain fallback
  return {
    name: humanizeDomain(domain),
    domain,
    source: 'domain-fallback',
  };
}

// ─── LLM-based brand normalization for bot-blocked sites ────────────

import { z } from 'zod';
import { extractStructured } from './extract-structured';

const BrandNormalizationSchema = z.object({
  brand_name: z
    .string()
    .describe('The real-world brand name for this website, formatted as it would appear in marketing materials. 1–5 words. Examples: "Warby Parker", "Stitch Fix", "PillPack", "Notion", "Stripe". If truly unknown, echo the domain root capitalized.'),
  confidence: z.enum(['high', 'medium', 'low']).describe('How confident you are about this normalization.'),
});

/**
 * Some origins (Cloudflare/Akamai-fronted) block our bot UA with 403, so the
 * extractor lands on `domain-fallback` and returns a concatenated root like
 * "Warbyparker". That name torpedoes every downstream LLM query. This repair
 * step asks Haiku to normalize the domain into a real brand name — cheap
 * (< $0.001) and fast (~1s). Fails silently if the call errors out; the
 * original fallback name is kept.
 *
 * Only runs when:
 *   - the extractor landed on `domain-fallback`, AND
 *   - the root is 7+ characters with no separators (likely concatenated).
 * Single-word short roots like "nike.com" or "stripe.com" don't need this.
 */
export async function normalizeBrandName(extracted: ExtractedBrand): Promise<ExtractedBrand> {
  if (extracted.source !== 'domain-fallback') return extracted;

  const root = extracted.domain.split('.')[0] ?? '';
  if (root.length < 7) return extracted;
  if (/[-_]/.test(root)) return extracted; // already has separators — humanizeDomain did its job
  if (/\d/.test(root)) return extracted; // has digits — probably already a product code

  const result = await extractStructured({
    schema: BrandNormalizationSchema,
    system:
      'You are a brand-name normalizer. Given a concatenated domain name, return the real-world brand as humans write it. Only answer if you are reasonably sure. If the domain is obscure or ambiguous, return the input unchanged and set confidence to low.',
    prompt: [
      `Domain: ${extracted.domain}`,
      `Current guess: ${extracted.name}`,
      '',
      'Examples of what I need:',
      '- warbyparker.com → "Warby Parker"',
      '- stitchfix.com → "Stitch Fix"',
      '- pillpack.com → "PillPack"',
      '- bluebottlecoffee.com → "Blue Bottle Coffee"',
      '- notion.so → "Notion"',
      '- stripe.com → "Stripe"',
      '',
      'Return the real brand name.',
    ].join('\n'),
    model: 'anthropic/claude-haiku-4.5',
    maxOutputTokens: 128,
    temperature: 0,
  });

  if (!result.value || result.value.confidence === 'low') return extracted;

  const normalized = result.value.brand_name.trim();
  if (!normalized || normalized.length < 2 || normalized.length > 60) return extracted;
  if (normalized.toLowerCase() === extracted.name.toLowerCase()) return extracted;

  return {
    name: normalized,
    domain: extracted.domain,
    source: extracted.source,
  };
}
