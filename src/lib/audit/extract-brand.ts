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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(normalized, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        // Present as a real browser to avoid getting blocked.
        'User-Agent': 'Mozilla/5.0 (compatible; LoudFaceAuditBot/1.0; +https://loudface.co)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
    });

    if (!res.ok) {
      // Even on non-200, fall back to the domain name.
      return {
        name: humanizeDomain(domain),
        domain,
        source: 'domain-fallback',
      };
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml/i.test(contentType)) {
      return {
        name: humanizeDomain(domain),
        domain,
        source: 'domain-fallback',
      };
    }

    html = await res.text();
  } catch {
    // Timeout, DNS, TLS — fall back to the domain.
    return {
      name: humanizeDomain(domain),
      domain,
      source: 'domain-fallback',
    };
  } finally {
    clearTimeout(timeout);
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
