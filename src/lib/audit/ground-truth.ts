/**
 * Ground-truth scraper.
 *
 * Fetches the target URL and extracts the authoritative anchor we hand to the
 * LLM extraction layer — so the model can disambiguate same-name entities
 * (e.g. LoudFace.co agency vs. "LoudFace" wearable device), validate claims,
 * and stay anchored to what the site actually says about itself.
 *
 * Returns `null` if the fetch fails entirely. Individual fields may be empty
 * strings when the page lacks them — that's surfaced to the caller as a
 * `confidence` signal rather than a failure.
 */

import { cleanDomain } from './extract-brand';

export interface GroundTruth {
  url: string;
  domain: string;
  title: string;
  metaDescription: string;
  ogDescription: string;
  h1: string;
  bodyExcerpt: string;
  /** Signal for downstream prompts: "high" if we got title + description + body, else "low". */
  confidence: 'high' | 'medium' | 'low';
}

const FETCH_TIMEOUT_MS = 8000;
const BODY_EXCERPT_CHARS = 1500;

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function extractMetaContent(html: string, key: string): string {
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
  return '';
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? decodeEntities(m[1]).replace(/\s+/g, ' ').trim() : '';
}

function extractFirstH1(html: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m?.[1]) return '';
  // Strip inner tags like <span>, keep the text
  const inner = m[1].replace(/<[^>]+>/g, ' ');
  return decodeEntities(inner).replace(/\s+/g, ' ').trim();
}

function extractBodyExcerpt(html: string): string {
  // Grab the body, or fall back to the first large chunk of HTML
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = bodyMatch ? bodyMatch[1] : html;

  // Strip noise: scripts, styles, noscript, svg, templates, comments
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Strip nav/footer/header so we don't waste the excerpt on boilerplate
    .replace(/<(nav|footer|header)[\s\S]*?<\/\1>/gi, ' ');

  // Drop all remaining tags, collapse whitespace, decode entities
  const text = decodeEntities(body.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= BODY_EXCERPT_CHARS) return text;
  // Try to cut on a sentence boundary
  const cut = text.slice(0, BODY_EXCERPT_CHARS);
  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > BODY_EXCERPT_CHARS * 0.6) return cut.slice(0, lastStop + 1);
  return cut + '…';
}

function scoreConfidence(
  title: string,
  description: string,
  body: string,
): 'high' | 'medium' | 'low' {
  let score = 0;
  if (title.length >= 5) score++;
  if (description.length >= 30) score++;
  if (body.length >= 400) score++;
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Fetch the URL and return the structured ground-truth anchor.
 * Returns `null` only if the fetch fails outright — a partial response still
 * returns a GroundTruth with empty fields and a "low" confidence tag.
 */
export async function scrapeGroundTruth(url: string): Promise<GroundTruth | null> {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = `https://${normalized}`;

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
        'User-Agent': 'Mozilla/5.0 (compatible; LoudFaceAuditBot/1.0; +https://loudface.co)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
      },
    });

    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml/i.test(contentType)) return null;

    html = await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  const headMatch = html.match(/<head[\s\S]*?<\/head>/i);
  const head = headMatch ? headMatch[0] : html.slice(0, 50000);

  const title = extractTitle(head);
  const metaDescription = extractMetaContent(head, 'description');
  const ogDescription =
    extractMetaContent(head, 'og:description') ||
    extractMetaContent(head, 'twitter:description');
  const h1 = extractFirstH1(html);
  const bodyExcerpt = extractBodyExcerpt(html);

  const confidence = scoreConfidence(
    title,
    metaDescription || ogDescription,
    bodyExcerpt,
  );

  return {
    url: normalized,
    domain,
    title,
    metaDescription,
    ogDescription,
    h1,
    bodyExcerpt,
    confidence,
  };
}

/**
 * Format a ground-truth object as a prompt-ready context block.
 * Kept deterministic so the LLM extraction layer can feed it into system/user prompts.
 */
export function formatGroundTruthForPrompt(gt: GroundTruth): string {
  const lines: string[] = [];
  lines.push(`URL: ${gt.url}`);
  lines.push(`Domain: ${gt.domain}`);
  if (gt.title) lines.push(`Title: ${gt.title}`);
  if (gt.metaDescription) lines.push(`Meta description: ${gt.metaDescription}`);
  if (gt.ogDescription && gt.ogDescription !== gt.metaDescription) {
    lines.push(`Open Graph description: ${gt.ogDescription}`);
  }
  if (gt.h1) lines.push(`H1: ${gt.h1}`);
  if (gt.bodyExcerpt) lines.push(`Body excerpt:\n${gt.bodyExcerpt}`);
  return lines.join('\n');
}
